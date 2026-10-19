import React from 'react';
import { Link } from 'react-router-dom';
import { Target, FileText, ArrowRight, Calendar, Trash2 } from 'lucide-react';

export default function JobMatchCard({ match, onDelete }) {
  const jobTitle = match.jobId?.title || 'Target Role';
  const company = match.jobId?.company || '';
  const resumeName = match.resumeId?.fileName || 'Resume Document';
  const matchPercent = match.matchPercent || 0;

  const formattedDate = new Date(match.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800';
    if (score >= 65) return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/80 dark:text-cyan-400 dark:border-sky-800';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-800';
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800';
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between group shadow-sm">
      <div>
        {/* Top: Icon + Score Pill */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
            <Target className="w-5 h-5" />
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border inline-flex items-center gap-1 ${getScoreBadge(matchPercent)}`}>
            <span>{matchPercent}% Match</span>
          </span>
        </div>

        {/* Title & Company */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate mb-0.5" title={jobTitle}>
          {jobTitle}
        </h3>
        {company && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
            {company}
          </div>
        )}

        {/* Resume & Date Details */}
        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 truncate">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{resumeName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Analyzed on {formattedDate}</span>
          </div>
        </div>

        {/* Brief Match Summary */}
        {match.matchSummary && (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-3 leading-relaxed">
            {match.matchSummary}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <Link
          to={`/job-matching/history/${match._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline"
        >
          <span>View Match Intelligence</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {onDelete && (
          <button
            onClick={() => onDelete(match._id, jobTitle)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition cursor-pointer"
            title="Delete Match"
            aria-label="Delete Match"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
