import React from 'react';
import { Compass, Target, Mic, FileCheck, Zap } from 'lucide-react';

export default function CareerPulseGauge({ score = null, status = 'Awaiting Ingestion' }) {
  const pillars = [
    { name: 'ATS Compliance', icon: FileCheck, val: score?.ats || 0, desc: 'Structural parsing & syntax score' },
    { name: 'Role Alignment', icon: Target, val: score?.match || 0, desc: 'Keyword parity with benchmark jobs' },
    { name: 'Interview Agility', icon: Mic, val: score?.interview || 0, desc: 'Mock response & behavioral calibration' },
    { name: 'Career Trajectory', icon: Compass, val: score?.trajectory || 0, desc: 'Competency progression roadmap' },
  ];

  const hasScore = score !== null && typeof score.overall === 'number';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
      {/* Decorative gradient beam */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-sky-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-cyan-400">
              <Zap className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Signature Intelligence Vector
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
            ResumeIQ Career Readiness Pulse
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Multi-dimensional calibration measuring structural, contextual, and interview preparedness.
          </p>
        </div>

        {/* Global Gauge Score Badge */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 px-5 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Readiness Index
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {hasScore ? `${score.overall}%` : '--'}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="block text-[10px] uppercase font-bold text-amber-500 dark:text-amber-400">
              Status
            </span>
            {status}
          </div>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {pillars.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/60 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-sky-600 dark:text-cyan-400 shadow-sm border border-slate-200/60 dark:border-slate-700/50">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {hasScore ? `${pillar.val}%` : 'Pending'}
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                  {pillar.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {pillar.desc}
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${hasScore ? pillar.val : 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
