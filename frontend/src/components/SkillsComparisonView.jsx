import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Quote, Filter } from 'lucide-react';

export default function SkillsComparisonView({ matchedSkills = [], missingSkills = [] }) {
  const [filterCategory, setFilterCategory] = useState('all');

  const getImportanceBadge = (importance) => {
    const val = typeof importance === 'number' ? importance : 0.8;
    if (val >= 0.8) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
          High Importance
        </span>
      );
    }
    if (val >= 0.6) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
          Medium
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        Preferred / Low
      </span>
    );
  };

  const categories = Array.from(
    new Set([...matchedSkills, ...missingSkills].map((s) => s.category || 'technical'))
  );

  const filteredMatched = filterCategory === 'all'
    ? matchedSkills
    : matchedSkills.filter((s) => s.category === filterCategory);

  const filteredMissing = filterCategory === 'all'
    ? missingSkills
    : missingSkills.filter((s) => s.category === filterCategory);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm shadow-sm space-y-6">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Skills Alignment & Deficit Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Side-by-side comparison of role requirements against evidence detected in your resume.
          </p>
        </div>

        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Matched Skills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 m-0">
                Matched Capabilities ({filteredMatched.length})
              </h3>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Verified in resume
            </span>
          </div>

          {filteredMatched.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No matching capabilities identified in this category.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMatched.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-950/80 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-200 dark:hover:border-emerald-900/60 transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {skill.name}
                      </span>
                    </div>
                    {getImportanceBadge(skill.importance)}
                  </div>

                  {skill.evidence && (
                    <div className="mt-2 pl-3 border-l-2 border-emerald-400/60 text-xs text-slate-600 dark:text-slate-300 italic flex items-start gap-1.5 leading-relaxed">
                      <Quote className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5 opacity-60" />
                      <span>{skill.evidence}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Missing / Unclear Skills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 m-0">
                Missing / Unclear Skills ({filteredMissing.length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              Not demonstrated
            </span>
          </div>

          {filteredMissing.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Exceptional! 100% of analyzed role requirements are demonstrated in your resume.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMissing.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {skill.name}
                      </span>
                    </div>
                    {getImportanceBadge(skill.importance)}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed m-0">
                    {skill.reason || 'No explicit evidence or keyword found in current resume.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
