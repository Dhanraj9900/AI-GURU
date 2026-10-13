import React, { useState, useEffect } from 'react';
import { StudyPlan, StudyTask, Flashcard } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  BookOpen,
  RotateCw,
  Plus,
  FileText,
  Target,
  Flame,
} from 'lucide-react';

export const StudyPlanner: React.FC = () => {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'flashcards' | 'formulas'>('tasks');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const res = await api.getStudyPlan();
      setPlan(res.studyPlan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!plan) return;
    try {
      await api.toggleTask(taskId);
      setPlan({
        ...plan,
        tasks: plan.tasks.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)),
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleFlashcardMastery = async (flashcardId: string) => {
    if (!plan) return;
    try {
      await api.toggleFlashcard(flashcardId);
      setPlan({
        ...plan,
        flashcards: plan.flashcards.map((f) =>
          f.id === flashcardId ? { ...f, mastered: !f.mastered } : f
        ),
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading || !plan) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center text-xs text-slate-500">
        Loading personalized study planner and schedule...
      </div>
    );
  }

  const completedTasks = plan.tasks.filter((t) => t.isCompleted).length;
  const progressPct = plan.tasks.length > 0 ? Math.round((completedTasks / plan.tasks.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Personalized Study Roadmap
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 4-Day Streak
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {plan.targetGoal}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Deadline: {plan.targetDate} · Daily Budget: {plan.dailyHoursAvailable} hrs/day
            </p>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-2xl font-black text-indigo-600">{progressPct}%</span>
            <p className="text-[11px] text-slate-500">Milestone Completion</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Daily Study Tasks ({plan.tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'flashcards'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Spaced Flashcards ({plan.flashcards.length})
        </button>
        <button
          onClick={() => setActiveTab('formulas')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'formulas'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          High-Yield Formula Sheet
        </button>
      </div>

      {/* 1. DAILY TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Adaptive Daily Milestones</h3>
            <span className="text-xs text-slate-500">
              Completed {completedTasks} of {plan.tasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {plan.tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all cursor-pointer ${
                  task.isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
                }`}
              >
                <div className="mt-0.5 text-indigo-600">
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-600" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`font-semibold text-sm ${
                        task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        task.priority === 'high'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{task.subject}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.estimatedMinutes} mins
                    </span>
                    <span>·</span>
                    <span>Due: {task.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SPACED REPETITION FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Click any card to flip between Question and Answer.</span>
            <span>
              Mastered {plan.flashcards.filter((f) => f.mastered).length} / {plan.flashcards.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plan.flashcards.map((fc) => {
              const isFlipped = flippedCards[fc.id] || false;
              return (
                <div
                  key={fc.id}
                  onClick={() => toggleFlip(fc.id)}
                  className={`min-h-[180px] p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
                    isFlipped
                      ? 'bg-indigo-900 text-white border-indigo-800'
                      : 'bg-white border-slate-200 text-slate-900 hover:border-indigo-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-bold uppercase ${isFlipped ? 'text-indigo-300' : 'text-indigo-600'}`}>
                        {fc.subject} · {fc.topic}
                      </span>
                      <span className={`text-[10px] ${isFlipped ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {isFlipped ? 'Answer' : 'Question (Click to flip)'}
                      </span>
                    </div>

                    <p className={`text-sm font-semibold leading-relaxed ${isFlipped ? 'text-white' : 'text-slate-800'}`}>
                      {isFlipped ? fc.answer : fc.question}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100/20 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFlashcardMastery(fc.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        fc.mastered
                          ? 'bg-emerald-500 text-white'
                          : isFlipped
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {fc.mastered ? '✓ Mastered' : 'Mark as Mastered'}
                    </button>
                    <span className="text-[10px] opacity-70 flex items-center gap-1">
                      <RotateCw className="w-3 h-3" /> Flip
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. HIGH-YIELD FORMULA SHEET */}
      {activeTab === 'formulas' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <h3 className="font-bold text-slate-900 text-base">High-Yield Revision Formula Sheets</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-indigo-700 uppercase tracking-wide">Class 10 & JEE Mathematics</span>
              <div className="space-y-1.5 font-mono text-[11px] text-slate-800">
                <p>{"• Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a)"}</p>
                <p>{"• Discriminant: D = b² - 4ac (Roots real if D ≥ 0)"}</p>
                <p>{"• Trigonometric Identity: sin²θ + cos²θ = 1"}</p>
                <p>{"• Secant-Tangent Identity: sec²θ - tan²θ = 1"}</p>
                <p>{"• Arithmetic Progression: a_n = a + (n - 1)d, S_n = (n/2)[2a + (n-1)d]"}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-indigo-700 uppercase tracking-wide">JEE Physics: Mechanics</span>
              <div className="space-y-1.5 font-mono text-[11px] text-slate-800">
                <p>{"• Newton's 2nd Law: F = dp/dt = m · a"}</p>
                <p>{"• Static Friction: 0 ≤ f_s ≤ μ_s · N"}</p>
                <p>{"• Work-Energy Theorem: W_net = ΔK = (1/2)m(v_f² - v_i²)"}</p>
                <p>{"• Centripetal Acceleration: a_c = v² / r = ω² · r"}</p>
                <p>{"• String Constraint Relation: Σ T · a = 0"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
