import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { MathRenderer } from '../common/MathRenderer.tsx';
import {
  Sparkles,
  BookOpen,
  Languages,
  FileText,
  BrainCircuit,
  Target,
  BarChart3,
  CalendarCheck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Calculator,
  WifiOff,
  Smartphone,
  Cpu,
  Layers,
  Search,
} from 'lucide-react';

interface LandingPageProps {
  onExploreCourses: () => void;
  onEnterWorkspace: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExploreCourses, onEnterWorkspace }) => {
  const { user, setShowAuthModal, setAuthModalMode, quickLoginAs } = useAuth();

  const handleStartLearning = () => {
    if (user) {
      onEnterWorkspace();
    } else {
      setAuthModalMode('signup');
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/60 bg-gradient-to-b from-white via-indigo-50/20 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Zero-pill kicker */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-indigo-700 tracking-wide uppercase">
                <span>Inclusive Digital Education</span>
                <span aria-hidden="true">·</span>
                <span>Hindi & Regional Vernaculars</span>
                <span aria-hidden="true">·</span>
                <span>Adaptive Learning</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Your Personal AI Teacher.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700">
                  Learn Anything, Your Way.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                AI Guru is an intelligent digital tutor engineered for school, competitive exam, and university students. Master complex subjects through step-by-step Socratic teaching, deterministic math validation, and native Hindi and Hinglish explanations—grounded in official national curricula.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={handleStartLearning}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all cursor-pointer text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  {user ? 'Enter Learning Workspace' : 'Start Learning for Free'}
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>
                <button
                  onClick={onExploreCourses}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 shadow-2xs hover:border-slate-400 transition-all cursor-pointer text-sm"
                >
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Explore Course Catalog
                </button>
              </div>

              {/* Trust & Inclusivity indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Classes 1–12, JEE, NEET, UPSC & B.Tech
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-indigo-600" /> Hindi, English & Hinglish Vernacular
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-amber-600" /> SymPy Deterministic Math Verifier
                </span>
              </div>
            </div>

            {/* Right Interactive Live Workspace Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
                  {/* Mock Window Top Bar */}
                  <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      </div>
                      <span className="text-xs font-mono text-slate-300 ml-2">AI Guru Workspace · Hindi & Math Mode</span>
                    </div>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded">
                      Personalized Digital Teacher
                    </span>
                  </div>

                  {/* Mock Chat Transcript */}
                  <div className="p-4 space-y-3.5 bg-slate-50/70 text-xs">
                    {/* User message */}
                    <div className="flex items-start justify-end gap-2">
                      <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-xs max-w-[85%] leading-relaxed">
                        <MathRenderer
                          content="सर, मुझे द्विघात समीकरण में Discriminant ($D$) और $x^2 - 5x + 6 = 0$ के मूल निकालने का सूत्र समझाइए।"
                          className="text-white text-xs"
                        />
                      </div>
                    </div>

                    {/* AI Guru Response */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                        गुरु
                      </div>
                      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-xs max-w-[90%] shadow-2xs space-y-2.5 text-slate-800 leading-relaxed">
                        <div className="text-slate-900 font-semibold flex items-center justify-between">
                          <span>नमस्ते आरव! आइए इसे चरणबद्ध तरीके से समझें:</span>
                          <span className="text-[10px] text-emerald-600 font-mono">✓ SymPy Verified</span>
                        </div>

                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1.5 text-slate-800">
                          <div>1. मानक रूप: <MathRenderer content="$ax^2 + bx + c = 0$" className="inline text-[11px]" /></div>
                          <div>2. विविक्तकर: <MathRenderer content="$D = b^2 - 4ac$" className="inline text-[11px]" /></div>
                          <div>3. मान: <MathRenderer content="$(-5)^2 - 4(1)(6) = 25 - 24 = 1$" className="inline text-[11px]" /></div>
                          <div className="text-emerald-700 font-bold">⇒ <MathRenderer content="$D > 0$" className="inline text-[11px]" />: दो वास्तविक भिन्न मूल: $x = 3, 2$</div>
                        </div>

                        <p className="text-[11px] text-slate-600">
                          💡 <strong>गुरु संकेत:</strong> जब $D$ एक पूर्ण वर्ग हो, तो मूल परिमेय (Rational) संख्याएँ होते हैं।
                        </p>

                        <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-400 border-t border-slate-100">
                          <span>स्रोत: NCERT कक्षा 10 गणित</span>
                          <span>·</span>
                          <span className="text-indigo-600 font-medium cursor-pointer" onClick={handleStartLearning}>
                            क्विज़ हल करें →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mock Input Bar */}
                  <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="अगला कदम: इस पर 3 बहुविकल्पीय प्रश्न बनाएं..."
                      className="flex-1 text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 cursor-pointer"
                      onClick={handleStartLearning}
                    />
                    <button
                      onClick={handleStartLearning}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE PEDAGOGICAL LEARNING CYCLE */}
      <section className="py-14 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700">The Continuous Mastery Engine</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              TEACH → PRACTISE → ASSESS → IDENTIFY GAPS → REVISE
            </h3>
            <p className="text-sm text-slate-600">
              Unlike generic chatbots that give uniform answers, AI Guru diagnoses student misconceptions and adapts difficulty progressively.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'TEACH',
                desc: 'Socratic step-by-step explanations in Hindi, English, or Hinglish tailored to cognitive readiness.',
                icon: BookOpen,
                color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
              },
              {
                step: '02',
                title: 'PRACTISE',
                desc: 'Deterministic math workouts with SymPy algebraic verification and step validation.',
                icon: Calculator,
                color: 'text-blue-600 bg-blue-50 border-blue-100',
              },
              {
                step: '03',
                title: 'ASSESS',
                desc: 'Adaptive diagnostic quizzes with deterministic backend scoring and strict time limits.',
                icon: Target,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
              },
              {
                step: '04',
                title: 'IDENTIFY GAPS',
                desc: 'Rule-based analytics map prerequisite voids before jumping to advanced topics.',
                icon: BrainCircuit,
                color: 'text-amber-600 bg-amber-50 border-amber-100',
              },
              {
                step: '05',
                title: 'REVISE',
                desc: 'Spaced repetition flashcards and missed-question practice banks retain long-term mastery.',
                icon: CalendarCheck,
                color: 'text-violet-600 bg-violet-50 border-violet-100',
              },
            ].map((cycle, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-3 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">{cycle.step}</span>
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${cycle.color}`}>
                    <cycle.icon className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{cycle.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{cycle.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. EIGHT COMPREHENSIVE FEATURES */}
      <section id="features" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Platform Capabilities</h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Deep Learning, Not Surface Answers
          </h3>
          <p className="text-sm text-slate-600">
            A complete suite of modular AI education tools designed to support learners from rural classrooms to premier entrance halls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Personalized AI Tutor',
              desc: 'Custom explanation depths (Foundational, Standard, Exam-Focused, Socratic). Offers hints before revealing full solutions.',
              icon: Sparkles,
            },
            {
              title: 'Regional Language Learning',
              desc: 'Bilingual Hindi, Hinglish, Marathi, and English tutoring preserving equations, technical terminology, and numerical precision.',
              icon: Languages,
            },
            {
              title: 'Adaptive Quizzes & Scoring',
              desc: 'Deterministic backend evaluation. Generates MCQs, numericals, and true/false sets directly from approved syllabus units.',
              icon: Target,
            },
            {
              title: 'PDF & Notes Assistant (RAG)',
              desc: 'Upload class notebooks or PDFs. Extract chunks with OCR support, index in FAISS, and answer with verifiable grounding citations.',
              icon: FileText,
            },
            {
              title: 'Personalized Study Planner',
              desc: 'Target exam deadlines, input daily study hours (e.g. 2 hrs/day), and receive structured chapter milestones and formula sheets.',
              icon: CalendarCheck,
            },
            {
              title: 'Progress & Gap Analytics',
              desc: 'Topic-level mastery tracking (Mastered, Developing, Learning Gap). Detects prerequisite weaknesses with rule-based diagnostics.',
              icon: BarChart3,
            },
            {
              title: 'Competitive Exam Preparation',
              desc: 'Targeted modules for JEE Main & Advanced, NEET Medical, UPSC Civil Services, GATE CSE, and Banking/SSC exams.',
              icon: GraduationCap,
            },
            {
              title: 'Academic Content Governance',
              desc: '7-stage pipeline indexing verified public educational portals (NCERT, DIKSHA, SWAYAM) with SSRF defenses and faculty verification.',
              icon: ShieldCheck,
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <feat.icon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900">{feat.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. COURSE CATEGORIES GRID */}
      <section id="courses" className="py-16 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Course Library</h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Curriculum Categories Across All Educational Stages
              </h3>
            </div>
            <button
              onClick={onExploreCourses}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Browse all syllabus units <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                category: 'School Education',
                levels: 'Classes 1 to 12 · CBSE & State Boards',
                subjects: 'Mathematics, Science, Physics, Chemistry, Biology, Social Science',
                desc: 'Foundational concepts explained in Hindi and English with step-by-step NCERT textbook grounding.',
              },
              {
                category: 'Competitive Entrance Exams',
                levels: 'JEE Main & Advanced, NEET UG, GATE CSE',
                subjects: 'Mechanics, Electrodynamics, Organic Chemistry, Genetics, Calculus',
                desc: 'High-intensity problem workouts, Free Body Diagrams, and pedigree analysis with strict time constraints.',
              },
              {
                category: 'Civil Services & Government Exams',
                levels: 'UPSC CSE, State PSC, SSC CGL, Banking & Railways',
                subjects: 'Indian Polity, Constitution, Modern History, Economy, Reasoning',
                desc: 'Article-by-article constitutional breakdown, landmark Supreme Court cases, and editorial synthesis.',
              },
              {
                category: 'Engineering & Technology',
                levels: 'B.Tech / B.E. across CSE, ECE, Mechanical, Civil',
                subjects: 'Data Structures & Algorithms, Operating Systems, Computer Networks',
                desc: 'Asymptotic analysis, balanced trees, memory allocation, and deterministic algorithmic verification.',
              },
              {
                category: 'Undergraduate & Postgrad Studies',
                levels: 'BCA, MCA, B.Sc., M.Sc., BA, MA, B.Com, M.Com',
                subjects: 'Advanced Linear Algebra, Accounting Principles, Microeconomics',
                desc: 'University syllabus alignment with modular lesson handouts and research papers.',
              },
              {
                category: 'Inclusive Skill Development',
                levels: 'Vocational, Programming & Digital Literacy',
                subjects: 'Python Fundamentals, Data Science Basics, Spoken English, Web Dev',
                desc: 'Practical hands-on workflows designed for employment readiness in tier-2 and rural centers.',
              },
            ].map((cat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all space-y-3 cursor-pointer"
                onClick={onExploreCourses}
              >
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{cat.category}</div>
                <h4 className="font-bold text-base text-slate-900">{cat.levels}</h4>
                <p className="text-xs text-slate-700 font-medium">Subjects: {cat.subjects}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                <div className="pt-2 text-xs font-semibold text-indigo-600 flex items-center gap-1">
                  View Syllabus & Enroll <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INCLUSIVE EDUCATION HIGHLIGHT */}
      <section id="inclusive" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-xl border border-slate-800">
          <div className="max-w-3xl space-y-4 mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">Inclusive Education Mandate</div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Bridging the Urban-Rural Divide Through Accessible AI
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Quality coaching and personalized tutoring have historically been restricted by geography and economic status. AI Guru is engineered with first-class optimizations for students in small towns and villages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                <WifiOff className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Low-Bandwidth Optimized</h4>
              <p className="text-slate-300 leading-relaxed">
                Text-first payload protocol with aggressive client caching and offline notes storage for patchy 2G/3G connectivity.
              </p>
            </div>

            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                <Languages className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Vernacular First</h4>
              <p className="text-slate-300 leading-relaxed">
                Native Hindi and natural Hinglish that speaks the language students think in, eliminating language barrier intimidation.
              </p>
            </div>

            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Mobile-First Touch Design</h4>
              <p className="text-slate-300 leading-relaxed">
                Fully responsive layout designed for 5.5-inch budget smartphones with 44px+ accessible touch targets and zero UI clutter.
              </p>
            </div>

            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">100% Free for Students</h4>
              <p className="text-slate-300 leading-relaxed">
                Quality education with zero fees, subscriptions, or paywalls. Accessible to every student across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CURRICULUM INTEGRITY & STUDENT PRIVACY */}
      <section id="pedagogy" className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">Curriculum Integrity & Trust</div>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Verified National Syllabi & Complete Student Privacy
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                AI Guru is built strictly around official educational frameworks, ensuring conceptual clarity, academic alignment, and complete privacy:
              </p>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                  <div>
                    <strong className="text-slate-900">NCERT & National Board Alignment:</strong> Lesson explanations and practice exercises strictly follow official CBSE, State Board, and competitive exam guidelines.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                  <div>
                    <strong className="text-slate-900">Educator-in-the-Loop Review:</strong> Course modules, chapters, and question banks are verified by academic faculty before assignment.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                  <div>
                    <strong className="text-slate-900">Step-by-Step Mathematical Clarity:</strong> Equation roots, formulas, and derivations are verified step-by-step so students understand the logic clearly.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                  <div>
                    <strong className="text-slate-900">Strict Student Data Privacy:</strong> Student notes, chat conversations, and quiz attempts are private and protected, never shared with third parties.
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Standards Card */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> Academic Standards & Safety Charter
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified Educational Platform
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-medium">Curriculum Alignment:</span>
                  <span className="font-semibold text-slate-900">CBSE, ICSE, JEE, NEET, UPSC & AICTE</span>
                </div>
                <div className="flex justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-medium">Vernacular Languages:</span>
                  <span className="font-semibold text-slate-900">Hindi, Hinglish, Marathi, English</span>
                </div>
                <div className="flex justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-medium">Content Verification:</span>
                  <span className="font-semibold text-slate-900">Teacher-Reviewed Course Modules</span>
                </div>
                <div className="flex justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-medium">Student Data Safety:</span>
                  <span className="font-semibold text-slate-900">100% Private Student Workspace</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 leading-relaxed">
                Empowering every learner with patient, personalized, and step-by-step guidance tailored to their pace and language.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start Learning with AI Guru Today
          </h2>
          <p className="text-base text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            Experience step-by-step personalized education across school, competitive exams, and college courses. Free, multilingual, and tailored to you.
          </p>
          <div className="pt-2">
            <button
              onClick={handleStartLearning}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-50 shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              {user ? 'Open Learning Workspace' : 'Create Free Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
