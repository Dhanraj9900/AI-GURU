import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { BookOpen, Sparkles, Menu, X, ArrowRight, UserCircle2, ShieldCheck, GraduationCap, Award } from 'lucide-react';

interface HeaderProps {
  onNavigateLanding?: (sectionId: string) => void;
  onOpenWorkspace?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateLanding, onOpenWorkspace }) => {
  const { user, setShowAuthModal, setAuthModalMode, quickLoginAs, logout, setShowTeacherVerifyModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (sectionId: string) => {
    if (onNavigateLanding) {
      onNavigateLanding(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">AI GURU</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                Inclusive
              </span>
            </div>
            <p className="text-[11px] text-slate-700 font-medium hidden sm:block">
              Multilingual Personalized Education
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNav('courses')}
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Explore Courses
          </button>
          <button
            onClick={() => handleNav('features')}
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Pedagogy & Features
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNav('inclusive')}
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Inclusive Impact
          </button>
        </nav>

        {/* Right CTA / User State */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'student' && (
                <button
                  onClick={() => setShowTeacherVerifyModal(true)}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  title="कम से कम Graduate, Postgraduate या PhD डिग्री अपलोड करके शिक्षक बनें"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  शिक्षक बनें (डिग्री सत्यापन)
                </button>
              )}
              {user.role === 'teacher' && user.teacherDegree && (
                <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {user.teacherDegree.degreeName}
                </span>
              )}
              <button
                onClick={onOpenWorkspace}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {user.role === 'teacher' ? 'Go to Teacher Studio' : 'Go to Student Workspace'}
              </button>
              <div className="relative group">
                <button className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50">
                  <UserCircle2 className="w-4 h-4 text-indigo-600" />
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">({user.role})</span>
                </button>
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 hidden group-hover:block z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-xs text-slate-500">
                    Logged in as <strong className="text-slate-700">{user.role}</strong>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setShowAuthModal(true);
                }}
                className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setShowAuthModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all cursor-pointer"
              >
                Start Learning Free
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <button
              onClick={onOpenWorkspace}
              className="px-2.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-md"
            >
              Workspace
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3">
          <button
            onClick={() => handleNav('courses')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
          >
            Explore Courses
          </button>
          <button
            onClick={() => handleNav('features')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
          >
            Pedagogy & Features
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNav('inclusive')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
          >
            Inclusive Impact
          </button>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {!user ? (
              <>
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg text-center"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg text-center"
                >
                  Start Learning Free
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onOpenWorkspace?.();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg text-center"
                >
                  Enter Learning Workspace
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-xs font-medium text-rose-600 text-center"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
