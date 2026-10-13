import React, { useState, useEffect } from 'react';
import { DocumentUpload, DocumentChunk } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import {
  FileText,
  UploadCloud,
  Trash2,
  Search,
  CheckCircle2,
  FileCheck,
  Eye,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const DocumentKnowledgeBase: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentUpload | null>(null);

  // Upload modal states
  const [showUpload, setShowUpload] = useState(false);
  const [filename, setFilename] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [ocrApplied, setOcrApplied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Grounded search test
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await api.getDocuments();
      setDocuments(res.documents);
      if (res.documents.length > 0 && !selectedDoc) {
        setSelectedDoc(res.documents[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim() || !fileContent.trim()) return;
    setIsUploading(true);

    try {
      const res = await api.uploadDocument({
        filename: filename.trim(),
        fileContent: fileContent.trim(),
        ocrApplied,
      });
      setDocuments([res.document, ...documents]);
      setSelectedDoc(res.document);
      setShowUpload(false);
      setFilename('');
      setFileContent('');
      setOcrApplied(false);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document and remove it from vector search?')) return;
    try {
      await api.deleteDocument(docId);
      const updated = documents.filter((d) => d.id !== docId);
      setDocuments(updated);
      if (selectedDoc?.id === docId) {
        setSelectedDoc(updated[0] || null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTestSearch = async () => {
    if (!searchQuery.trim() || !selectedDoc) return;
    setIsSearching(true);
    try {
      const res = await api.askDocument(selectedDoc.id, searchQuery);
      setSearchResults(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Study Notes & Document Library
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload your class notes, textbooks, and study sheets to ask questions and get instant verified explanations.
          </p>
        </div>

        <button
          onClick={() => setShowUpload(!showUpload)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          {showUpload ? 'Close Upload' : 'Upload New Notes / PDF'}
        </button>
      </div>

      {/* Upload Box */}
      {showUpload && (
        <form
          onSubmit={handleUploadSubmit}
          className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6 space-y-4 animate-fade-in"
        >
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            <span>Ingest Study Material into Vector Index</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Document Title</label>
              <input
                type="text"
                required
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. CBSE_Class10_Math_Polynomials_Notes.pdf"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Document Text Content (Paste textbook excerpts or handwritten notes)
              </label>
              <textarea
                rows={5}
                required
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="Paste notes or extracted chapter text here. The backend will parse, chunk, and index for semantic retrieval..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="ocr-check"
                checked={ocrApplied}
                onChange={(e) => setOcrApplied(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="ocr-check" className="text-slate-600 cursor-pointer">
                Scanned Document (Simulate PaddleOCR / Tesseract extraction for handwritten notes)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {isUploading ? 'Chunking & Indexing...' : 'Index Document Chunks'}
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Documents on left, Chunks & RAG Inspection on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Indexed Documents ({documents.length})
          </h3>

          <div className="space-y-2">
            {documents.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setSearchResults(null);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 truncate">
                    <FileText className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div className="truncate space-y-0.5">
                      <h4 className="font-semibold text-xs text-slate-900 truncate">{doc.filename}</h4>
                      <p className="text-[11px] text-slate-500">
                        {doc.chunkCount} Chunks · {(doc.fileSize / 1024).toFixed(1)} KB
                        {doc.ocrApplied && ' · OCR Extracted'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Document Chunks & Semantic Query Tester */}
        <div className="lg:col-span-7 space-y-6">
          {selectedDoc ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedDoc.filename}</h3>
                  <span className="text-xs text-slate-500">
                    Verified Study Material · Status: Ready for Questions
                  </span>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded">
                  {selectedDoc.chunkCount} Study Sections
                </span>
              </div>

              {/* Document Search Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Ask a Question from this Document
                </span>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter question in Hindi, Hinglish, or English..."
                    className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleTestSearch}
                    disabled={isSearching}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {isSearching ? 'Searching...' : 'Find Answer'}
                  </button>
                </div>

                {searchResults && (
                  <div className="pt-2 border-t border-slate-200 text-xs space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                      <span>Top Citations Retrieved ({searchResults.citations.length})</span>
                      <span className="font-mono text-indigo-700 font-bold">
                        Cosine Similarity Confidence: {Math.round(searchResults.confidence * 100)}%
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {searchResults.citations.map((c: any, cIdx: number) => (
                        <div key={cIdx} className="p-2.5 bg-white rounded border border-indigo-100 text-[11px]">
                          <div className="font-bold text-indigo-900">{c.pageOrSection}</div>
                          <p className="text-slate-600 mt-0.5">{c.snippet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chunks Inspector */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Chunks Extracted & Indexed
                </h4>

                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {selectedDoc.chunks.map((chk) => (
                    <div
                      key={chk.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono"
                    >
                      <div className="flex items-center justify-between text-slate-500 text-[10px]">
                        <span className="font-bold text-indigo-700">{chk.section}</span>
                        <span>~{chk.tokenCount} Tokens</span>
                      </div>
                      <p className="text-slate-800 text-[11px] leading-relaxed font-sans">{chk.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              Select a document to inspect chunks and verify semantic RAG retrieval.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
