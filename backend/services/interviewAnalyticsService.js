const MockInterview = require('../models/MockInterview');
const PracticeSession = require('../models/PracticeSession');
const InterviewAnswer = require('../models/InterviewAnswer');
const Evaluation = require('../models/Evaluation');

/**
 * Calculate user's consecutive day practice streak
 */
const calculatePracticeStreak = (activityDates = []) => {
  if (!activityDates || activityDates.length === 0) return 0;

  // Convert to unique YYYY-MM-DD date strings sorted descending
  const uniqueDays = Array.from(
    new Set(
      activityDates
        .filter(Boolean)
        .map((d) => new Date(d).toISOString().slice(0, 10))
    )
  ).sort().reverse();

  if (uniqueDays.length === 0) return 0;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Check if latest activity was today or yesterday to keep streak alive
  const latestActivity = uniqueDays[0];
  if (latestActivity !== todayStr && latestActivity !== yesterdayStr) {
    return 0; // Streak broken
  }

  let streak = 1;
  let currentDate = new Date(latestActivity);

  for (let i = 1; i < uniqueDays.length; i++) {
    const prevDate = new Date(uniqueDays[i]);
    const diffTime = Math.abs(currentDate - prevDate);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Calculate deterministic Readiness Score with maturity threshold
 */
const calculateReadiness = ({
  totalQuestions,
  mockCount,
  practiceCount,
  avgScore,
  streak,
  recentAvgScore
}) => {
  // Confidence / Data Maturity Guard
  if (totalQuestions < 3) {
    return {
      score: null,
      status: 'insufficient_data',
      message: 'Complete at least 3 practice questions or a mock interview to establish your baseline readiness score.',
      factors: {
        questionsEvaluated: totalQuestions,
        minimumRequired: 3,
        mockInterviewsCompleted: mockCount,
        practiceStreakDays: streak,
        recentTrend: 'building'
      },
      level: 'Baseline'
    };
  }

  // 1. Performance weight (40 points max)
  const performancePts = Math.min(40, Math.max(0, (avgScore / 10) * 40));

  // 2. Volume & Experience (25 points max, saturated at 30 questions)
  const volumePts = Math.min(25, (totalQuestions / 30) * 25);

  // 3. Mock interview experience (15 points max, saturated at 3 mock interviews)
  const mockPts = Math.min(15, (mockCount / 3) * 15);

  // 4. Consistency & Practice Streak (10 points max, saturated at 5-day streak)
  const streakPts = Math.min(10, (streak / 5) * 10);

  // 5. Recent performance trend bonus (10 points max)
  const trendDiff = recentAvgScore - avgScore;
  const trendPts = Math.min(10, Math.max(0, 5 + trendDiff * 3));

  const rawScore = performancePts + volumePts + mockPts + streakPts + trendPts;
  const score = Math.min(100, Math.max(25, Math.round(rawScore)));

  return {
    score,
    status: 'ready',
    message: score >= 80 ? 'Strong readiness baseline based on your evaluated performance.' : 'Baseline established; targeted practice can strengthen the lowest-scoring dimensions.',
    factors: {
      questionsEvaluated: totalQuestions,
      completedMockInterviews: mockCount,
      mockInterviewsCompleted: mockCount,
      completedPracticeSessions: practiceCount,
      practiceStreakDays: streak,
      averageScore: Math.round(avgScore * 10) / 10,
      recentTrend: recentAvgScore > avgScore + 0.2 ? 'improving' : recentAvgScore < avgScore - 0.2 ? 'declining' : 'stable'
    },
    level: score >= 80 ? 'Strong' : score >= 60 ? 'Developing' : 'Building'
  };
};

/**
 * Get comprehensive analytics for authenticated user
 */
const getUserInterviewAnalytics = async (userId) => {
  // 1. Count completed Mock Interviews & Practice Sessions
  const [completedMocks, completedPracticeSessions] = await Promise.all([
    MockInterview.find({ userId, status: 'completed' }).sort({ completedAt: -1 }),
    PracticeSession.find({ userId, status: 'completed' }).sort({ completedAt: -1 })
  ]);

  // 2. Fetch all evaluations for real metrics
  const evaluations = await Evaluation.find({ userId }).sort({ createdAt: 1 });
  const totalQuestionsAnswered = evaluations.length;

  // 3. Activity dates for streak
  const activityDates = [];
  evaluations.forEach((ev) => activityDates.push(ev.createdAt));
  completedMocks.forEach((m) => activityDates.push(m.completedAt || m.createdAt));
  completedPracticeSessions.forEach((p) => activityDates.push(p.completedAt || p.createdAt));

  const practiceStreak = calculatePracticeStreak(activityDates);

  // 4. Calculate real averages
  let totalScoreSum = 0;
  let totalRelevance = 0;
  let totalClarity = 0;
  let totalStar = 0;
  let totalTech = 0;
  let totalCompleteness = 0;

  evaluations.forEach((ev) => {
    totalScoreSum += ev.overallScore || 0;
    totalRelevance += ev.relevanceScore || 0;
    totalClarity += ev.clarityScore || 0;
    totalStar += ev.starScore || 0;
    totalTech += ev.technicalAccuracyScore || 0;
    totalCompleteness += ev.completenessScore || 0;
  });

  const averageScore = totalQuestionsAnswered > 0
    ? Math.round((totalScoreSum / totalQuestionsAnswered) * 10) / 10
    : 0;

  // Recent 5 evaluations average for trend bonus
  const recentSlice = evaluations.slice(-5);
  const recentAvgScore = recentSlice.length > 0
    ? recentSlice.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / recentSlice.length
    : averageScore;

  // Criteria Averages
  const criteriaAverages = totalQuestionsAnswered > 0
    ? {
        relevance: Math.round(totalRelevance / totalQuestionsAnswered),
        clarity: Math.round(totalClarity / totalQuestionsAnswered),
        star: Math.round(totalStar / totalQuestionsAnswered),
        technicalAccuracy: Math.round(totalTech / totalQuestionsAnswered),
        completeness: Math.round(totalCompleteness / totalQuestionsAnswered)
      }
    : {
        relevance: 0,
        clarity: 0,
        star: 0,
        technicalAccuracy: 0,
        completeness: 0
      };

  // 5. Weakest Criterion & Targeted Practice Recommendation (Purple Cow intelligence)
  let weakestCriterion = 'star';
  let minScore = 101;
  const criteriaKeys = ['relevance', 'clarity', 'star', 'technicalAccuracy', 'completeness'];

  for (const key of criteriaKeys) {
    if (criteriaAverages[key] > 0 && criteriaAverages[key] < minScore) {
      minScore = criteriaAverages[key];
      weakestCriterion = key;
    }
  }

  const recommendations = {
    star: {
      criterion: 'STAR Structure',
      score: criteriaAverages.star,
      actionText: 'Try Category Focus → Behavioral',
      actionLink: '/interview/practice/category',
      category: 'behavioral',
      advice: 'Your behavioral answers would benefit from a more distinct Situation, Task, Action, Result framework.'
    },
    completeness: {
      criterion: 'Completeness',
      score: criteriaAverages.completeness,
      actionText: 'Try Timed Practice',
      actionLink: '/interview/practice/timed',
      category: 'timed',
      advice: 'Practice structuring answers thoroughly under realistic time limits so no crucial steps get skipped.'
    },
    technicalAccuracy: {
      criterion: 'Technical Accuracy',
      score: criteriaAverages.technicalAccuracy,
      actionText: 'Try Category Focus → Technical',
      actionLink: '/interview/practice/category',
      category: 'technical',
      advice: 'Refine your architectural vocabulary and technical decisions with focused technical practice.'
    },
    clarity: {
      criterion: 'Communication Clarity',
      score: criteriaAverages.clarity,
      actionText: 'Try Flashcard Mode',
      actionLink: '/interview/practice/flashcard',
      category: 'flashcard',
      advice: 'Practice concise 2-minute answers to reduce filler words and elevate executive clarity.'
    },
    relevance: {
      criterion: 'Question Relevance',
      score: criteriaAverages.relevance,
      actionText: 'Try Company-Specific Practice',
      actionLink: '/interview/practice/company',
      category: 'company',
      advice: 'Align your answers directly with target company themes and role requirements.'
    }
  };

  const targetedRecommendation = recommendations[weakestCriterion] || recommendations.star;

  // 6. Chronological Score Trend (Aggregated per calendar date)
  const trendMap = {};
  evaluations.forEach((ev) => {
    const day = new Date(ev.createdAt).toISOString().slice(0, 10);
    if (!trendMap[day]) {
      trendMap[day] = { total: 0, count: 0 };
    }
    trendMap[day].total += ev.overallScore || 0;
    trendMap[day].count += 1;
  });

  const scoreTrend = Object.keys(trendMap).sort().map((date) => ({
    date,
    score: Math.round((trendMap[date].total / trendMap[date].count) * 10) / 10,
    questionsCount: trendMap[date].count
  }));

  // 7. Calculate Readiness Score
  const readiness = calculateReadiness({
    totalQuestions: totalQuestionsAnswered,
    mockCount: completedMocks.length,
    practiceCount: completedPracticeSessions.length,
    avgScore: averageScore,
    streak: practiceStreak,
    recentAvgScore
  });

  // 8. Recent activity list
  const answeredByMock = {};
  const answeredByPractice = {};
  evaluations.forEach((ev) => {
    if (ev.mockInterviewId) {
      const key = String(ev.mockInterviewId);
      answeredByMock[key] = (answeredByMock[key] || 0) + 1;
    }
    if (ev.practiceSessionId) {
      const key = String(ev.practiceSessionId);
      answeredByPractice[key] = (answeredByPractice[key] || 0) + 1;
    }
  });

  const recentActivity = [
    ...completedMocks.map((m) => ({
      id: m._id,
      type: 'mock_interview',
      title: `${m.targetRole} • ${m.interviewType} • ${m.difficulty}`,
      score: m.overallScore,
      date: m.completedAt || m.createdAt,
      answered: answeredByMock[String(m._id)] || 0,
      totalQuestions: m.questionIds?.length || 0,
      duration: m.duration,
      difficulty: m.difficulty,
      focus: m.focus,
      link: `/interview/results/${m._id}`
    })),
    ...completedPracticeSessions.map((p) => ({
      id: p._id,
      type: `practice_${p.sessionType}`,
      title: `${p.sessionType.toUpperCase()} Practice • ${p.targetRole || p.category || 'General'}`,
      score: p.averageScore,
      date: p.completedAt || p.createdAt,
      answered: answeredByPractice[String(p._id)] || p.questionsAnswered || 0,
      totalQuestions: p.questionIds?.length || 0,
      duration: p.duration,
      difficulty: p.difficulty || 'mid',
      link: `/interview/practice/${p.sessionType}`
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  const recentMockSessions = completedMocks.slice(0, 10).map((m) => ({
    id: m._id,
    targetRole: m.targetRole,
    interviewType: m.interviewType,
    difficulty: m.difficulty,
    focus: m.focus,
    duration: m.duration,
    questionCount: m.questionIds?.length || 0,
    answeredCount: answeredByMock[String(m._id)] || 0,
    score: m.overallScore,
    date: m.completedAt || m.createdAt,
    status: m.status
  }));

  return {
    totalQuestionsAnswered,
    mockInterviewsCount: completedMocks.length,
    practiceSessionsCount: completedPracticeSessions.length,
    averageScore,
    practiceStreak,
    readinessScore: readiness,
    readiness,
    criteriaAverages,
    weakestCriterion: targetedRecommendation ? {
      criterion: targetedRecommendation.criterion,
      score: targetedRecommendation.score / 10
    } : null,
    targetedRecommendation,
    recommendation: targetedRecommendation ? {
      message: targetedRecommendation.advice,
      actionPath: targetedRecommendation.actionLink,
      actionLabel: targetedRecommendation.actionText
    } : null,
    scoreTrend,
    recentActivity,
    recentMockSessions
  };
};

module.exports = {
  getUserInterviewAnalytics,
  calculatePracticeStreak,
  calculateReadiness
};
