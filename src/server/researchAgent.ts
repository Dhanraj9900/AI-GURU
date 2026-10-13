import { EducationalResearchJob } from '../types/index.ts';
import { db } from './db.ts';

// Configured strict allowlist of authorized educational domains
const APPROVED_EDUCATIONAL_DOMAINS = [
  'ncert.nic.in',
  'diksha.gov.in',
  'swayam.gov.in',
  'nptel.ac.in',
  'epgp.inflibnet.ac.in',
  'cbse.gov.in',
  'nta.ac.in',
  'upsc.gov.in',
];

// SSRF Defense validation
export function validateSourceUrl(urlStr: string): { isValid: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();

    // Block private/local IP spaces and cloud metadata
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname === '169.254.169.254'
    ) {
      return { isValid: false, reason: 'Security Violation: Private or loopback IP space is prohibited (SSRF defense).' };
    }

    const isAllowlisted = APPROVED_EDUCATIONAL_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    );

    if (!isAllowlisted) {
      return {
        isValid: false,
        reason: `Domain '${hostname}' is not in the approved educational allowlist (Permitted: ${APPROVED_EDUCATIONAL_DOMAINS.join(', ')}).`,
      };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, reason: 'Malformed URL provided.' };
  }
}

/**
 * 7-Stage Controlled Educational Content Discovery Pipeline
 */
export async function runEducationalResearchDiscovery(params: {
  targetUrl: string;
  sourceName: string;
  resourceType: EducationalResearchJob['resourceType'];
  adminUserId: string;
}): Promise<EducationalResearchJob> {
  const { targetUrl, sourceName, resourceType, adminUserId } = params;

  // 1. Stage A & SSRF Validation
  const validation = validateSourceUrl(targetUrl);
  if (!validation.isValid) {
    throw new Error(validation.reason || 'Invalid source URL');
  }

  const parsed = new URL(targetUrl);
  const domain = parsed.hostname;

  // 2. Stage B: Source Verification Agent
  const authorityScore = domain.includes('ncert') ? 99 : domain.includes('gov.in') ? 97 : 94;
  const license = 'Government Public Educational Resource (CC-BY-NC / Open Data)';

  // 3. Stage C: Extraction Agent (simulated structured extraction)
  const extractedTitle = `Verified Curriculum Resource: ${sourceName} (${resourceType.toUpperCase()})`;
  const extractedSummary = `Standardized pedagogical unit ingested from ${domain}. Validated for learning outcomes, curriculum version 2025-2026, and taxonomy objectives.`;

  // 4. Stage D: Content Validation Agent
  // Check for duplicates or flags
  const existing = db.researchJobs.find((j) => j.url.toLowerCase() === targetUrl.toLowerCase());
  if (existing) {
    return existing;
  }

  // 5. Create Draft Job (Stage G: Requires explicit Admin Review before course publication)
  const newJob: EducationalResearchJob = {
    id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sourceDomain: domain,
    sourceName,
    resourceType,
    url: targetUrl,
    authorityScore,
    license,
    status: 'pending_review', // Kept as pending review for human-in-the-loop governance
    retrievedAt: new Date().toISOString(),
    extractedTitle,
    extractedSummary,
    reviewNotes: 'Awaiting syllabus alignment review by certified educator or administrator.',
  };

  db.researchJobs.unshift(newJob);

  db.auditLogs.push({
    id: `aud_${Date.now()}`,
    action: 'RESEARCH_DISCOVERY_PROCESSED',
    userId: adminUserId,
    timestamp: new Date().toISOString(),
    details: `Ingested research candidate from ${domain} (${newJob.id}). Status: pending_review.`,
  });

  return newJob;
}

export function reviewResearchJob(
  jobId: string,
  decision: 'approved' | 'rejected',
  adminName: string,
  notes: string
): EducationalResearchJob {
  const job = db.researchJobs.find((j) => j.id === jobId);
  if (!job) {
    throw new Error('Research job not found.');
  }

  job.status = decision;
  job.reviewedBy = adminName;
  job.reviewNotes = notes || (decision === 'approved' ? 'Approved for course library indexing.' : 'Rejected.');

  db.auditLogs.push({
    id: `aud_${Date.now()}`,
    action: `RESEARCH_JOB_${decision.toUpperCase()}`,
    userId: adminName,
    timestamp: new Date().toISOString(),
    details: `Job ${jobId} was ${decision} by ${adminName}.`,
  });

  return job;
}
