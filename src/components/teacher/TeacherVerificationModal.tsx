import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { DegreeLevel } from '../../types/index.ts';
import {
  GraduationCap,
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

export const TeacherVerificationModal: React.FC = () => {
  const { user, showTeacherVerifyModal, setShowTeacherVerifyModal, upgradeToTeacher } = useAuth();

  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>('postgraduate');
  const [degreeName, setDegreeName] = useState('M.Sc. Mathematics & Statistics');
  const [institution, setInstitution] = useState('Delhi University');
  const [graduationYear, setGraduationYear] = useState('2021');
  const [specialization, setSpecialization] = useState('Advanced Calculus & Algebra');
  const [documentName, setDocumentName] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!showTeacherVerifyModal) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setDocumentName(file.name);

    // Read base64 data for preview
    const reader = new FileReader();
    reader.onload = () => {
      setDocumentUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleDegree = () => {
    setDegreeLevel('phd');
    setDegreeName('Doctor of Philosophy (Ph.D.) in Pure Sciences');
    setInstitution('Banaras Hindu University / IIT');
    setGraduationYear('2020');
    setSpecialization('Physics & Mathematical Modeling');
    setDocumentName('Doctorate_PhD_Official_Degree_Certificate.pdf');
    setDocumentUrl('https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Strict validation: Must have at least graduate, postgraduate, or phd + certificate
    if (!documentName.trim()) {
      setError(
        'अनिवार्य आवश्यकता: शिक्षक बनने के लिए कम से कम स्नातक (Graduate), स्नातकोत्तर (Postgraduate) या पीएचडी (PhD) डिग्री का प्रमाण-पत्र (Degree Certificate) अपलोड करना अनिवार्य है। बिना डिग्री के शिक्षक नहीं बन सकते।'
      );
      return;
    }

    if (!degreeName.trim() || !institution.trim() || !graduationYear.trim()) {
      setError('कृपया डिग्री का नाम, विश्वविद्यालय/संस्थान और उत्तीर्ण वर्ष भरें।');
      return;
    }

    setSubmitting(true);
    try {
      await upgradeToTeacher({
        degreeLevel,
        degreeName: degreeName.trim(),
        institution: institution.trim(),
        graduationYear: graduationYear.trim(),
        specialization: specialization.trim(),
        documentName: documentName.trim(),
        documentUrl:
          documentUrl ||
          'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      });
    } catch (err: any) {
      setError(err.message || 'डिग्री सत्यापन विफल रहा। कृपया विवरण पुनः जांचें।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden transition-all max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/60 border border-indigo-400/40 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                Teacher Verification & Degree Submission
              </h3>
              <p className="text-xs text-indigo-200/80">
                शिक्षक बनने के लिए न्यूनतम योग्यता: स्नातक (Graduate), स्नातकोत्तर (Postgraduate) या PhD
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowTeacherVerifyModal(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Strict Mandatory Rule Notice */}
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-xs">अनिवार्य शिक्षक पात्रता नियम (Strict Policy):</h4>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                इस पोर्टल में शिक्षक (Teacher) की भूमिका प्राप्त करने और कोर्स/लाइव क्लास लेने के लिए कम से कम{' '}
                <strong>स्नातक (Graduate), स्नातकोत्तर (Postgraduate) या पीएचडी (Ph.D.)</strong> डिग्री और आधिकारिक
                प्रमाण-पत्र अपलोड करना अनिवार्य है। बिना डिग्री के शिक्षक अनुमति नहीं दी जा सकती।
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Degree Level Selection */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 text-xs">
              1. आपकी न्यूनतम शैक्षणिक डिग्री स्तर (Academic Degree Level) *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'graduate' as DegreeLevel,
                  title: 'Graduate',
                  hindi: 'स्नातक',
                  sub: 'B.Sc, B.Tech, B.Ed, B.A, B.Com',
                },
                {
                  id: 'postgraduate' as DegreeLevel,
                  title: 'Postgraduate',
                  hindi: 'स्नातकोत्तर',
                  sub: 'M.Sc, M.Tech, M.Ed, M.A, M.Com',
                },
                {
                  id: 'phd' as DegreeLevel,
                  title: 'Doctorate / PhD',
                  hindi: 'पीएचडी',
                  sub: 'Ph.D., D.Phil, Post-Doc Fellow',
                },
              ].map((lvl) => {
                const isSelected = degreeLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setDegreeLevel(lvl.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs">{lvl.title}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <span className="text-[10px] text-indigo-700 font-semibold block">{lvl.hindi}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block leading-tight">{lvl.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Degree Title & Specialization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                डिग्री का पूरा नाम (Degree Title) *
              </label>
              <input
                type="text"
                required
                value={degreeName}
                onChange={(e) => setDegreeName(e.target.value)}
                placeholder="e.g. M.Sc. Mathematics / B.Tech CSE"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                विशेषज्ञता / विषय (Major / Subject)
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Pure Mathematics & Analysis"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs bg-white"
              />
            </div>
          </div>

          {/* Institution & Passing Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                विश्वविद्यालय / संस्थान (University / Institution) *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. University of Delhi / IIT Bombay"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                उत्तीर्ण वर्ष (Graduation Year) *
              </label>
              <input
                type="text"
                required
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g. 2021"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs bg-white"
              />
            </div>
          </div>

          {/* Mandatory Degree Certificate File Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                डिग्री प्रमाण-पत्र दस्तावेज़ (Degree Certificate / Marksheet) *
              </label>
              <button
                type="button"
                onClick={handleUseSampleDegree}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Demo 1-Click Degree Certificate
              </button>
            </div>

            <div
              className={`p-4 border-2 border-dashed rounded-2xl text-center transition-all ${
                documentName
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-indigo-400'
              }`}
            >
              {documentName ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs truncate max-w-xs">{documentName}</p>
                      <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Degree Certificate Ready for Verification
                      </p>
                    </div>
                  </div>
                  <label className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium text-[11px] hover:bg-slate-50 cursor-pointer">
                    Change File
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-2">
                  <UploadCloud className="w-8 h-8 text-indigo-500 mb-1" />
                  <span className="font-semibold text-slate-800 text-xs">
                    Click to upload Degree Certificate / Diploma (PDF, JPG, PNG)
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    कम से कम Graduate, Postgraduate या PhD की डिग्री की स्कैन कॉपी अपलोड करें
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submission and Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowTeacherVerifyModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-xs cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              disabled={submitting || !documentName}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-sm shadow-indigo-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              {submitting ? 'सत्यापित हो रहा है...' : 'डिग्री सत्यापित करें व शिक्षक बनें (Verify & Join as Teacher)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
