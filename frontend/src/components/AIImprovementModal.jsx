import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Edit3,
  AlertTriangle,
  X,
  History,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Save,
  Check
} from 'lucide-react';
import { resumeService } from '../services/resumeService';

export default function AIImprovementModal({
  isOpen,
  onClose,
  resumeId,
  initialText,
  sectionId,
  sectionType = 'experience',
  onVersionSaved
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRunImprovement = useCallback(async (textToImprove) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSavedSuccess(false);

    try {
      const data = await resumeService.improveSection(resumeId, {
        sectionId: sectionId || 'bullet-1',
        originalText: textToImprove,
        sectionType
      });
      setResult(data);
      setEditedText(data.suggestedText);
    } catch (err) {
      console.error('[Improvement Error]', err);
      setError(
        err.response?.data?.message ||
        "We couldn't improve this section. Your original resume content is unchanged. Try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  }, [resumeId, sectionId, sectionType]);

  useEffect(() => {
    if (isOpen && initialText) {
      handleRunImprovement(initialText);
    } else {
      // Reset state
      setResult(null);
      setError(null);
      setEditedText('');
      setIsEditing(false);
      setSavedSuccess(false);
    }
  }, [isOpen, initialText, handleRunImprovement]);

  const handleAccept = () => {
    if (result) {
      setEditedText(result.suggestedText);
      setIsEditing(true);
    }
  };

  const handleSaveVersion = async () => {
    if (!editedText.trim()) return;
    setSaving(true);
    try {
      await resumeService.saveVersion(resumeId, {
        sectionId: sectionId || 'bullet-1',
        originalText: result?.originalText || initialText,
        aiSuggestion: result?.suggestedText || editedText,
        acceptedText: editedText.trim(),
        reasons: result?.reasons || [],
        explanation: result?.explanation || ''
      });
      setSavedSuccess(true);
      if (onVersionSaved) {
        onVersionSaved();
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      alert(`Failed to save version: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
                AI Resume Improvement
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Truthful, ATS-aware refinement grounded in your verified experience.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            /* Polished Loading State */
            <div className="py-16 text-center space-y-5">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-cyan-400/20 border-b-cyan-400 animate-spin reverse"></div>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Analyzing this section...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  ResumeIQ is looking for stronger wording, clearer impact, and ATS-friendly improvements without fabricating facts.
                </p>
              </div>
            </div>
          ) : error ? (
            /* Error State with Recovery */
            <div className="py-10 px-6 text-center space-y-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  We couldn't improve this section.
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Your original resume content is unchanged. Try again in a moment.
                </p>
              </div>
              <button
                onClick={() => handleRunImprovement(initialText)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Improvement</span>
              </button>
            </div>
          ) : result ? (
            /* Comparison Experience */
            <div className="space-y-5">
              {/* ORIGINAL */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Original
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Preserved in version history
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic font-serif leading-relaxed">
                  "{result.originalText}"
                </p>
              </div>

              {/* WHY IT WAS WEAK */}
              {result.reasons && result.reasons.length > 0 && (
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Why It Was Weak
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.reasons.map((reason, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 shadow-xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {reason}
                      </span>
                    ))}
                  </div>
                  {result.explanation && (
                    <p className="text-xs text-amber-900/80 dark:text-amber-200/80 mt-1 leading-relaxed">
                      {result.explanation}
                    </p>
                  )}
                </div>
              )}

              {/* AI SUGGESTION / EDITABLE WORKSPACE */}
              <div className="rounded-2xl border border-sky-200 dark:border-sky-900/70 bg-sky-50/30 dark:bg-sky-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-cyan-400">
                      {isEditing ? 'Edit Accepted Content' : 'AI Suggestion'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center gap-1.5 text-xs text-sky-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Done Editing' : 'Modify Suggestion'}</span>
                  </button>
                </div>

                {isEditing ? (
                  <div>
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      rows={4}
                      className="w-full text-sm rounded-xl p-3 bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans leading-relaxed"
                      placeholder="Customize your improved section..."
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      You are in complete control of what gets saved. Modify as needed to reflect true verified numbers.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                      {editedText}
                    </p>
                  </div>
                )}
              </div>

              {/* Truthful Notice */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>
                  ResumeIQ Principle: Grounded in your original resume. No fabricated employers or metrics.
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Action Bar */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>

          {result && !loading && (
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}

              <button
                onClick={handleSaveVersion}
                disabled={saving || savedSuccess}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold shadow-md shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Saved to Version History!</span>
                  </>
                ) : saving ? (
                  <span>Saving Version...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Version</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
