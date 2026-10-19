import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Download, Eye, Sparkles, Check } from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import ResumeTemplateRenderer from '../../components/builder/ResumeTemplateRenderer';

export default function Step5Preview() {
  const { draft, templateId, setTemplate } = useBuilder();
  const navigate = useNavigate();

  const templateOptions = [
    { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' },
    { id: 'executive', label: 'Executive' },
    { id: 'technical', label: 'Technical' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Template Quick-Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Realistic Resume Preview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Rendered in full print-fidelity. Switch templates instantly to see layout variations.
          </p>
        </div>

        {/* Quick template selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          {templateOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTemplate(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${templateId === opt.id
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Realistic Document Paper Workspace */}
      <div className="p-4 sm:p-8 rounded-3xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 overflow-x-auto shadow-inner flex justify-center">
        <ResumeTemplateRenderer draft={draft} templateId={templateId} />
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => navigate('/resume-builder/score')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Score</span>
        </button>

        <button
          onClick={() => navigate('/resume-builder/export')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Continue to Export PDF</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
