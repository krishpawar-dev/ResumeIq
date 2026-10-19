import React, { useState, useMemo } from 'react';
import { Sparkles, ArrowRight, Wand2, PlusCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import AIImprovementModal from './AIImprovementModal';

export default function ResumeSectionOptimizer({ resume, onVersionSaved }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState({
    text: '',
    sectionId: '',
    sectionType: 'experience'
  });
  const [customText, setCustomText] = useState('');

  // Extract key bullet points and sections from parsed resume text
  const extractedSections = useMemo(() => {
    if (!resume?.parsedText) return [];

    const lines = resume.parsedText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 25);

    const candidates = [];
    let currentCategory = 'experience';

    for (let i = 0; i < lines.length && candidates.length < 8; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      if (lower.includes('summary') || lower.includes('objective')) {
        currentCategory = 'summary';
        continue;
      }
      if (lower.includes('experience') || lower.includes('employment')) {
        currentCategory = 'experience';
        continue;
      }
      if (lower.includes('project')) {
        currentCategory = 'projects';
        continue;
      }

      // Filter out headers, dates-only lines, email lines
      if (
        !line.includes('@') &&
        !line.includes('http') &&
        !/^[\d\s\-\/\(\)]+$/.test(line) &&
        line.split(/\s+/).length >= 6
      ) {
        // Strip leading bullets
        const cleanText = line.replace(/^[•\-\*\>]\s*/, '').trim();
        if (cleanText.length > 20) {
          candidates.push({
            id: `sec-${candidates.length + 1}`,
            type: currentCategory,
            text: cleanText
          });
        }
      }
    }

    return candidates;
  }, [resume?.parsedText]);

  const handleOpenImprove = (item) => {
    setActiveItem({
      text: item.text,
      sectionId: item.id || 'custom-bullet',
      sectionType: item.type || 'experience'
    });
    setModalOpen(true);
  };

  const handleCustomImprove = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setActiveItem({
      text: customText.trim(),
      sectionId: 'custom-input',
      sectionType: 'experience'
    });
    setModalOpen(true);
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-cyan-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white m-0">
              AI Section Improvement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identify weak resume statements, review ATS weaknesses, and save verified versions.
            </p>
          </div>
        </div>
      </div>

      {/* Extracted Bullets Ready for Improvement */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Detected Resume Sections & Bullets
        </div>

        {extractedSections.length === 0 ? (
          <p className="text-xs text-slate-400">
            No distinct bullets extracted automatically. You can paste any line below to improve it.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {extractedSections.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-sky-300 dark:hover:border-sky-800 transition"
              >
                <div className="space-y-1 flex-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.type}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {item.text}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenImprove(item)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-sky-600 dark:text-cyan-400 border border-sky-200 dark:border-sky-800/80 text-xs font-bold transition shadow-xs group-hover:scale-102 cursor-pointer self-start sm:self-auto flex-shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Improve with AI</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Bullet Optimizer Form */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <form onSubmit={handleCustomImprove} className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Improve Any Specific Section or Bullet
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g., Worked on web application to handle user accounts."
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={!customText.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-sky-600/20 dark:shadow-cyan-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Improve with AI</span>
            </button>
          </div>
        </form>
      </div>

      {/* AI Improvement Modal */}
      <AIImprovementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        resumeId={resume._id}
        initialText={activeItem.text}
        sectionId={activeItem.sectionId}
        sectionType={activeItem.sectionType}
        onVersionSaved={onVersionSaved}
      />
    </div>
  );
}
