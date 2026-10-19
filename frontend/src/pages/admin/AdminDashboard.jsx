import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Brain,
  Video,
  Activity,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminMetricCard, AdminPageHeader, StatusBadge } from '../../components/admin/AdminComponents';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [metricData, growthData] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getGrowthData(range)
      ]);
      setMetrics(metricData.data || {});
      setGrowth(growthData.data || []);
    } catch (err) {
      console.error('Error fetching admin dashboard metrics:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [range]);

  const cards = metrics
    ? [
        {
          title: 'Total Users',
          value: metrics.totalUsers?.toLocaleString() || '0',
          subtext: `${metrics.activeUsers30d || 0} active in last 30d`,
          icon: Users,
          color: 'sky'
        },
        {
          title: 'Total Resumes',
          value: metrics.totalResumes?.toLocaleString() || '0',
          subtext: `${metrics.resumesThisMonth || 0} created this month`,
          icon: FileText,
          color: 'emerald'
        },
        {
          title: 'AI Invocations',
          value: metrics.totalAIInvocations?.toLocaleString() || '0',
          subtext: 'Across all intelligence engines',
          icon: Brain,
          color: 'amber'
        },
        {
          title: 'Mock Interviews',
          value: metrics.totalMockInterviews?.toLocaleString() || '0',
          subtext: `${metrics.completedInterviews || 0} completed`,
          icon: Video,
          color: 'slate'
        },
        {
          title: 'Paid Subscriptions',
          value: metrics.activeSubscriptions?.toLocaleString() || '0',
          subtext: `${metrics.paidUsers || 0} active subscribers`,
          icon: CreditCard,
          color: 'emerald'
        },
        {
          title: 'Open Reports',
          value: metrics.openReports?.toLocaleString() || '0',
          subtext: `${metrics.highPriorityReports || 0} high / critical priority`,
          icon: AlertTriangle,
          color: (metrics.openReports > 0 ? 'rose' : 'slate')
        }
      ]
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Admin Control Center"
        description="Real-time telemetry, platform growth analytics, and intelligence usage"
        action={
          <div className="flex items-center gap-3">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDashboard} className="underline font-semibold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && !metrics
          ? Array.from({ length: 6 }).map((_, i) => (
              <AdminMetricCard key={i} title="Loading..." isLoading={true} />
            ))
          : cards.map((c, i) => (
              <AdminMetricCard
                key={i}
                title={c.title}
                value={c.value}
                subtext={c.subtext}
                icon={c.icon}
                color={c.color}
                isLoading={loading}
              />
            ))}
      </div>

      {/* AI Engine Usage Breakdown & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth & Activity Trend */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Platform Activity & Signups ({range})
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Aggregation telemetry</span>
          </div>

          {growth.length === 0 && !loading ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No historical data points in selected timeframe
            </div>
          ) : (
            <div className="h-56 flex items-end gap-2 pt-4 px-2 overflow-x-auto">
              {growth.map((item, idx) => {
                const maxVal = Math.max(...growth.map((g) => g.count || 1), 10);
                const heightPercent = Math.min(100, Math.max(8, ((item.count || 0) / maxVal) * 100));
                return (
                  <div key={idx} className="flex-1 min-w-[20px] flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition font-mono">
                      {item.count}
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t-md bg-gradient-to-t from-sky-600 to-cyan-400 dark:from-sky-500 dark:to-cyan-300 opacity-80 group-hover:opacity-100 transition-all shadow-sm"
                    />
                    <span className="text-[9px] text-slate-400 font-mono truncate max-w-[40px]">
                      {item.label || item.date?.slice(5) || idx}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Feature Breakdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Feature Breakdown</h3>
          </div>

          <div className="space-y-3 pt-2">
            {(metrics?.featureUsage || [
              { feature: 'Resume ATS Analysis', count: metrics?.totalResumes || 0 },
              { feature: 'Job Matching X-Ray', count: metrics?.totalJobMatches || 0 },
              { feature: 'AI Interview Engine', count: metrics?.totalMockInterviews || 0 },
              { feature: 'Career Twin & Roadmaps', count: metrics?.totalCareerPaths || 0 }
            ]).map((item, i) => {
              const total = Math.max(1, metrics?.totalAIInvocations || 1);
              const pct = Math.round(((item.count || 0) / total) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.feature || item.name}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {item.count?.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Platform Signups & Reports Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent User Signups</h3>
            <a href="/admin/users" className="text-xs font-semibold text-sky-600 dark:text-cyan-400 hover:underline">
              View all →
            </a>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(metrics?.recentUsers || []).length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No users registered yet</div>
            ) : (
              metrics.recentUsers.map((u) => (
                <div key={u._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      {u.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={u.role || 'user'} />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Open Reports & Flags */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pending Reports & Inquiries</h3>
            <a href="/admin/reports" className="text-xs font-semibold text-sky-600 dark:text-cyan-400 hover:underline">
              Manage reports →
            </a>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(metrics?.recentReports || []).length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No open reports or flags</div>
            ) : (
              metrics.recentReports.map((r) => (
                <div key={r._id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{r.subject || r.type}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{r.description}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <StatusBadge status={r.priority || 'medium'} />
                    <StatusBadge status={r.status || 'open'} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
