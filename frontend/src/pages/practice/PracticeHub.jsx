import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  Clock,
  Layers,
  Building2,
  Users,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  BarChart3,
  Calendar,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import InterviewNavTabs from '../../components/interview/InterviewNavTabs';
import { interviewService } from '../../services/interviewService';

export default function PracticeHub() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [analyticsRes, historyRes] = await Promise.all([
          interviewService.getAnalytics().catch(() => null),
          interviewService.getPracticeHistory().catch(() => ({ history: [] }))
        ]);

        if (analyticsRes) {
          setAnalytics(analyticsRes);
        }
        setHistory(historyRes.history || []);
      } catch (err) {
        console.error('[Load Practice Hub Data Error]', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const practiceModes = [
    {
      id: 'flashcard',
      title: 'Flashcard Mode',
      path: '/interview/practice/flashcard',
      icon: Zap,
      badge: 'Rapid Feedback',
      badgeColor: 'sky',
      description: 'Quick single questions with instant AI feedback. Ideal for fast 2-minute drills.',
      trains: 'Rapid concept recall, concise delivery, STAR structure reflexes',
      gradient: 'from-sky-500/10 to-cyan-500/10 dark:from-sky-500/5 dark:to-cyan-500/5',
      accentColor: 'text-sky-600 dark:text-cyan-400',
      borderColor: 'hover:border-sky-400 dark:hover:border-sky-500'
    },
    {
      id: 'timed',
      title: 'Timed Practice',
      path: '/interview/practice/timed',
      icon: Clock,
      badge: 'Time Pressure',
      badgeColor: 'amber',
      description: 'Test your composure under strict countdown limits with authoritative server timestamps.',
      trains: 'Pacing under pressure, avoiding filler, structured time management',
      gradient: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5',
      accentColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'hover:border-amber-400 dark:hover:border-amber-500'
    },
    {
      id: 'category',
      title: 'Category Focus',
      path: '/interview/practice/category',
      icon: Layers,
      badge: 'Skill Mastery',
      badgeColor: 'indigo',
      description: 'Zero in on a specific interview dimension: Technical, Behavioral, Situational, or Project.',
      trains: 'Targeted weakness remediation, deep specialized competency',
      gradient: 'from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/5 dark:to-blue-500/5',
      accentColor: 'text-indigo-600 dark:text-indigo-400',
      borderColor: 'hover:border-indigo-400 dark:hover:border-indigo-500'
    },
    {
      id: 'company',
      title: 'Company-Specific',
      path: '/interview/practice/company',
      icon: Building2,
      badge: 'Targeted Prep',
      badgeColor: 'emerald',
      description: 'Enter your target employer to generate role-relevant interview questions grounded in your resume.',
      trains: 'Company culture themes, engineering values, role-specific nuances',
      gradient: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'hover:border-emerald-400 dark:hover:border-emerald-500'
    },
    {
      id: 'community',
      title: 'Community Mode',
      path: '/interview/practice/community',
      icon: Users,
      badge: 'Crowdsourced Sets',
      badgeColor: 'cyan',
      description: 'Practice with curated question sets created and shared by peers, or build your own.',
      trains: 'Diverse industry question sets, real candidate shared scenarios',
      gradient: 'from-cyan-500/10 to-sky-500/10 dark:from-cyan-500/5 dark:to-sky-500/5',
      accentColor: 'text-cyan-600 dark:text-cyan-400',
      borderColor: 'hover:border-cyan-400 dark:hover:border-cyan-500'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Platform Navigation Tabs */}
      <InterviewNavTabs />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold text-sky-600 dark:text-cyan-400">
              Interactive Preparation Lab
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Practice Modes
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Target specific interview skills with 5 tailored modes. All modes feed into your unified ResumeIQ AI evaluation and readiness analytics pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/interview/analytics')}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-500" />
            <span>View Analytics</span>
          </button>
        </div>
      </div>

      {/* Purple Cow Weakness Recommendation Banner */}
      {analytics?.weakestCriterion && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50/80 via-white to-cyan-50/50 dark:from-slate-900 dark:via-[#0c1427] dark:to-slate-900 border border-sky-200 dark:border-sky-800/60 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-cyan-400 border border-sky-300 dark:border-sky-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-sky-600 dark:text-cyan-400">
                  Targeted Weakness Detection
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-cyan-300 font-semibold">
                  Score: {analytics.weakestCriterion.score?.toFixed(1)}/10
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                {analytics.weakestCriterion.criterion} is currently your lowest-scoring dimension.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {analytics.recommendation?.message || 'Strengthen this area with focused drills.'}
              </p>
            </div>
          </div>

          {analytics.recommendation?.actionPath && (
            <Link
              to={analytics.recommendation.actionPath}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>{analytics.recommendation.actionLabel || 'Start Targeted Drill'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* 5 Practice Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {practiceModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <div
              key={mode.id}
              onClick={() => navigate(mode.path)}
              className={`group relative bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${mode.borderColor}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center ${mode.accentColor} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {mode.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-400 transition-colors">
                  {mode.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                  {mode.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    What it trains:
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {mode.trains}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Start Practice</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Practice Activity Section */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Practice Sessions
            </h2>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {history.length} completed sessions
          </span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <Zap className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium">No practice sessions completed yet.</p>
            <p className="text-xs mt-1">Pick any mode above to start your first rapid targeted practice session.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.slice(0, 5).map((item) => (
              <div
                key={item._id}
                className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="capitalize px-2.5 py-1 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.sessionType}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.targetRole || 'Interview Practice'}
                    </span>
                    {item.companyName && (
                      <span className="text-slate-600 dark:text-slate-300 ml-1.5 font-medium">
                        • {item.companyName}
                      </span>
                    )}
                    {item.category && (
                      <span className="text-slate-600 dark:text-slate-300 ml-1.5 capitalize font-medium">
                        • {item.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.averageScore?.toFixed(1) || '0.0'}/10
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-300">
                      {item.questionsAnswered || 0} questions
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                    {new Date(item.completedAt || item.createdAt).toLocaleDateString()}
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
