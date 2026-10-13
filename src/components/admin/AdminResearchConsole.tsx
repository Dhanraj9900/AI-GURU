import React, { useState, useEffect } from 'react';
import { EducationalResearchJob } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Plus,
  Clock,
  History,
  Lock,
} from 'lucide-react';

export const AdminResearchConsole: React.FC = () => {
  const [jobs, setJobs] = useState<EducationalResearchJob[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New research submission
  const [targetUrl, setTargetUrl] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [resourceType, setResourceType] = useState<'syllabus' | 'textbook' | 'practice_set' | 'lecture_notes'>('textbook');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsRes, logsRes] = await Promise.all([api.getResearchJobs(), api.getAuditLogs()]);
      setJobs(jobsRes.jobs);
      setAuditLogs(logsRes.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNewJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await api.submitResearchJob({
        targetUrl: targetUrl.trim(),
        sourceName: sourceName.trim(),
        resourceType,
      });
      setJobs([res.job, ...jobs]);
      setTargetUrl('');
      setSourceName('');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Discovery submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (jobId: string, decision: 'approved' | 'rejected') => {
    const notes = prompt(`Enter review notes for ${decision}:`) || '';
    try {
      if (decision === 'approved') {
        const res = await api.approveJob(jobId, notes);
        setJobs(jobs.map((j) => (j.id === jobId ? res.job : j)));
      } else {
        const res = await api.rejectJob(jobId, notes);
        setJobs(jobs.map((j) => (j.id === jobId ? res.job : j)));
      }
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Educational Quality & Content Governance
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Curriculum Ingestion & Source Verification Console
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Ingest, verify, and approve official educational materials from approved national repositories (NCERT, DIKSHA, SWAYAM).
        </p>
      </div>

      {/* Ingestion Trigger Form */}
      <form
        onSubmit={handleSubmitNewJob}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Import Educational Resource from Approved Repository
          </h3>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-medium">
            Approved Domain Verification Active
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-medium mb-1">
              Source URL (Must be on allowlist: ncert.nic.in, diksha.gov.in, swayam.gov.in, nptel.ac.in)
            </label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://ncert.nic.in/textbook/pdf/jemh104.pdf"
              className="w-full p-2.5 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Resource Type</label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as any)}
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="textbook">Official Textbook</option>
              <option value="syllabus">Curriculum Syllabus</option>
              <option value="practice_set">Competency Question Bank</option>
              <option value="lecture_notes">National Repository Handouts</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-slate-700 font-medium mb-1">Source Authority & Title</label>
            <input
              type="text"
              required
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g. NCERT National Council for Educational Research & Training"
              className="w-full p-2.5 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Running 7-Stage Validation Pipeline...' : 'Run Discovery & Verification Agent'}
          </button>
        </div>
      </form>

      {/* Discovered Resources & Admin Review */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Educational Candidates in Governance Pipeline</h3>

        <div className="space-y-4">
          {jobs.map((job) => {
            const statusMap: Record<string, string> = {
              approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              rejected: 'bg-rose-50 text-rose-800 border-rose-200',
              pending_review: 'bg-amber-50 text-amber-800 border-amber-200',
              discovered: 'bg-blue-50 text-blue-800 border-blue-200',
              verified: 'bg-indigo-50 text-indigo-800 border-indigo-200',
              extracted: 'bg-purple-50 text-purple-800 border-purple-200',
            };
            const statusStyle = statusMap[job.status] || 'bg-slate-50 text-slate-700 border-slate-200';

            return (
              <div
                key={job.id}
                className="p-5 rounded-xl border border-slate-200 space-y-3 text-xs bg-slate-50/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-[10px]">{job.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusStyle}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                      <span className="text-slate-500 font-semibold">{job.sourceName}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{job.extractedTitle}</h4>
                  </div>

                  {job.status === 'pending_review' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecision(job.id, 'approved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Approve for Students
                      </button>
                      <button
                        onClick={() => handleDecision(job.id, 'rejected')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-slate-600 leading-relaxed text-[11px]">{job.extractedSummary}</p>

                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>Authority Score: {job.authorityScore}/100</span>
                    <span>·</span>
                    <span>License: {job.license}</span>
                    <span>·</span>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-0.5"
                    >
                      Inspect Source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {job.reviewedBy && (
                    <span className="text-slate-700 font-medium">
                      Reviewed by {job.reviewedBy}: <em>"{job.reviewNotes}"</em>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Log Trail */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" /> Administrative Security & Governance Audit Trail
          </h3>
          <span className="text-xs text-slate-500">{auditLogs.length} events logged</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between font-mono"
            >
              <div>
                <span className="font-bold text-indigo-700 mr-2">{log.action}</span>
                <span className="text-slate-700 font-sans">{log.details}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
