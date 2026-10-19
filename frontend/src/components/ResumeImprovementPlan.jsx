import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Lightbulb, Sparkles, Target } from 'lucide-react';

export default function ResumeImprovementPlan({ plan }) {
  const [openSection, setOpenSection] = useState('Professional Summary');

  if (!plan) return null;

  const sections = Array.isArray(plan.sectionImprovements) ? plan.sectionImprovements : [];
  const actions = Array.isArray(plan.priorityActions) ? plan.priorityActions : [];

  return (
    <div className="rounded-3xl border border-sky-200 dark:border-sky-900/70 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm space-y-7">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-sky-600 dark:text-cyan-400">Resume Coach</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">What you should improve next</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            This section goes beyond the score: it explains the problem, why it matters, and what the improved version should look like without inventing facts.
          </p>
        </div>
      </div>

      {plan.overallAssessment && (
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {plan.overallAssessment}
        </div>
      )}

      {actions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            <Target className="w-4 h-4 text-sky-500" />
            Priority actions
          </div>
          <div className="grid gap-2">
            {actions.map((action, index) => (
              <div key={index} className="flex gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-white dark:bg-slate-900">
                <span className="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-cyan-400 text-[11px] font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed m-0">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sections.map((item) => {
          const isOpen = openSection === item.section;
          return (
            <div key={item.section} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? '' : item.section)}
                className="w-full px-4 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{item.section}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.issue}</div>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isOpen && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Why this matters</div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed m-0">{item.whyItMatters}</p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Current evidence</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap m-0">{item.currentText || 'No content detected.'}</p>
                    </div>
                    <div className="rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 p-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-cyan-300 mb-2">Improved version / exact structure</div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap m-0">{item.improvedExample}</p>
                    </div>
                  </div>

                  {Array.isArray(item.checklist) && item.checklist.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Checklist</div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {item.checklist.map((check, index) => (
                          <div key={index} className="flex gap-2 items-start text-xs text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{check}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 items-start text-[11px] text-slate-500 dark:text-slate-400">
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
        <span>ResumeIQ will not invent achievements. Any placeholder such as [add verified metric] should be replaced only with a real fact you can prove.</span>
      </div>
    </div>
  );
}
