import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  RefreshCw,
  Trash2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import AtsScoreGauge from '../components/AtsScoreGauge';
import FactorBreakdownChart from '../components/FactorBreakdownChart';
import ActionableFeedbackCard from '../components/ActionableFeedbackCard';
import ResumeSectionOptimizer from '../components/ResumeSectionOptimizer';
import ResumeVersionHistory from '../components/ResumeVersionHistory';
import ResumeImprovementPlan from '../components/ResumeImprovementPlan';

export default function ResumeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showRawText, setShowRawText] = useState(false);
  const [versionRefreshTrigger, setVersionRefreshTrigger] = useState(0);

  const fetchResume = async () => {
    try {
      setIsLoading(true);
      const data = await resumeService.getResumeById(id);
      setResume(data.resume);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to retrieve resume details.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchResume();
    }
  }, [id]);

  const handleReanalyze = async () => {
    setIsAnalyzing(true);
    setErrorMessage('');
    try {
      const data = await resumeService.analyzeResume(id);
      setResume(data.resume);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'ATS re-analysis failed.'
      );
      // Refresh to ensure current status is rendered
      fetchResume();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${resume?.fileName}"?`)) {
      return;
    }

    try {
      await resumeService.deleteResume(id);
      navigate('/resumes');
    } catch (err) {
      alert(`Deletion failed: ${err.response?.data?.message || err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-sky-500/20 border-t-sky-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-3 border-cyan-400/20 border-b-cyan-400 animate-spin reverse"></div>
        </div>
        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
          Loading Resume Intelligence...
        </div>
      </div>
    );
  }

  if (errorMessage && !resume) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Resume Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {errorMessage}
        </p>
        <Link
          to="/resumes"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-xs tracking-wide shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Resumes</span>
        </Link>
      </div>
    );
  }

  const isProcessing = isAnalyzing || resume?.status === 'processing';
  const isFailed = resume?.status === 'failed';
  const isAnalyzed = resume?.status === 'analyzed';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/resumes"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
            title="Back to Resumes"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-md m-0">
                {resume.fileName}
              </h1>
              {isAnalyzed && typeof resume.atsScore === 'number' && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-cyan-400 border border-sky-200 dark:border-sky-800">
                  ATS {resume.atsScore}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {new Date(resume.uploadedAt).toLocaleDateString()}
              </span>
              <span>&bull;</span>
              <span>{resume.metadata?.wordCount || 0} words parsed</span>
              <span>&bull;</span>
              {resume.fileUrl && (
                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-600 dark:text-cyan-400 hover:underline"
                >
                  <span>Original Document</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleReanalyze}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-semibold text-xs tracking-wide shadow-md shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Analyzing...' : 'Re-Run Analysis'}</span>
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition cursor-pointer"
            title="Delete Resume"
            aria-label="Delete Resume"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Processing Loading State */}
      {isProcessing ? (
        <div className="rounded-3xl border border-dashed border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20 p-12 text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-cyan-400/20 border-b-cyan-400 animate-spin reverse"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Analyzing your resume...
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
              ResumeIQ is evaluating your structure, keywords, achievements, skills, and ATS readiness against 7 weighted factors.
            </p>
          </div>
        </div>
      ) : isFailed ? (
        /* Error State with Recovery */
        <div className="rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              We couldn't complete the ATS analysis
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-2">
              Your resume was uploaded successfully, but the ATS diagnostic encountered an issue: {resume.analysisError || 'Unknown processing error'}.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleReanalyze}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs tracking-wide shadow-md cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry ATS Analysis</span>
            </button>
          </div>
        </div>
      ) : (
        /* Complete ATS Intelligence Display */
        <div className="space-y-8">
          {/* Signature Overall ATS Score Gauge */}
          <AtsScoreGauge
            score={resume.atsScore}
            status={resume.status}
            isAIPowered={resume.isAIPowered}
          />

          {/* 7-Factor Breakdown Chart */}
          <FactorBreakdownChart
            breakdown={resume.scoreBreakdown}
          />

          {/* Actionable Recommendations Accordion */}
          <ActionableFeedbackCard
            breakdown={resume.scoreBreakdown}
          />

          <ResumeImprovementPlan plan={resume.improvementPlan} />

          {/* AI Resume Section Optimizer */}
          <ResumeSectionOptimizer
            resume={resume}
            onVersionSaved={() => setVersionRefreshTrigger((prev) => prev + 1)}
          />

          {/* Saved Version History */}
          <ResumeVersionHistory
            resumeId={resume._id}
            refreshTrigger={versionRefreshTrigger}
          />
        </div>
      )}

      {/* Raw Extracted Text Collapsible Viewer */}
      {resume?.parsedText && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm">
          <button
            onClick={() => setShowRawText((prev) => !prev)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Inspect Extracted Text ({resume.metadata?.characterCount || resume.parsedText.length} characters)
              </span>
            </div>
            {showRawText ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showRawText && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/70">
              <pre className="text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-96 leading-relaxed">
                {resume.parsedText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
