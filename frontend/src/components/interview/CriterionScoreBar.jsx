import React from 'react';

export default function CriterionScoreBar({ label, weight, score, className = '' }) {
  const getScoreColor = (val) => {
    if (val >= 80) return 'bg-emerald-500 text-emerald-600 dark:text-emerald-400';
    if (val >= 60) return 'bg-amber-500 text-amber-600 dark:text-amber-400';
    return 'bg-rose-500 text-rose-600 dark:text-rose-400';
  };

  const colorClass = getScoreColor(score);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {label} <span className="text-[11px] font-normal text-slate-400">({weight}%)</span>
        </span>
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          {score}%
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorClass.split(' ')[0]}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}
