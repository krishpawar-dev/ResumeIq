import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  FileText,
  Calendar,
  Briefcase,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { jobService } from '../services/jobService';
import JobMatchScoreGauge from '../components/JobMatchScoreGauge';
import SkillsComparisonView from '../components/SkillsComparisonView';
import TailoringSuggestionsList from '../components/TailoringSuggestionsList';

export default function JobMatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showFullJd, setShowFullJd] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const data = await jobService.getJobMatchById(id);
        if (isMounted) {
          setMatch(data.match);
          setErrorMessage('');
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(
            err.response?.data?.message || err.message || 'Failed to load match record.'
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (id) fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this match record?')) return;

    try {
      await jobService.deleteJobMatch(id);
      navigate('/job-matching/history');
    } catch (err) {
      alert(`Deletion failed: ${err.response?.data?.message || err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-teal-500/20 border-t-teal-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-3 border-sky-400/20 border-b-sky-400 animate-spin reverse"></div>
        </div>
        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
          Loading Role Match Intelligence...
        </div>
      </div>
    );
  }

  if (errorMessage || !match) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Match Record Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {errorMessage || 'This comparison record does not exist or you do not have permission to view it.'}
        </p>
        <Link
          to="/job-matching/history"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs tracking-wide shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Match Archive</span>
        </Link>
      </div>
    );
  }

  const job = match.jobId || {};
  const resume = match.resumeId || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/job-matching/history"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
            title="Back to Match Archive"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0 truncate max-w-lg">
                {job.title || 'Target Role'}
              </h1>
              {job.company && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {job.company}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <Link
                  to={`/resumes/${resume._id}`}
                  className="font-medium hover:underline text-sky-600 dark:text-cyan-400"
                >
                  {resume.fileName || 'Linked Resume'}
                </Link>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(match.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition cursor-pointer"
            title="Delete Match"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Signature Gauge */}
      <JobMatchScoreGauge
        matchPercent={match.matchPercent}
        scoreBreakdown={match.scoreBreakdown}
        jobTitle={job.title}
        company={job.company}
      />

      {/* Skills Matrix */}
      <SkillsComparisonView
        matchedSkills={match.matchedSkills}
        missingSkills={match.missingSkills}
      />

      {/* Tailoring Recommendations */}
      <TailoringSuggestionsList
        suggestions={match.tailoringSuggestions}
      />

      {/* Collapsible Original Job Description */}
      {job.jobDescriptionText && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm">
          <button
            onClick={() => setShowFullJd((prev) => !prev)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Pasted Job Description Text ({job.metadata?.wordCount || 0} words)
              </span>
            </div>
            {showFullJd ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showFullJd && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/70">
              <pre className="text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-96 leading-relaxed">
                {job.jobDescriptionText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
