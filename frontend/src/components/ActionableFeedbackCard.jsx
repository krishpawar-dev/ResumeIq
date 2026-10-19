import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, Lightbulb, Search, Sparkles } from 'lucide-react';

const FACTOR_TITLES = {
  keywordDensity: { title: 'Keyword Density & Domain Alignment', weight: '25%' },
  quantifiableResults: { title: 'Quantifiable Results & Metrics', weight: '20%' },
  formatStructure: { title: 'Format, Hierarchy & Layout Structure', weight: '15%' },
  actionVerbUsage: { title: 'Action Verb & Impact Phrasing', weight: '15%' },
  contactInformation: { title: 'Contact Information & Links', weight: '10%' },
  optimalLength: { title: 'Optimal Word Density & Length', weight: '10%' },
  skillsSection: { title: 'Skills Section Architecture', weight: '5%' }
};

export default function ActionableFeedbackCard({ breakdown }) {
  if (!breakdown) return null;

  // Track which accordion sections are open (default all open)
  const [openFactors, setOpenFactors] = useState(() =>
    Object.keys(FACTOR_TITLES).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  const toggleFactor = (key) => {
    setOpenFactors((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-cyan-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prescriptive Intelligence</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Actionable ATS Recommendations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Specific improvements grounded directly in your parsed resume text.
          </p>
        </div>

        <button
          onClick={() => {
            const allOpen = Object.values(openFactors).every(Boolean);
            const nextState = Object.keys(FACTOR_TITLES).reduce(
              (acc, k) => ({ ...acc, [k]: !allOpen }),
              {}
            );
            setOpenFactors(nextState);
          }}
          className="text-xs text-sky-600 dark:text-cyan-400 hover:underline font-medium self-start sm:self-auto cursor-pointer"
        >
          {Object.values(openFactors).every(Boolean) ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(FACTOR_TITLES).map(([key, meta]) => {
          const item = breakdown[key];
          if (!item) return null;

          const isOpen = openFactors[key];
          const score = typeof item.score === 'number' ? item.score : 0;
          const isHealthy = score >= 75;

          return (
            <div
              key={key}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 shadow-sm'
                  : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/30'
              }`}
            >
              {/* Header */}
              <button
                onClick={() => toggleFactor(key)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isHealthy
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                    }`}
                  >
                    {isHealthy ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {meta.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {meta.weight}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      score >= 80
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                        : score >= 60
                        ? 'text-sky-600 dark:text-cyan-400 bg-sky-50 dark:bg-sky-950/60'
                        : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
                    }`}
                  >
                    {score} / 100
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 pt-1 space-y-3.5 border-t border-slate-200/70 dark:border-slate-800/70 text-xs">
                  {/* Feedback: What it means */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
                      <Search className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                      <span>Diagnosis</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed m-0">
                      {item.feedback}
                    </p>
                  </div>

                  {/* Evidence: What was detected */}
                  {item.evidence && (
                    <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
                      <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Detected Evidence:
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 italic font-mono text-[11px] leading-relaxed m-0">
                        "{item.evidence}"
                      </p>
                    </div>
                  )}

                  {/* Suggestion: How to improve */}
                  <div className="p-3.5 rounded-xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/60">
                    <div className="flex items-center gap-1.5 font-bold text-sky-900 dark:text-cyan-300 mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                      <span>Concrete Recommendation</span>
                    </div>
                    <p className="text-sky-950 dark:text-slate-200 leading-relaxed m-0 font-medium">
                      {item.suggestion}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
