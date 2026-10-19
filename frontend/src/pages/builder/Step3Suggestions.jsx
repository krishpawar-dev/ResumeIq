import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  Edit3,
  ShieldCheck,
  Wand2
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import { builderService } from '../../services/builderService';

export default function Step3Suggestions() {
  const { draft, updateSummary, updateExperience, updateProject } = useBuilder();
  const navigate = useNavigate();

  const [activeImprovingId, setActiveImprovingId] = useState(null);
  const [improvements, setImprovements] = useState({});
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState(null);

  // Collect improvable items from current draft
  const items = [];

  if (draft.summary) {
    items.push({
      id: 'summary',
      type: 'summary',
      title: 'Professional Summary',
      text: draft.summary
    });
  }

  (draft.experience || []).forEach((exp, idx) => {
    if (exp.description) {
      // Split into bullets or take full description
      const lines = exp.description.split('\n').filter((l) => l.trim().length > 15);
      lines.forEach((line, lineIdx) => {
        items.push({
          id: `exp-${exp.id}-${lineIdx}`,
          parentExpId: exp.id,
          originalFullDesc: exp.description,
          type: 'experience',
          title: `${exp.jobTitle || 'Role'} (${exp.company || 'Company'}) — Bullet #${lineIdx + 1}`,
          text: line.replace(/^[•\-\*]\s*/, '').trim()
        });
      });
    }
  });

  (draft.projects || []).forEach((proj, idx) => {
    if (proj.description || proj.outcome) {
      items.push({
        id: `proj-${proj.id}`,
        parentProjId: proj.id,
        type: 'projects',
        title: `Project: ${proj.projectName || 'Project'} Impact`,
        text: proj.outcome || proj.description
      });
    }
  });

  const handleImprove = async (item) => {
    setActiveImprovingId(item.id);
    setErrorMessage(null);
    try {
      const res = await builderService.improveBullet({
        originalText: item.text,
        sectionType: item.type
      });

      setImprovements((prev) => ({
        ...prev,
        [item.id]: {
          suggestedText: res.suggestedText,
          reasons: res.reasons || [],
          explanation: res.explanation || ''
        }
      }));
    } catch (err) {
      console.error('[Builder AI Improve Error]', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to improve this item. Your resume draft remains untouched.'
      );
    } finally {
      setActiveImprovingId(null);
    }
  };

  const handleApply = (item) => {
    const suggestion = improvements[item.id]?.suggestedText;
    if (!suggestion) return;

    if (item.type === 'summary') {
      updateSummary(suggestion);
    } else if (item.type === 'experience' && item.parentExpId) {
      // Replace bullet in parent description
      const targetExp = (draft.experience || []).find((e) => e.id === item.parentExpId);
      if (targetExp) {
        const updatedDesc = targetExp.description.replace(item.text, suggestion);
        updateExperience(item.parentExpId, { description: updatedDesc });
      }
    } else if (item.type === 'projects' && item.parentProjId) {
      updateProject(item.parentProjId, { outcome: suggestion });
    }

    setAppliedIds((prev) => new Set(prev).add(item.id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Inline AI Resume Suggestions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Grounded in your real inputs. ResumeIQ replaces weak phrasing and guides you where to add verified metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4" />
          <span>Truthful AI — Never invents fake numbers</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      {items.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No resume bullets found yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Please enter your experience or summary in Step 2 to generate contextual AI suggestions.
          </p>
          <button
            onClick={() => navigate('/resume-builder/information')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
          >
            <span>Go to Step 2</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const isImproving = activeImprovingId === item.id;
            const improvement = improvements[item.id];
            const isApplied = appliedIds.has(item.id);

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {item.title}
                  </span>
                  {!improvement && (
                    <button
                      onClick={() => handleImprove(item)}
                      disabled={isImproving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-cyan-400 border border-sky-200 dark:border-sky-800 text-xs font-bold hover:bg-sky-100 transition disabled:opacity-60 cursor-pointer"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isImproving ? 'animate-spin' : ''}`} />
                      <span>{isImproving ? 'Analyzing...' : 'Improve with AI'}</span>
                    </button>
                  )}
                </div>

                {/* Original content display */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Current Resume Content
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                    "{item.text}"
                  </p>
                </div>

                {/* AI Suggestion Display if generated */}
                {improvement && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {/* Weaknesses Tags */}
                    {improvement.reasons && improvement.reasons.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Why It Was Weak</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {improvement.reasons.map((r, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                            >
                              &bull; {r}
                            </span>
                          ))}
                        </div>
                        {improvement.explanation && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                            {improvement.explanation}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Improved Suggestion Box */}
                    <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-sky-800 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Improved Version</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleImprove(item)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Regenerate"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleApply(item)}
                            disabled={isApplied}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              isApplied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-sky-600 text-white hover:bg-sky-500'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Applied to Draft</span>
                              </>
                            ) : (
                              <span>Apply to Draft</span>
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs font-medium text-slate-900 dark:text-white leading-relaxed">
                        {improvement.suggestedText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => navigate('/resume-builder/information')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Information</span>
        </button>

        <button
          onClick={() => navigate('/resume-builder/score')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Continue to Live ATS Score</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
