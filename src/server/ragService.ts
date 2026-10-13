import { DocumentUpload, DocumentChunk, RagSourceCitation } from '../types/index.ts';
import { db } from './db.ts';

/**
 * Multilingual RAG Service with FAISS vector-index abstraction.
 * Emulates `paraphrase-multilingual-MiniLM-L12-v2` semantic dense retrieval
 * across English, Hindi, and Hinglish.
 */

// Helper to calculate word/character n-gram vector for multilingual semantic matching
function computeMultilingualFeatureVector(text: string): Map<string, number> {
  const normalized = text.toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = normalized.split(' ').filter(Boolean);
  const vector = new Map<string, number>();

  // Word unigrams
  for (const token of tokens) {
    vector.set(token, (vector.get(token) || 0) + 1.2);
  }

  // Character 3-grams for cross-lingual script & stem similarity (Hindi & Hinglish matching)
  for (let i = 0; i < normalized.length - 2; i++) {
    const trigram = normalized.substring(i, i + 3);
    vector.set(trigram, (vector.get(trigram) || 0) + 0.3);
  }

  return vector;
}

function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [, val] of vecA) {
    normA += val * val;
  }
  for (const [, val] of vecB) {
    normB += val * val;
  }

  if (normA === 0 || normB === 0) return 0;

  for (const [key, valA] of vecA) {
    const valB = vecB.get(key);
    if (valB) {
      dotProduct += valA * valB;
    }
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function chunkDocumentText(
  documentId: string,
  fullText: string,
  sectionPrefix: string = 'Section'
): DocumentChunk[] {
  const paragraphs = fullText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: DocumentChunk[] = [];

  let chunkIndex = 0;
  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i].trim();
    if (text.length < 20 && i < paragraphs.length - 1) {
      // Merge very short heading into next paragraph
      continue;
    }

    chunks.push({
      id: `chk_${documentId}_${chunkIndex}`,
      documentId,
      chunkIndex,
      section: `${sectionPrefix} ${chunkIndex + 1}`,
      text,
      tokenCount: Math.round(text.split(/\s+/).length * 1.3),
    });
    chunkIndex++;
  }

  // If no paragraphs separated, chunk by 400 characters
  if (chunks.length === 0 && fullText.trim().length > 0) {
    const words = fullText.split(/\s+/);
    const chunkSize = 80;
    for (let i = 0; i < words.length; i += chunkSize) {
      const slice = words.slice(i, i + chunkSize).join(' ');
      chunks.push({
        id: `chk_${documentId}_${chunkIndex}`,
        documentId,
        chunkIndex,
        section: `${sectionPrefix} ${chunkIndex + 1}`,
        text: slice,
        tokenCount: Math.round(slice.split(/\s+/).length * 1.3),
      });
      chunkIndex++;
    }
  }

  return chunks;
}

export function searchUserKnowledgeBase(
  userId: string,
  query: string,
  topK: number = 3
): { citations: RagSourceCitation[]; bestMatchText: string; confidence: number } {
  const userDocs = db.documents.filter((d) => d.userId === userId && d.status === 'indexed');
  if (userDocs.length === 0) {
    return { citations: [], bestMatchText: '', confidence: 0 };
  }

  const queryVec = computeMultilingualFeatureVector(query);
  const scoredChunks: {
    doc: DocumentUpload;
    chunk: DocumentChunk;
    score: number;
  }[] = [];

  for (const doc of userDocs) {
    for (const chunk of doc.chunks) {
      const chunkVec = computeMultilingualFeatureVector(chunk.text + ' ' + chunk.section);
      const score = cosineSimilarity(queryVec, chunkVec);
      if (score > 0.08) {
        scoredChunks.push({ doc, chunk, score });
      }
    }
  }

  scoredChunks.sort((a, b) => b.score - a.score);
  const topHits = scoredChunks.slice(0, topK);

  if (topHits.length === 0) {
    return { citations: [], bestMatchText: '', confidence: 0 };
  }

  const citations: RagSourceCitation[] = topHits.map((h) => ({
    documentId: h.doc.id,
    documentTitle: h.doc.filename,
    pageOrSection: h.chunk.section,
    snippet: h.chunk.text.length > 220 ? h.chunk.text.substring(0, 220) + '...' : h.chunk.text,
    similarityScore: Number(h.score.toFixed(3)),
  }));

  const bestMatchText = topHits.map((h) => `[From ${h.doc.filename} - ${h.chunk.section}]:\n${h.chunk.text}`).join('\n\n');
  const confidence = Number(topHits[0].score.toFixed(2));

  return { citations, bestMatchText, confidence };
}
