import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export default function AtsScoreGauge({ score, isAIPowered = true, status = 'analyzed' }) {
  const numericScore = typeof score === 'number' ? Math.min(100, Math.max(0, score)) : 0;

  // Determine category & color scheme
  let tier = {
    label: 'Strong ATS Alignment',
    short: 'Strong',
    description: 'Your resume demonstrates strong evidence across most ATS factors. Review the remaining recommendations for targeted improvements.',
    colorText: 'text-emerald-500 dark:text-emerald-400',
    colorBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    colorBorder: 'border-emerald-200 dark:border-emerald-800/80',
    strokeColor: '#10b981',
    icon: CheckCircle2,
    percentile: 'Strong score band'
  };

  if (numericScore < 50) {
    tier = {
      label: 'Critical ATS Disqualifiers Detected',
      short: 'At Risk',
      description: 'Your document has major ATS gaps such as missing structure, contact details, measurable outcomes, or role-specific evidence.',
      colorText: 'text-rose-500 dark:text-rose-400',
      colorBg: 'bg-rose-50 dark:bg-rose-950/40',
      colorBorder: 'border-rose-200 dark:border-rose-800/80',
      strokeColor: '#f43f5e',
      icon: XCircle,
      percentile: 'Critical gap score band'
    };
  } else if (numericScore < 70) {
    tier = {
      label: 'Needs Optimization For Modern ATS',
      short: 'Needs Work',
      description: 'Foundational structure exists, but quantifiable impact metrics and key technical terminology density require strengthening.',
      colorText: 'text-amber-500 dark:text-amber-400',
      colorBg: 'bg-amber-50 dark:bg-amber-950/40',
      colorBorder: 'border-amber-200 dark:border-amber-800/80',
      strokeColor: '#f59e0b',
      icon: AlertTriangle,
      percentile: 'Developing score band'
    };
  } else if (numericScore < 85) {
    tier = {
      label: 'Competitive & Interview Ready',
      short: 'Strong Match',
      description: 'Solid keyword coverage and parseable formatting. The highlighted gaps show where additional evidence or clarity can improve the resume.',
      colorText: 'text-sky-600 dark:text-cyan-400',
      colorBg: 'bg-sky-50 dark:bg-sky-950/40',
      colorBorder: 'border-sky-200 dark:border-sky-800/80',
      strokeColor: '#0284c7',
      icon: ShieldCheck,
      percentile: 'Good score band'
    };
  }

  const TierIcon = tier.icon;

  // SVG circular calculations
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (numericScore / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-10 backdrop-blur-sm shadow-sm transition-all">
      {/* Background atmospheric glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-sky-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
        {/* Left: Large Signature Circular Gauge */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background track */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800/80"
                strokeWidth="14"
                fill="transparent"
              />
              {/* Active animated progress ring */}
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

            {/* Inner Center Score Display */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">
                ATS Score
              </span>
              <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white font-mono tracking-tight leading-none my-1">
                {numericScore}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${tier.colorBg} ${tier.colorText} border ${tier.colorBorder}`}>
              <TierIcon className="w-3.5 h-3.5" />
              <span>{tier.short}</span>
            </span>
          </div>
        </div>

        {/* Right: Detailed Contextual Intelligence Breakdown */}
        <div className="flex-1 space-y-4 text-center lg:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-cyan-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Weighted Diagnostic Verdict</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
              {tier.label}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2 max-w-xl">
              {tier.description}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Standing</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{tier.percentile}</span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Scoring Methodology</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">7-Factor Weighted Engine</span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Engine Type</span>
              <span className="font-semibold text-sky-600 dark:text-cyan-400">
                {isAIPowered ? 'AI Calibrated' : 'Deterministic ATS Engine'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
