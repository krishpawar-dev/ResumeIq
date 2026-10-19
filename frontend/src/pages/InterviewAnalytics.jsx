import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  Award,
  Flame,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Layers,
  Clock,
  Briefcase,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Loader2
} from 'lucide-react';
import InterviewNavTabs from '../components/interview/InterviewNavTabs';
import { interviewService } from '../services/interviewService';

export default function InterviewAnalytics() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await interviewService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('[Fetch Analytics Error]', err);
      setErrorMessage(err.response?.data?.message || 'We could not load your interview analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <InterviewNavTabs />
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-sky-500 mb-3" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Loading your interview analytics...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <InterviewNavTabs />
        <div className="p-8 rounded-2xl bg-white dark:bg-[#0f172a] border border-rose-200 dark:border-rose-900/50 text-center max-w-md mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Analytics Unavailable
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-5">
            {errorMessage}
          </p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    totalQuestionsAnswered = 0,
    mockInterviewsCount = 0,
    averageScore = 0,
    practiceStreak = 0,
    readiness = { score: null, status: 'insufficient_data' },
    scoreTrend = [],
    criteriaAverages = {},
    weakestCriterion = null,
    recommendation = null,
    recentActivity = [],
    recentMockSessions = []
  } = analytics || {};

  // Score Trend Chart Dimensions & Calculation
  const trendPoints = scoreTrend.filter((p) => p.score !== null && p.score !== undefined);
  const chartHeight = 160;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 24;

  const getCoordinates = () => {
    if (trendPoints.length < 2) return [];
    const minScore = 0;
    const maxScore = 10;

    return trendPoints.map((p, idx) => {
      const x = paddingX + (idx / (trendPoints.length - 1)) * (chartWidth - 2 * paddingX);
      const y = chartHeight - paddingY - ((p.score - minScore) / (maxScore - minScore)) * (chartHeight - 2 * paddingY);
      return { x, y, ...p };
    });
  };

  const coordinates = getCoordinates();
  const pathD = coordinates.length > 1
    ? coordinates.reduce((acc, curr, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`, '')
    : '';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Navigation Tabs */}
      <InterviewNavTabs />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold text-sky-600 dark:text-cyan-400">
              Intelligence Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Interview Analytics
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Deterministic performance metrics derived from real evaluated questions, practice drills, and mock interviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/interview/practice')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch Practice Mode</span>
          </button>
        </div>
      </div>

      {/* Top 5 Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Questions Answered */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Questions Answered
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalQuestionsAnswered}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Evaluated answers only</span>
          </div>
        </div>

        {/* Mock Interviews */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Mock Interviews
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {mockInterviewsCount}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-sky-500" />
            <span>Full completed sessions</span>
          </div>
        </div>

        {/* Average Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Average Score
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
              {averageScore > 0 ? averageScore.toFixed(1) : '—'}
              <span className="text-xs text-slate-400 font-normal">/10</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Across all evaluated questions</span>
          </div>
        </div>

        {/* Practice Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Practice Streak
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
              {practiceStreak}
              <span className="text-xs text-slate-400 font-normal">{practiceStreak === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Consecutive active days</span>
          </div>
        </div>

        {/* Readiness Score Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-cyan-500/10 dark:from-slate-900 dark:via-[#09152b] dark:to-slate-900 border border-sky-300 dark:border-sky-800/80 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-cyan-400 mb-1 flex items-center justify-between">
              <span>Readiness Index</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            {readiness.status === 'insufficient_data' ? (
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                  Baseline Building
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Answer at least 3 questions to unlock index.
                </div>
              </div>
            ) : (
              <div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
                  {readiness.score}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium capitalize mt-0.5">
                  {readiness.level || 'Developing'} Readiness
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 text-[10px] text-slate-500 dark:text-slate-400">
            ResumeIQ Practice Readiness Indicator
          </div>
        </div>
      </div>

      {/* Signature Experience: Weakness Detection & Targeted Practice Recommendation */}
      {weakestCriterion && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-50 via-white to-cyan-50 dark:from-slate-900 dark:via-[#0b1426] dark:to-slate-900 border border-sky-200 dark:border-sky-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-cyan-400 border border-sky-300 dark:border-sky-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-sky-600 dark:text-cyan-400">
                  Adaptive Intelligence Loop
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-cyan-300 font-semibold">
                  {weakestCriterion.score?.toFixed(1)}/10 Average
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {weakestCriterion.criterion} is your highest-leverage improvement opportunity.
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                {recommendation?.message || 'Focusing on this criterion will produce the quickest boost to your interview performance.'}
              </p>
            </div>
          </div>

          {recommendation?.actionPath && (
            <Link
              to={recommendation.actionPath}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>{recommendation.actionLabel || 'Start Targeted Drill'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {/* Main Analytics Row: Score Progression Chart & Criteria Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Progression Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-500" />
                Score Progression Over Time
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluated score history across mock interviews and practice sessions.
              </p>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              0–10 Scale
            </span>
          </div>

          {/* SVG Line Chart */}
          {trendPoints.length < 2 ? (
            <div className="py-16 text-center text-slate-400 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Not enough practice data yet.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Complete a few evaluated answers or practice sessions to visualize your historical score progression.
              </p>
            </div>
          ) : (
            <div className="relative pt-2">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-44 sm:h-52 overflow-visible select-none"
              >
                {/* Horizontal Grid lines */}
                {[2, 4, 6, 8, 10].map((val) => {
                  const y = chartHeight - paddingY - (val / 10) * (chartHeight - 2 * paddingY);
                  return (
                    <g key={val}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="currentColor"
                        className="text-slate-100 dark:text-slate-800/80"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="text-[10px] fill-slate-400 font-mono"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Score Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#trendGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Gradient Def */}
                <defs>
                  <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>

                {/* Interactive Points */}
                {coordinates.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.date === pt.date ? 6 : 4}
                    className="cursor-pointer transition-all fill-white dark:fill-slate-900 stroke-cyan-500 stroke-2 hover:stroke-sky-400"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>

              {/* Tooltip */}
              {hoveredPoint && (
                <div className="absolute top-2 right-4 p-2.5 rounded-xl bg-slate-900/90 dark:bg-slate-800/90 text-white text-xs shadow-lg backdrop-blur-sm pointer-events-none animate-in fade-in duration-150">
                  <div className="text-[11px] text-slate-400">{hoveredPoint.date}</div>
                  <div className="font-bold text-cyan-400 flex items-baseline gap-1 mt-0.5">
                    Score: {hoveredPoint.score.toFixed(1)} / 10
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5 Evaluation Criteria Breakdown (1 Col) */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-500" />
              Criteria Performance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Weighted breakdown across all evaluated answers.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {[
              { key: 'relevance', name: 'Relevance', weight: '30%', val: criteriaAverages.relevance || 0 },
              { key: 'clarity', name: 'Clarity', weight: '20%', val: criteriaAverages.clarity || 0 },
              { key: 'starMethod', name: 'STAR Framework', weight: '20%', val: criteriaAverages.starMethod || 0 },
              { key: 'technicalAccuracy', name: 'Technical Accuracy', weight: '15%', val: criteriaAverages.technicalAccuracy || 0 },
              { key: 'completeness', name: 'Completeness', weight: '15%', val: criteriaAverages.completeness || 0 }
            ].map((c) => {
              const pct = Math.min(100, Math.max(0, (c.val / 10) * 100));
              return (
                <div key={c.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {c.name} <span className="text-[10px] text-slate-400">({c.weight})</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {c.val > 0 ? c.val.toFixed(1) : '—'} <span className="text-[10px] text-slate-400 font-normal">/10</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-sky-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Readiness Breakdown Detailed Card */}
      {readiness.factors && (
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Readiness Score Methodology
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Deterministic calculation combining volume, mock interviews, consistency, and recent performance.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {readiness.score}
              </span>
              <span className="text-xs text-slate-400"> / 100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Questions Evaluated</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {readiness.factors.questionsEvaluated}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Mock Interviews</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {readiness.factors.mockInterviewsCompleted}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Active Streak</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {readiness.factors.practiceStreakDays} days
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Recent Trend</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 capitalize">
                {readiness.factors.recentTrend}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Mock Interview Sessions */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-500" />
              Recent Mock Interview Sessions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your latest completed mock interviews with difficulty, focus, answered questions and score.
            </p>
          </div>
          <Link to="/interview" className="text-xs font-semibold text-sky-600 dark:text-cyan-400 hover:underline">Start new</Link>
        </div>

        {recentMockSessions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No completed mock interviews yet.
          </div>
        ) : (
          <div className="space-y-2">
            {recentMockSessions.slice(0, 8).map((session) => (
              <div key={String(session.id)} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{session.targetRole}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-2">
                      <span className="capitalize">{session.difficulty}</span>
                      <span>•</span>
                      <span className="capitalize">{session.interviewType}</span>
                      <span>•</span>
                      <span className="capitalize">{session.focus}</span>
                      <span>•</span>
                      <span>{session.duration} min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 dark:text-white">{session.answeredCount}/{session.questionCount}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Answered</div>
                    </div>
                    <div className="text-right min-w-[60px]">
                      <div className="text-sm font-black text-sky-600 dark:text-cyan-400">{typeof session.score === 'number' ? `${session.score.toFixed(1)}/10` : '—'}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Score</div>
                    </div>
                    <div className="text-[11px] text-slate-400">{new Date(session.date).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Stream */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-500" />
            Recent Preparation Activity
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {recentActivity.length} events logged
          </span>
        </div>

        {recentActivity.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No recent interview activity. Start a practice drill or mock interview to begin tracking.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentActivity.slice(0, 8).map((act, idx) => (
              <div
                key={idx}
                className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-md font-semibold capitalize ${
                    act.type === 'mock_interview'
                      ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-cyan-400 border border-sky-200 dark:border-sky-800/60'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {act.type === 'mock_interview' ? 'Mock Interview' : `Practice: ${String(act.type || '').replace('practice_', '')}`}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {act.title}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {typeof act.answered === 'number' ? `${act.answered}/${act.totalQuestions || '?'} answered` : ''}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {typeof act.score === 'number' ? `${act.score.toFixed(1)}/10` : '—'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(act.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
