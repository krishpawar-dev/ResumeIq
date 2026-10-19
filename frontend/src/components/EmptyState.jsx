import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon,
  badge = 'Module Initialized',
  title,
  description,
  actionText,
  actionLink,
  onAction,
  secondaryText,
  secondaryLink
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-8 sm:p-12 text-center transition-all">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-500/5 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
        {/* Icon & Badge */}
        {Icon && (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/10 to-cyan-500/10 dark:from-slate-800 dark:to-slate-800/80 border border-sky-200 dark:border-slate-700 flex items-center justify-center mb-5 text-sky-600 dark:text-cyan-400 shadow-sm">
            <Icon className="w-7 h-7" />
          </div>
        )}

        {badge && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-3">
            <Sparkles className="w-3 h-3 text-sky-600 dark:text-cyan-400" />
            <span>{badge}</span>
          </div>
        )}

        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          {title}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionText && actionLink && (
            <Link
              to={actionLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-semibold text-xs tracking-wide shadow-md shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {actionText && onAction && !actionLink && (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-semibold text-xs tracking-wide shadow-md shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {secondaryText && secondaryLink && (
            <Link
              to={secondaryLink}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
            >
              <span>{secondaryText}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
