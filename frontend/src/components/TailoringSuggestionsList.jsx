import React from 'react';
import { Lightbulb, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export default function TailoringSuggestionsList({ suggestions = [] }) {
  if (!suggestions || suggestions.length === 0) return null;

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High Priority':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border-rose-200 dark:border-rose-900/60';
      case 'Recommended':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-cyan-400 border-sky-200 dark:border-sky-900/60';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-cyan-400 mb-1">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Prescriptive Strategy</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Resume Tailoring Suggestions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Targeted modifications to align your existing qualifications with this role's benchmark criteria.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Truthful Tailoring Only</span>
        </div>
      </div>

      <div className="space-y-4">
        {suggestions.map((item, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border self-start ${getPriorityStyle(item.priority)}`}>
                {item.priority || 'Recommended'}
              </span>

              {item.section && (
                <span className="text-xs font-mono text-slate-400">
                  Target Section: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.section}</span>
                </span>
              )}
            </div>

            <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
              {item.suggestion}
            </div>

            {item.reason && (
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <span className="font-bold text-slate-600 dark:text-slate-300">Why this matters: </span>
                {item.reason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
