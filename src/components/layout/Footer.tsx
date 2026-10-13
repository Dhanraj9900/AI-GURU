import React from 'react';
import { BookOpen, ShieldCheck, Sparkles, GraduationCap, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">AI GURU</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              An intelligent, multilingual, and personalized learning platform built for inclusive education. Empowering school students, competitive aspirants, and university scholars in Hindi, English, and regional Indian languages.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> NCERT & National Syllabi Aligned
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Adaptive Learning & Tutoring
              </span>
            </div>
          </div>

          {/* Academic Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Course Library</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Classes 1–12 (CBSE & State Boards)</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">JEE Main & Advanced Physics/Math</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">NEET UG Biology & Physiology</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">UPSC & State PSC Civil Services</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">B.Tech Computer Science (DSA & OS)</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">BCA / MCA / B.Sc / M.Sc</span></li>
            </ul>
          </div>

          {/* Learning Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Study & Practice Tools</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Personalized AI Tutor</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Step-by-Step Math Problem Solver</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Adaptive Practice Quizzes</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Class Notes & Document Assistant</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Spaced Repetition Flashcards</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Personalized Study Roadmap</span></li>
            </ul>
          </div>

          {/* Inclusive Mission */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Inclusive Education</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Rural Low-Bandwidth Access</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Hindi, Hinglish & Regional Languages</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">100% Free for Students</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Approved Government Portals (DIKSHA / SWAYAM)</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Human Educator-in-the-Loop Review</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Student Data Privacy & Protection</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AI Guru Education Platform. Built for open, inclusive, and equitable learning.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Responsible Education Charter</span>
            <span className="hover:text-slate-400 cursor-pointer">Data Privacy & Security</span>
            <span className="hover:text-slate-400 cursor-pointer">Curriculum Standards</span>
            <span className="hover:text-slate-400 cursor-pointer">Teacher Verification Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
