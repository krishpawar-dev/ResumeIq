import React from 'react';
import { Target, CheckCircle2, AlertTriangle, XCircle, Sparkles, TrendingUp, Briefcase, Award } from 'lucide-react';

export default function JobMatchScoreGauge({ matchPercent, scoreBreakdown, jobTitle, company }) {
  const percent = typeof matchPercent === 'number' ? Math.min(100, Math.max(0, matchPercent)) : 0;

  let tier = {
    label: 'Elite Role Compatibility',
    verdict: 'Very strong evidence of alignment across the extracted role requirements.',
    colorText: 'text-emerald-500 dark:text-emerald-400',
    colorBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    colorBorder: 'border-emerald-200 dark:border-emerald-800/80',
    strokeColor: '#10b981',
    icon: CheckCircle2
  };

  if (percent < 50) {
    tier = {
      label: 'Low Keyword & Role Alignment',
      verdict: 'Substantial gaps in mandatory technical requirements and seniority benchmarks.',
      colorText: 'text-rose-500 dark:text-rose-400',
      colorBg: 'bg-rose-50 dark:bg-rose-950/40',
      colorBorder: 'border-rose-200 dark:border-rose-800/80',
      strokeColor: '#f43f5e',
      icon: XCircle
    };
  } else if (percent < 70) {
    tier = {
      label: 'Moderate Alignment / Notable Gaps',
      verdict: 'Foundational overlap in some requirements, but key competencies remain unproven.',
      colorText: 'text-amber-500 dark:text-amber-400',
      colorBg: 'bg-amber-50 dark:bg-amber-950/40',
      colorBorder: 'border-amber-200 dark:border-amber-800/80',
      strokeColor: '#f59e0b',
      icon: AlertTriangle
    };
  } else if (percent < 85) {
    tier = {
      label: 'Competitive & Interview Ready',
      verdict: 'Strong overlap across the extracted requirements, with any remaining gaps shown below.',
      colorText: 'text-sky-600 dark:text-cyan-400',
      colorBg: 'bg-sky-50 dark:bg-sky-950/40',
      colorBorder: 'border-sky-200 dark:border-sky-800/80',
      strokeColor: '#0284c7',
      icon: Target
    };
  }

  const TierIcon = tier.icon;

  // Arc calculation
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const breakdown = scoreBreakdown || {
    skillAlignment: percent,
    relevantExperience: percent,
    projectRelevance: percent,
    additionalContext: percent
  };

  const dimensions = [
    { label: 'Skill Alignment', weight: '55%', val: breakdown.skillAlignment, icon: Target },
    { label: 'Relevant Experience', weight: '20%', val: breakdown.relevantExperience, icon: Briefcase },
    { label: 'Project Relevance', weight: '15%', val: breakdown.projectRelevance, icon: TrendingUp },
    { label: 'Additional Context', weight: '10%', val: breakdown.additionalContext, icon: Award }
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-10 backdrop-blur-sm shadow-sm transition-all">
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-teal-500/10 via-sky-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 pb-8 border-b border-slate-100 dark:border-slate-800/80">
        {/* Left: Score Gauge */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800/80"
                strokeWidth="14"
                fill="transparent"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke={tier.strokeColor}
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                Role Fit
              </span>
              <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white font-mono tracking-tight leading-none my-1">
                {percent}%
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Weighted Match
              </span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${tier.colorBg} ${tier.colorText} border ${tier.colorBorder}`}>
              <TierIcon className="w-3.5 h-3.5" />
              <span>{tier.label}</span>
            </span>
          </div>
        </div>

        {/* Right: Role Metadata and Explanation */}
        <div className="flex-1 space-y-4 text-center lg:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-cyan-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Benchmarked Target Position</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
              {jobTitle || 'Target Role'}
              {company && <span className="text-slate-400 font-normal text-xl sm:text-2xl ml-2">at {company}</span>}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2 max-w-xl">
              {tier.verdict}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">
              ResumeIQ Weighted Formula Principle:
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed m-0">
              Scores prioritize required skills first. A missing core requirement can cap the overall score, while preferred requirements have a smaller effect. The skill matrix below shows exactly what was and was not found in the resume.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Dimension Breakdown Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {dimensions.map((dim, i) => {
          const Icon = dim.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/60 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-sky-600 dark:text-cyan-400 border border-slate-200/80 dark:border-slate-700">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {dim.label}
                    </div>
                    <div className="text-[10px] text-slate-400">Weight: {dim.weight}</div>
                  </div>
                </div>
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                  {dim.val}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-sky-500 to-teal-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${dim.val}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
