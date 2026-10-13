import React, { useState, useEffect } from 'react';
import { TopicMastery, QuizAttempt } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import {
  BarChart3,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface ProgressDashboardProps {
  onStartRemedialPractice?: (topic: string) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onStartRemedialPractice }) => {
  const [data, setData] = useState<{
    enrolledCoursesCount: number;
    totalQuizzes: number;
    averageAccuracy: number;
    gapsCount: number;
    masteredCount: number;
    topicMastery: TopicMastery[];
    recentAttempts: QuizAttempt[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await api.getProgress();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center text-xs text-slate-500">
        Loading student learning analytics and mastery models...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Learning Gap & Topic Mastery Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Measurable, rule-based learning signals mapping your strengths and diagnosing prerequisite voids.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Overall Accuracy</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{data.averageAccuracy}%</p>
          <span className="text-[11px] text-slate-400">Across {data.totalQuizzes} completed assessments</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Mastered Topics</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{data.masteredCount}</p>
          <span className="text-[11px] text-slate-400">Consistent &gt;80% mastery</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Active Learning Gaps</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600">{data.gapsCount}</p>
          <span className="text-[11px] text-rose-600/80 font-medium">Requires prerequisite revision</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{data.enrolledCoursesCount}</p>
          <span className="text-[11px] text-slate-400">Classes 10, JEE, UPSC & B.Tech</span>
        </div>
      </div>

      {/* Actionable Learning Gap Alerts */}
      {data.gapsCount > 0 && (
        <div className="p-5 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Targeted Prerequisite Recommendations (Diagnostic Alert)</span>
          </div>

          <p className="text-xs text-rose-800 leading-relaxed">
            AI Guru detected conceptual stumbling blocks in your recent attempts. Rather than advancing into complex questions, strengthening these foundation prerequisites yields faster improvement:
          </p>

          <div className="space-y-2 pt-1">
            {data.topicMastery
              .filter((m) => m.status === 'learning_gap')
              .map((gap, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900">{gap.topic}</span>
                    <p className="text-slate-600">
                      <strong>Prerequisite Void:</strong> {gap.prerequisiteGap || 'Foundational arithmetic & sign conventions'}
                    </p>
                    <p className="text-indigo-700 font-medium">{gap.recommendedAction}</p>
                  </div>

                  <button
                    onClick={() => onStartRemedialPractice?.(gap.topic)}
                    className="shrink-0 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Start Remedial Lesson
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Topic Mastery Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Topic Mastery Breakdown</h3>
          <span className="text-xs text-slate-500">Updated after each deterministic quiz</span>
        </div>

        <div className="space-y-3">
          {data.topicMastery.map((topic, idx) => {
            const statusConfig = {
              mastered: {
                label: 'Mastered',
                badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                bar: 'bg-emerald-500',
              },
              developing: {
                label: 'Developing',
                badge: 'bg-amber-50 text-amber-800 border-amber-200',
                bar: 'bg-amber-500',
              },
              learning_gap: {
                label: 'Learning Gap',
                badge: 'bg-rose-50 text-rose-800 border-rose-200',
                bar: 'bg-rose-500',
              },
            }[topic.status];

            return (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{topic.topic}</span>
                    <span className="text-slate-500">({topic.subject})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusConfig.badge}`}
                    >
                      {statusConfig.label}
                    </span>
                    <span className="font-mono font-bold text-slate-800">{topic.level}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${statusConfig.bar} transition-all duration-500`}
                    style={{ width: `${topic.level}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>Attempts: {topic.attemptsCount}</span>
                  <span className="truncate max-w-md">{topic.recommendedAction}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Quiz Attempts */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Recent Assessment History</h3>

        <div className="space-y-3">
          {data.recentAttempts.map((att) => (
            <div
              key={att.id}
              className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900">{att.quizTitle}</h4>
                <div className="text-slate-500 text-[11px]">
                  <span>Score: {att.score}/{att.totalQuestions}</span>
                  <span className="mx-1.5">·</span>
                  <span>Time: {Math.round(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s</span>
                  <span className="mx-1.5">·</span>
                  <span>Date: {new Date(att.attemptedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div
                className={`text-sm font-extrabold ${
                  att.accuracyPercentage >= 75
                    ? 'text-emerald-600'
                    : att.accuracyPercentage >= 50
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {att.accuracyPercentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
