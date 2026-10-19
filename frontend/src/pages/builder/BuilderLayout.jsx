import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutTemplate,
  Edit,
  Sparkles,
  Gauge,
  Eye,
  Download,
  Save,
  CheckCircle,
  RotateCw
} from 'lucide-react';
import { BuilderProvider, useBuilder } from '../../context/BuilderContext';
import PersistentScoreBar from '../../components/builder/PersistentScoreBar';

function BuilderHeaderAndStepper() {
  const location = useLocation();
  const { isSaving, lastSaved, saveDraftNow } = useBuilder();

  const steps = [
    { path: '/resume-builder/template', label: '1. Template', icon: LayoutTemplate },
    { path: '/resume-builder/information', label: '2. Information', icon: Edit },
    { path: '/resume-builder/suggestions', label: '3. AI Suggestions', icon: Sparkles },
    { path: '/resume-builder/score', label: '4. Live ATS Score', icon: Gauge },
    { path: '/resume-builder/preview', label: '5. Preview', icon: Eye },
    { path: '/resume-builder/export', label: '6. Export PDF', icon: Download }
  ];

  // Show persistent score bar on steps 2 to 5
  const isScoreBarVisible =
    location.pathname.includes('/information') ||
    location.pathname.includes('/suggestions') ||
    location.pathname.includes('/score') ||
    location.pathname.includes('/preview');

  return (
    <div className="space-y-6">
      {/* Title & Autosave Feedback Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Resume Builder & Optimizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Multi-step ATS resume engineering with live intelligence, truthful AI rephrasing, and executive templates.
          </p>
        </div>

        {/* Autosave status indicator & Save button */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            {isSaving ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin text-sky-500" />
                <span>Autosaving draft...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Saved at {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            ) : (
              <span>Draft initialized</span>
            )}
          </div>

          <button
            onClick={saveDraftNow}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Visual Stepper / Wizard UI */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <NavLink
                key={step.path}
                to={step.path}
                className={({ isActive: active }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Persistent Live ATS Score Indicator (Steps 2-5) */}
      {isScoreBarVisible && <PersistentScoreBar />}

      {/* Step View Content */}
      <Outlet />
    </div>
  );
}

export default function BuilderLayout() {
  return (
    <BuilderProvider>
      <BuilderHeaderAndStepper />
    </BuilderProvider>
  );
}
