import React from 'react';
import { Mic, Play } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function InterviewPrep() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            AI Interview Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulate realistic technical and behavioral interviews calibrated directly to your resume and target job.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-semibold text-xs tracking-wide shadow-md shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer">
          <Play className="w-4 h-4" />
          <span>Start Mock Interview</span>
        </button>
      </div>

      <EmptyState
        icon={Mic}
        badge="Phase 4 Module: Mock Interview Engine"
        title="No interview sessions recorded yet"
        description="Launch an AI-guided mock interview to test your responses, receive STAR structure grading, and identify confidence gaps before real recruiter screens."
        actionText="Begin Mock Screen"
        onAction={() => alert('Interactive AI Mock Interview simulator is slated for Phase 4!')}
        secondaryText="View Sample Prompts"
        secondaryLink="/dashboard"
      />
    </div>
  );
}
