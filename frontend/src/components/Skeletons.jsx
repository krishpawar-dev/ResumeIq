import React from 'react';

export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-16" />
      <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-32" />
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden animate-pulse">
      <div className="h-10 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800" />
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-slate-200 dark:bg-slate-800 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4"
        >
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          </div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48" />
      <div className="h-60 bg-slate-100 dark:bg-slate-800/40 rounded-xl flex items-end gap-3 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{ height: `${20 + (i * 11) % 70}%` }}
            className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-t-md"
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
      </div>
    </div>
  );
}
