import React from 'react';
import { ArrowUpRight, HelpCircle } from 'lucide-react';

export default function MetricCard({
  title,
  value = null,
  emptyText = 'No data yet',
  subtext,
  icon: Icon,
  badge = 'Empty State',
  accentColor = 'sky'
}) {
  const hasValue = value !== null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition group">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-105 transition-transform">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Value / Empty State */}
        <div className="my-2">
          {hasValue ? (
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {value}
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-400 dark:text-slate-500 font-mono">--</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {emptyText}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Subtext Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>{subtext}</span>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
          {badge}
        </span>
      </div>
    </div>
  );
}
