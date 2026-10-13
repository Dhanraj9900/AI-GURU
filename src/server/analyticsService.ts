import { db } from './db.ts';
import { Quiz, QuizAttempt, TopicMastery } from '../types/index.ts';

export interface SubmitQuizPayload {
  quizId: string;
  userId: string;
  timeSpentSeconds: number;
  answers: {
    questionId: string;
    studentAnswer: string;
  }[];
}

/**
 * Deterministic Assessment & Learning Analytics Service.
 * Scores quizzes strictly via deterministic rule verification and updates
 * topic-level mastery signals, detecting learning gaps and prerequisite voids.
 */
export function scoreAndAnalyzeQuiz(payload: SubmitQuizPayload): QuizAttempt {
  const { quizId, userId, timeSpentSeconds, answers } = payload;
  const quiz = db.quizzes.find((q) => q.id === quizId);

  if (!quiz) {
    throw new Error(`Quiz with id ${quizId} not found.`);
  }

  let correctCount = 0;
  const submittedAnswers: QuizAttempt['submittedAnswers'] = [];
  const topicStats: Record<string, { total: number; correct: number; prerequisite?: string }> = {};

  for (const q of quiz.questions) {
    const studentAns = answers.find((a) => a.questionId === q.id)?.studentAnswer?.trim() || '';
    
    // Deterministic string & option normalization
    const isCorrect = normalizeAnswer(studentAns) === normalizeAnswer(q.correctAnswer);
    if (isCorrect) correctCount++;

    submittedAnswers.push({
      questionId: q.id,
      studentAnswer: studentAns || '(Unanswered)',
      isCorrect,
      explanation: q.explanation,
    });

    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { total: 0, correct: 0, prerequisite: q.prerequisiteConcept };
    }
    topicStats[q.topic].total += 1;
    if (isCorrect) {
      topicStats[q.topic].correct += 1;
    }
  }

  const totalQuestions = quiz.questions.length;
  const accuracyPercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Build topic-level gap analysis
  const topicBreakdown: QuizAttempt['topicBreakdown'] = Object.entries(topicStats).map(([topic, stats]) => {
    const topicAccuracy = Math.round((stats.correct / stats.total) * 100);
    const learningGapDetected = topicAccuracy < 60;
    let remedialAction = 'Topic mastered. Keep retaining via weekly practice.';

    if (learningGapDetected) {
      remedialAction = stats.prerequisite
        ? `Learning Gap Flagged: Prioritize revision of prerequisite '${stats.prerequisite}'.`
        : `Learning Gap Flagged: Complete 3 targeted remedial practice problems in ${topic}.`;
    } else if (topicAccuracy < 80) {
      remedialAction = `Developing: Revise edge cases and practice 2 medium difficulty problems.`;
    }

    return {
      topic,
      total: stats.total,
      correct: stats.correct,
      accuracy: topicAccuracy,
      learningGapDetected,
      remedialAction,
    };
  });

  const attempt: QuizAttempt = {
    id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    quizId,
    quizTitle: quiz.title,
    userId,
    score: correctCount,
    totalQuestions,
    accuracyPercentage,
    timeSpentSeconds,
    submittedAnswers,
    topicBreakdown,
    attemptedAt: new Date().toISOString(),
  };

  // Record attempt in database
  db.quizAttempts.push(attempt);

  // Update persistent topic mastery matrix for this student
  updateUserTopicMastery(userId, quiz.subject, topicBreakdown);

  // Record audit log
  db.auditLogs.push({
    id: `aud_${Date.now()}`,
    action: 'QUIZ_EVALUATION_COMPLETED',
    userId,
    timestamp: new Date().toISOString(),
    details: `Scored quiz '${quiz.title}': ${correctCount}/${totalQuestions} (${accuracyPercentage}%).`,
  });

  return attempt;
}

function normalizeAnswer(ans: string): string {
  if (!ans) return '';
  return ans.trim().toLowerCase().replace(/^[a-d]\)\s*/i, '');
}

function updateUserTopicMastery(
  userId: string,
  subject: string,
  breakdown: QuizAttempt['topicBreakdown']
): void {
  if (!db.topicMastery[userId]) {
    db.topicMastery[userId] = [];
  }

  const userMasteryList = db.topicMastery[userId];

  for (const item of breakdown) {
    const existingIndex = userMasteryList.findIndex((m) => m.topic.toLowerCase() === item.topic.toLowerCase());

    if (existingIndex >= 0) {
      const existing = userMasteryList[existingIndex];
      // Weighted moving average: 60% historical + 40% latest attempt
      const newLevel = Math.round(existing.level * 0.6 + item.accuracy * 0.4);
      let status: TopicMastery['status'] = 'developing';
      if (newLevel >= 80) status = 'mastered';
      else if (newLevel < 55) status = 'learning_gap';

      userMasteryList[existingIndex] = {
        ...existing,
        level: newLevel,
        status,
        attemptsCount: existing.attemptsCount + 1,
        lastPracticed: new Date().toISOString(),
        recommendedAction: item.remedialAction,
      };
    } else {
      let status: TopicMastery['status'] = 'developing';
      if (item.accuracy >= 80) status = 'mastered';
      else if (item.accuracy < 55) status = 'learning_gap';

      userMasteryList.push({
        topic: item.topic,
        subject,
        level: item.accuracy,
        status,
        attemptsCount: 1,
        lastPracticed: new Date().toISOString(),
        recommendedAction: item.remedialAction,
      });
    }
  }
}
