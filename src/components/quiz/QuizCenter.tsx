import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt, Question } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import {
  Target,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Award,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

interface QuizCenterProps {
  onGoToPlanner?: () => void;
}

export const QuizCenter: React.FC<QuizCenterProps> = ({ onGoToPlanner }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);

  // Generator form
  const [showGenerator, setShowGenerator] = useState(false);
  const [genSubject, setGenSubject] = useState('Mathematics');
  const [genTopic, setGenTopic] = useState('Quadratic Equations');
  const [genDifficulty, setGenDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [genCount, setGenCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const res = await api.getQuizzes();
      setQuizzes(res.quizzes);
    } catch (err) {
      console.error(err);
    }
  };

  // Timer countdown during active quiz
  useEffect(() => {
    if (!activeQuiz || latestAttempt) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz, latestAttempt, selectedAnswers]);

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setTimeRemaining((quiz.timeLimitMinutes || 10) * 60);
    setLatestAttempt(null);
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: option,
    });
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const timeSpent = (activeQuiz.timeLimitMinutes || 10) * 60 - timeRemaining;
      const answerList = activeQuiz.questions.map((q) => ({
        questionId: q.id,
        studentAnswer: selectedAnswers[q.id] || '',
      }));

      const res = await api.submitQuiz(activeQuiz.id, Math.max(timeSpent, 15), answerList);
      setLatestAttempt(res.attempt);
    } catch (err: any) {
      alert(err.message || 'Quiz submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateCustomQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.generateQuiz({
        subject: genSubject,
        topic: genTopic,
        difficulty: genDifficulty,
        count: genCount,
      });
      setQuizzes([res.quiz, ...quizzes]);
      setShowGenerator(false);
      handleStartQuiz(res.quiz);
    } catch (err: any) {
      alert(err.message || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  // 1. RESULT REVIEW VIEW
  if (latestAttempt) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
        {/* Score Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-200 mx-auto flex items-center justify-center text-indigo-600">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Assessment Results & Performance Summary
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {latestAttempt.quizTitle}
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated against verified answer keys
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 block">Total Score</span>
              <span className="text-xl font-extrabold text-slate-900">
                {latestAttempt.score} / {latestAttempt.totalQuestions}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 block">Accuracy</span>
              <span
                className={`text-xl font-extrabold ${
                  latestAttempt.accuracyPercentage >= 75
                    ? 'text-emerald-600'
                    : latestAttempt.accuracyPercentage >= 50
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {latestAttempt.accuracyPercentage}%
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 block">Time Spent</span>
              <span className="text-xl font-extrabold text-slate-900">
                {Math.round(latestAttempt.timeSpentSeconds / 60)}m {latestAttempt.timeSpentSeconds % 60}s
              </span>
            </div>
          </div>

          {/* Topic Learning Gap Detection */}
          <div className="pt-4 max-w-2xl mx-auto space-y-3 text-left">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Topic-Level Mastery & Gap Detection
            </h4>

            {latestAttempt.topicBreakdown.map((t, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  t.learningGapDetected
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{t.topic}</span>
                  <span>{t.accuracy}% Accuracy</span>
                </div>
                <div className="flex items-start gap-1.5 text-[11px]">
                  {t.learningGapDetected ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  )}
                  <span>{t.remedialAction}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleStartQuiz(activeQuiz!)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake This Quiz
            </button>
            <button
              onClick={() => {
                setActiveQuiz(null);
                setLatestAttempt(null);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Back to Quizzes
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-5">
          <h4 className="text-sm font-bold text-slate-900">Step-by-Step Question Review</h4>

          <div className="space-y-4">
            {activeQuiz?.questions.map((q, idx) => {
              const submission = latestAttempt.submittedAnswers.find((s) => s.questionId === q.id);
              const isCorrect = submission?.isCorrect;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border space-y-2.5 text-xs ${
                    isCorrect ? 'bg-slate-50 border-slate-200' : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Q{idx + 1}. {q.questionText}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600">
                    <div>
                      <strong>Your Answer:</strong> {submission?.studentAnswer || '(Unanswered)'}
                    </div>
                    <div>
                      <strong>Correct Answer:</strong>{' '}
                      <span className="text-emerald-700 font-semibold">{q.correctAnswer}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>

                  {q.prerequisiteConcept && (
                    <div className="text-[10px] text-indigo-700 font-medium">
                      Prerequisite Concept: {q.prerequisiteConcept}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE TEST TAKING VIEW
  if (activeQuiz) {
    const currentQ = activeQuiz.questions[currentQIndex];
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const progressPercent = Math.round(((currentQIndex + 1) / activeQuiz.questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Test Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">{activeQuiz.title}</h3>
            <span className="text-xs text-slate-500">
              Question {currentQIndex + 1} of {activeQuiz.questions.length} · {activeQuiz.topic}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              Difficulty: {currentQ.difficulty}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.questionText}
            </h4>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options?.map((opt, oIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === opt;
              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-600 text-indigo-900 shadow-2xs ring-1 ring-indigo-600'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Navigation between questions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            {currentQIndex < activeQuiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQIndex((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Next Question <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>

        {/* Question Selector Dots */}
        <div className="flex justify-center gap-2">
          {activeQuiz.questions.map((q, idx) => {
            const answered = Boolean(selectedAnswers[q.id]);
            const isCurrent = currentQIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setCurrentQIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                    : answered
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. QUIZ LIST & GENERATOR VIEW
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Adaptive Quizzes & Diagnostic Assessments
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Diagnose topic strengths, identify learning gaps, and receive targeted practice recommendations.
          </p>
        </div>

        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          {showGenerator ? 'Close Generator' : 'Generate Custom Quiz'}
        </button>
      </div>

      {/* Generator Accordion */}
      {showGenerator && (
        <form
          onSubmit={handleGenerateCustomQuiz}
          className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5 sm:p-6 space-y-4 animate-fade-in"
        >
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Configure Adaptive Assessment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Subject</label>
              <input
                type="text"
                value={genSubject}
                onChange={(e) => setGenSubject(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
                placeholder="e.g. Mathematics"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Chapter / Topic</label>
              <input
                type="text"
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
                placeholder="e.g. Quadratic Equations"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Difficulty</label>
              <select
                value={genDifficulty}
                onChange={(e) => setGenDifficulty(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="easy">Easy (Foundational)</option>
                <option value="medium">Medium (Standard Board/Exam)</option>
                <option value="hard">Hard (Advanced Problem Solving)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Question Count</label>
              <select
                value={genCount}
                onChange={(e) => setGenCount(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value={3}>3 Questions (Quick check)</option>
                <option value={5}>5 Questions (Diagnostic)</option>
                <option value={10}>10 Questions (Comprehensive)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {generating ? 'Assembling Balanced Questions...' : 'Start Assessment Now'}
            </button>
          </div>
        </form>
      )}

      {/* Quiz Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wider text-indigo-600">
                  {quiz.subject}
                </span>
                <span className="text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {quiz.timeLimitMinutes || 10} mins
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900">{quiz.title}</h3>
              <p className="text-xs text-slate-500">
                Covers: {quiz.topic} · {quiz.questions.length} Questions · Difficulty: {quiz.difficulty}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-emerald-700 font-medium">✓ Instant Evaluation</span>
              <button
                onClick={() => handleStartQuiz(quiz)}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
              >
                Start Quiz <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
