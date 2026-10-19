import React from 'react';
import { FileEdit, Sparkles, LayoutTemplate } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function ResumeBuilder() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            AI-Assisted Resume Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build recruiter-approved, ATS-compliant resumes with real-time AI bullet rewrites and executive templates.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-semibold text-xs tracking-wide shadow-md shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer">
          <LayoutTemplate className="w-4 h-4" />
          <span>Browse Templates</span>
        </button>
      </div>

      <EmptyState
        icon={FileEdit}
        badge="Phase 6 Module: Real-time Editor"
        title="No active draft in progress"
        description="Craft a high-impact executive resume using curated professional typography, automated metric quantization, and ATS-tested formatting rules."
        actionText="Create New Draft"
        onAction={() => alert('Resume Builder workspace will be activated in upcoming phases!')}
        secondaryText="Back to Dashboard"
        secondaryLink="/dashboard"
      />
    </div>
  );
}
