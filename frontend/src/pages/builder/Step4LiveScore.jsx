import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  ShieldCheck,
  Target
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import AtsScoreGauge from '../../components/AtsScoreGauge';
import FactorBreakdownChart from '../../components/FactorBreakdownChart';
import ActionableFeedbackCard from '../../components/ActionableFeedbackCard';

export default function Step4LiveScore() {
  const { atsScore, scoreDelta, scoreBreakdown } = useBuilder();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Live ATS Diagnostic Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time scoring based on the exact 7 ATS factors evaluated across thousands of modern enterprise hiring systems.
          </p>
        </div>

        {scoreDelta !== 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
            {scoreDelta > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">+{scoreDelta} points gained</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <span className="text-rose-600 dark:text-rose-400">{scoreDelta} points shift</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Score Visualizations */}
      <div className="space-y-8">
        <AtsScoreGauge score={atsScore} status="analyzed" />

        <FactorBreakdownChart breakdown={scoreBreakdown} />

        <ActionableFeedbackCard breakdown={scoreBreakdown} />
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => navigate('/resume-builder/suggestions')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to AI Suggestions</span>
        </button>

        <button
          onClick={() => navigate('/resume-builder/preview')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Continue to Preview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
