import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Trash2, Calendar, AlertCircle, RefreshCw } from 'lucide-react';

export default function ResumeCard({ resume, onDelete, onAnalyze }) {
  const isAnalyzed = resume.status === 'analyzed';
  const isProcessing = resume.status === 'processing';
  const isFailed = resume.status === 'failed';

  const formattedDate = new Date(resume.uploadedAt || resume.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800';
    if (score >= 65) return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/80 dark:text-cyan-400 dark:border-sky-800';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-800';
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800';
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between group shadow-sm">
      <div>
        {/* Top Header: Icon + Status / Score */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sky-600 dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>

          <div>
            {isAnalyzed && typeof resume.atsScore === 'number' ? (
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border inline-flex items-center gap-1 ${getScoreColor(resume.atsScore)}`}>
                <span>ATS {resume.atsScore}%</span>
              </span>
            ) : isProcessing ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/80 dark:text-cyan-300 dark:border-sky-800/60 inline-flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                Analyzing...
              </span>
            ) : isFailed ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/60 inline-flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Analysis Failed
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                Uploaded
              </span>
            )}
          </div>
        </div>

        {/* File Name & Details */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate mb-1" title={resume.fileName}>
          {resume.fileName}
        </h3>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formattedDate}
          </span>
          <span>&bull;</span>
          <span>
            {resume.fileSize ? `${(resume.fileSize / 1024).toFixed(0)} KB` : 'Document'}
          </span>
          {resume.metadata?.wordCount > 0 && (
            <>
              <span>&bull;</span>
              <span>{resume.metadata.wordCount} words</span>
            </>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isAnalyzed ? (
            <Link
              to={`/resumes/${resume._id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline"
            >
              <span>View ATS Diagnostic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              onClick={() => onAnalyze && onAnalyze(resume._id)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Run ATS Analysis</span>
            </button>
          )}
        </div>

        <button
          onClick={() => onDelete && onDelete(resume._id, resume.fileName)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition cursor-pointer"
          title="Delete Resume"
          aria-label="Delete Resume"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
