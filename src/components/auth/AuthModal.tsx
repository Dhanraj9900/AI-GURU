import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Role, Language, DegreeLevel } from '../../types/index.ts';
import {
  X,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  GraduationCap,
  ShieldAlert,
  CheckCircle2,
  UploadCloud,
  FileText,
  AlertTriangle,
  Building2,
  FileCheck2,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    signup,
    quickLoginAs,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>('hi');
  const [educationalLevel, setEducationalLevel] = useState('Class 10 CBSE & JEE Foundation');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Teacher Degree Verification State
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>('postgraduate');
  const [degreeName, setDegreeName] = useState('M.Sc. Mathematics');
  const [institution, setInstitution] = useState('Delhi University');
  const [graduationYear, setGraduationYear] = useState('2021');
  const [specialization, setSpecialization] = useState('Pure Mathematics & Algebra');
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  if (!showAuthModal) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocumentName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setDocumentUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleDegree = () => {
    setDegreeLevel('phd');
    setDegreeName('Doctor of Philosophy (Ph.D.) in Educational Science');
    setInstitution('Banaras Hindu University / IIT');
    setGraduationYear('2020');
    setSpecialization('Applied Mathematics & Pedagogy');
    setDocumentName('Doctorate_PhD_Official_Degree_Certificate.pdf');
    setDocumentUrl('https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
      } else {
        if (role === 'teacher') {
          if (!documentName.trim()) {
            setError(
              'अनिवार्य आवश्यकता: शिक्षक बनने के लिए कम से कम स्नातक (Graduate), स्नातकोत्तर (Postgraduate) या पीएचडी (PhD) डिग्री का प्रमाण-पत्र (Degree Certificate) अपलोड करना आवश्यक है। बिना डिग्री के शिक्षक खाता नहीं बन सकता।'
            );
            setLoading(false);
            return;
          }
          if (!degreeName.trim() || !institution.trim() || !graduationYear.trim()) {
            setError('कृपया शिक्षक के रूप में डिग्री का नाम, विश्वविद्यालय/संस्थान और उत्तीर्ण वर्ष अवश्य भरें।');
            setLoading(false);
            return;
          }
        }

        await signup({
          name,
          email,
          password,
          role,
          preferredLanguage,
          educationalLevel,
          teacherDegree:
            role === 'teacher'
              ? {
                  degreeLevel,
                  degreeName: degreeName.trim(),
                  institution: institution.trim(),
                  graduationYear: graduationYear.trim(),
                  specialization: specialization.trim(),
                  documentName: documentName.trim(),
                  documentUrl:
                    documentUrl ||
                    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
                }
              : undefined,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (targetRole: Role) => {
    setError(null);
    setLoading(true);
    try {
      await quickLoginAs(targetRole);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden transition-all">
        {/* Header Bar */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {authModalMode === 'login' ? 'Sign In to AI Guru' : 'Create Free Student Account'}
              </h3>
              <p className="text-xs text-slate-500">Your multilingual personalized digital teacher</p>
            </div>
          </div>
          <button
            onClick={() => setShowAuthModal(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1.5 mx-6 mt-4 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              authModalMode === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('signup');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              authModalMode === 'signup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up Free
          </button>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="px-6 pt-3">
          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100/80 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Instant 1-Click Role Login (Evaluator Mode)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student')}
                disabled={loading}
                className="px-3 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-medium text-xs transition-colors shadow-2xs text-center"
              >
                Student Learner (Aarav)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('teacher')}
                disabled={loading}
                className="px-3 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-medium text-xs transition-colors shadow-2xs text-center"
              >
                Teacher (Dr. Priya - Verified)
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-3.5 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@aiguru.edu"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">Password</label>
              {authModalMode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('Demo password for all accounts is: GuruPass123!')}
                  className="text-[11px] text-indigo-600 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {authModalMode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as Language)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  >
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="hinglish">Hinglish</option>
                    <option value="en">English</option>
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  >
                    <option value="student">Student Learner (विद्यार्थी)</option>
                    <option value="teacher">Teacher / Faculty (शिक्षक - डिग्री अनिवार्य)</option>
                  </select>
                </div>
              </div>

              {/* Student Academic Level */}
              {role === 'student' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Current Academic Level</label>
                  <select
                    value={educationalLevel}
                    onChange={(e) => setEducationalLevel(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  >
                    <option value="Class 10 CBSE & JEE Foundation">Class 10 (Secondary & Foundation)</option>
                    <option value="Class 12 Science (PCM/PCB)">Class 12 (Board & Pre-College)</option>
                    <option value="JEE Main & Advanced Aspirant">JEE Main & Advanced Aspirant</option>
                    <option value="NEET UG Medical Aspirant">NEET UG Medical Aspirant</option>
                    <option value="UPSC Civil Services Preparation">UPSC Civil Services Preparation</option>
                    <option value="B.Tech Computer Science / IT">B.Tech Computer Science / IT</option>
                    <option value="Undergraduate (B.Sc / BA / B.Com)">Undergraduate Degree</option>
                  </select>
                </div>
              )}

              {/* MANDATORY TEACHER DEGREE VERIFICATION SECTION */}
              {role === 'teacher' && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-indigo-950 text-xs">
                        अनिवार्य शिक्षक पात्रता (Mandatory Degree Verification)
                      </h4>
                      <p className="text-[11px] text-indigo-800 leading-snug mt-0.5">
                        शिक्षक बनने के लिए कम से कम <strong>Graduate, Postgraduate या PhD</strong> डिग्री और
                        प्रमाण-पत्र अपलोड करना आवश्यक है। बिना डिग्री के शिक्षक खाता नहीं बन सकता।
                      </p>
                    </div>
                  </div>

                  {/* Degree Level */}
                  <div>
                    <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                      1. शैक्षणिक डिग्री स्तर (Degree Level) *
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'graduate' as DegreeLevel, label: 'Graduate (स्नातक)' },
                        { id: 'postgraduate' as DegreeLevel, label: 'Postgraduate (स्नातकोत्तर)' },
                        { id: 'phd' as DegreeLevel, label: 'Doctorate / PhD (पीएचडी)' },
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setDegreeLevel(lvl.id)}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer text-center ${
                            degreeLevel === lvl.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Degree Name & Specialization */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">डिग्री का नाम *</label>
                      <input
                        type="text"
                        required
                        value={degreeName}
                        onChange={(e) => setDegreeName(e.target.value)}
                        placeholder="e.g. M.Sc. Mathematics"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">विषय / Major</label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g. Pure Mathematics"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* University & Passing Year */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">विश्वविद्यालय / संस्थान *</label>
                      <input
                        type="text"
                        required
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. University of Delhi"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">उत्तीर्ण वर्ष *</label>
                      <input
                        type="text"
                        required
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        placeholder="e.g. 2021"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Mandatory Degree Certificate File Upload */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                        डिग्री प्रमाण-पत्र अपलोड करें *
                      </label>
                      <button
                        type="button"
                        onClick={handleUseSampleDegree}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> Demo 1-Click Degree
                      </button>
                    </div>

                    <div
                      className={`p-2.5 border-2 border-dashed rounded-xl text-center transition-all ${
                        documentName ? 'border-emerald-400 bg-emerald-50/60' : 'border-indigo-300 bg-white'
                      }`}
                    >
                      {documentName ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-left truncate">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-xs font-bold text-slate-800 truncate">{documentName}</span>
                          </div>
                          <label className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded font-semibold text-slate-600 cursor-pointer">
                            बदलें
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer py-1">
                          <UploadCloud className="w-5 h-5 text-indigo-500 mb-0.5" />
                          <span className="text-[11px] font-semibold text-indigo-900">
                            डिग्री प्रमाण-पत्र फ़ाइल चुनें (PDF/JPG)
                          </span>
                          <span className="text-[9px] text-slate-500">
                            (Graduate / Postgraduate / PhD Degree Document)
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
                </div>
              )}
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || (authModalMode === 'signup' && role === 'teacher' && !documentName)}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading
                ? 'Authenticating...'
                : authModalMode === 'login'
                ? 'Sign In to Workspace'
                : role === 'teacher'
                ? 'सत्यापित शिक्षक खाता बनाएं (Create Verified Teacher Account)'
                : 'Create Free Student Account'}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          Private, secure, and inclusive education. No payment required for local prototype.
        </div>
      </div>
    </div>
  );
};
