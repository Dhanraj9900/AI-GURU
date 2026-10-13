import React, { useState, useEffect } from 'react';
import { StudentNotebookNote } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import {
  BookOpen,
  FileText,
  UploadCloud,
  Sparkles,
  Trash2,
  Edit3,
  Plus,
  Search,
  CheckCircle2,
  Tag,
  Paperclip,
  Clock,
  ArrowRight,
  HelpCircle,
  FileCode,
  Share2,
} from 'lucide-react';

interface StudentNotebookProps {
  onStudyWithAI: (note: StudentNotebookNote) => void;
}

export const StudentNotebook: React.FC<StudentNotebookProps> = ({ onStudyWithAI }) => {
  const [notes, setNotes] = useState<StudentNotebookNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<StudentNotebookNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Form modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [fileAttachment, setFileAttachment] = useState<{ name: string; size: number; type: string; dataUrl?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [studyingLoading, setStudyingLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(false);
    try {
      const res = await api.getNotebookNotes();
      setNotes(res.notes);
      if (res.notes.length > 0 && !selectedNote) {
        setSelectedNote(res.notes[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultText = event.target?.result as string;
      setFileAttachment({
        name: file.name,
        size: file.size,
        type: file.type || 'text/plain',
        dataUrl: resultText,
      });

      // If it's a text-based file, populate content automatically
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        setContent((prev) => prev ? `${prev}\n\n[Uploaded File Content - ${file.name}]:\n${resultText}` : resultText);
      } else {
        setContent((prev) => prev ? `${prev}\n\n[Attached File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]` : `[Attached File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\n\nNotes from this material:`);
      }

      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (isEditing && selectedNote) {
        const res = await api.updateNotebookNote(selectedNote.id, {
          title: title.trim(),
          subject: subject.trim(),
          tags,
          content: content.trim(),
        });
        setNotes(notes.map((n) => (n.id === selectedNote.id ? res.note : n)));
        setSelectedNote(res.note);
      } else {
        const res = await api.createNotebookNote({
          title: title.trim(),
          subject: subject.trim(),
          tags,
          content: content.trim(),
          fileAttachment,
        });
        setNotes([res.note, ...notes]);
        setSelectedNote(res.note);
      }

      setShowModal(false);
      resetForm();
    } catch (err: any) {
      alert(err.message || 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note from your notebook?')) return;
    try {
      await api.deleteNotebookNote(id);
      const updated = notes.filter((n) => n.id !== id);
      setNotes(updated);
      if (selectedNote?.id === id) {
        setSelectedNote(updated[0] || null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete note');
    }
  };

  const handleStartStudy = async (note: StudentNotebookNote) => {
    setStudyingLoading(true);
    try {
      await onStudyWithAI(note);
    } finally {
      setStudyingLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubject('Mathematics');
    setTagsInput('');
    setContent('');
    setFileAttachment(null);
    setIsEditing(false);
  };

  const openEditModal = (note: StudentNotebookNote) => {
    setSelectedNote(note);
    setTitle(note.title);
    setSubject(note.subject);
    setTagsInput(note.tags.join(', '));
    setContent(note.content);
    setFileAttachment(note.fileAttachment || null);
    setIsEditing(true);
    setShowModal(true);
  };

  const subjectsList = ['all', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || n.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
              Student Workspace
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Digital Notebook (मेरी नोटबुक)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload your handwritten notes, study files, or custom summaries. AI Guru learns from your notes and teaches you step-by-step!
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload File / Create Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap gap-1 w-full sm:w-auto">
          {subjectsList.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {sub === 'all' ? 'All Subjects' : sub}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, formulas, tags..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Main Grid: Left Notes List, Right Note Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Notes List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Your Notes ({filteredNotes.length})</span>
            <span>Click to view & study</span>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No notes found</div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Upload your study documents or write down key formulas to build your personalized notebook.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                + Add First Note
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredNotes.map((note) => {
                const isSelected = selectedNote?.id === note.id;

                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 shadow-sm ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {note.subject}
                        </span>
                        {note.fileAttachment && (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            File Attached
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{note.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{note.content}</p>

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {note.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Note Viewer & AI Study Action */}
        <div className="lg:col-span-7">
          {selectedNote ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-5 sticky top-4">
              {/* Header with actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                      {selectedNote.subject}
                    </span>
                    <span className="text-xs text-slate-400">
                      Updated {new Date(selectedNote.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedNote.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(selectedNote)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Note"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedNote.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Major Action: Study with AI Guru Button */}
              <div className="p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-extrabold text-sm text-indigo-950">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI Guru se Padhein (Study with AI Guru)
                  </div>
                  <p className="text-xs text-slate-600">
                    AI Guru will analyze this note, explain the formulas, and ask practice questions!
                  </p>
                </div>

                <button
                  onClick={() => handleStartStudy(selectedNote)}
                  disabled={studyingLoading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{studyingLoading ? 'Loading Tutor...' : 'Start Learning from this Note'}</span>
                </button>
              </div>

              {/* File attachment pill if any */}
              {selectedNote.fileAttachment && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Paperclip className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-slate-800">{selectedNote.fileAttachment.name}</span>
                    <span className="text-slate-400">
                      ({(selectedNote.fileAttachment.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Indexed by AI
                  </span>
                </div>
              )}

              {/* Note Content */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note Content:</span>
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {selectedNote.content}
                </div>
              </div>

              {/* Tags list */}
              {selectedNote.tags.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNote.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-base">Select a note to review</div>
              <p className="text-xs text-slate-500">
                Choose any note from the left to view details or start studying with AI Guru.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Note Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Notebook Note' : 'Add Note or Upload Study File'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              {/* File Upload Drop Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Study Document / File (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-4 text-center cursor-pointer bg-slate-50 relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".txt,.md,.pdf,.doc,.docx,.png,.jpg"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-700">
                    Click to select file (PDF, TXT, MD, Docs, Image notes)
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Files will be parsed so AI Guru can teach you directly from your content.
                  </p>
                  {fileAttachment && (
                    <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 py-1 px-2 rounded inline-block">
                      ✓ Selected: {fileAttachment.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Note Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Quadratic Equation Formulas & Tricks"
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Formula, Class 10, Board Exam, Revision"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Content / Notes / Formula Summary *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setContent(
                        `# Chapter Key Takeaways\n\n1. Definition:\n2. Essential Formulas:\n   - Formula 1\n   - Formula 2\n3. Common Mistakes to Avoid:\n4. Quick Practice Question:`
                      );
                    }}
                    className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer"
                  >
                    Insert Revision Template
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your study notes, formulas, or copy-paste lecture points here..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600 font-mono"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {isSaving ? 'Saving...' : isEditing ? 'Update Note' : 'Save to Notebook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
