import React, { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, ChevronDown, ChevronUp, CheckCircle, ShieldCheck } from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import { Link } from 'react-router-dom';

export default function PersistentScoreBar() {
  const { atsScore, previousScore, scoreDelta, scoreBreakdown, isSaving, lastSaved } = useBuilder();
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Score color helper
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
  };

  const factorLabels = {
    keywordDensity: 'Keyword Density (25%)',
    quantifiableResults: 'Quantifiable Results (20%)',
    formatStructure: 'Format & Structure (15%)',
    actionVerbUsage: 'Action Verb Usage (15%)',
    contactInformation: 'Contact Info (10%)',
    optimalLength: 'Optimal Length (10%)',
    skillsSection: 'Skills Section (5%)'
  };

  return (
    <div className="sticky top-20 z-30 mb-6">
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-3 shadow-lg shadow-slate-900/5 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Score & Delta */}
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-mono font-black text-base transition-all ${getScoreColor(atsScore)}`}>
              {atsScore}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Live ATS Score
                </span>

                {scoreDelta !== 0 && (
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    scoreDelta > 0
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                  }`}>
                    {scoreDelta > 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3" />
                        <span>+{scoreDelta}</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3" />
                        <span>{scoreDelta}</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                {isSaving ? (
                  <span className="flex items-center gap-1 text-sky-600 dark:text-cyan-400 animate-pulse font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>
                    Evaluating live ATS factors...
                  </span>
                ) : (
                  <span>
                    {atsScore >= 80 ? 'Exceptional ATS pass readiness' : 'Room for keyword and metric optimization'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick actions & Breakdown toggle */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <span>7 Factors</span>
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <Link
              to="/resume-builder/score"
              className="text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline px-2 py-1"
            >
              Deep Diagnostic &rarr;
            </Link>
          </div>
        </div>

        {/* Expandable Breakdown Drawer */}
        {showBreakdown && scoreBreakdown && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(factorLabels).map(([key, label]) => {
                const factor = scoreBreakdown[key];
                if (!factor) return null;
                return (
                  <div
                    key={key}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-400 truncate">
                        {label}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {factor.score}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          factor.score >= 80 ? 'bg-emerald-500' : factor.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
