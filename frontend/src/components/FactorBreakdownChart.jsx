import React from 'react';
import { Target, TrendingUp, Layers, Zap, UserCheck, Clock, Award } from 'lucide-react';

const FACTOR_CONFIGS = [
  {
    key: 'keywordDensity',
    label: 'Keyword Density',
    weight: '25%',
    icon: Target,
    desc: 'Technical & industry vocabulary calibrated for ATS search algorithms'
  },
  {
    key: 'quantifiableResults',
    label: 'Quantifiable Results',
    weight: '20%',
    icon: TrendingUp,
    desc: 'Metrics, percentages, dollar amounts, and quantified impact in accomplishments'
  },
  {
    key: 'formatStructure',
    label: 'Format & Structure',
    weight: '15%',
    icon: Layers,
    desc: 'Parseable linear headings, chronological hierarchy, and clean layouts'
  },
  {
    key: 'actionVerbUsage',
    label: 'Action Verb Usage',
    weight: '15%',
    icon: Zap,
    desc: 'Decisive executive power verbs leading every experience bullet'
  },
  {
    key: 'contactInformation',
    label: 'Contact Information',
    weight: '10%',
    icon: UserCheck,
    desc: 'Parseable email, phone, location, and professional URLs in header'
  },
  {
    key: 'optimalLength',
    label: 'Optimal Length',
    weight: '10%',
    icon: Clock,
    desc: 'Balanced word density and concise layout ideal for 1-2 page reviews'
  },
  {
    key: 'skillsSection',
    label: 'Skills Section',
    weight: '5%',
    icon: Award,
    desc: 'Dedicated categorized competencies section for instant indexing'
  }
];

export default function FactorBreakdownChart({ breakdown }) {
  if (!breakdown) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 65) return 'from-sky-500 to-cyan-400';
    if (score >= 50) return 'from-amber-500 to-yellow-400';
    return 'from-rose-500 to-red-400';
  };

  const getBadgeStyle = (score) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800';
    if (score >= 65) return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-cyan-400 dark:border-sky-800';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800';
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800';
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            7-Factor ATS Breakdown
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent deterministic weights applied to every extracted section.
          </p>
        </div>
        <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          Fixed Weighting: 100% Total
        </span>
      </div>

      <div className="space-y-5">
        {FACTOR_CONFIGS.map((config) => {
          const factor = breakdown[config.key] || { score: 0 };
          const score = typeof factor.score === 'number' ? factor.score : 0;
          const Icon = config.icon;

          return (
            <div
              key={config.key}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                    <Icon className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {config.label}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Weight: {config.weight}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                      {config.desc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getBadgeStyle(score)}`}>
                    {score} / 100
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-700`}
                  style={{ width: `${score}%` }}
                />
              </div>

              {/* Feedback Summary Snippet */}
              {factor.feedback && (
                <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Observed: </span>
                  {factor.feedback}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
