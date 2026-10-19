import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { jobService } from '../services/jobService';
import JobMatchCard from '../components/JobMatchCard';
import EmptyState from '../components/EmptyState';

export default function JobMatchHistory() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const data = await jobService.getJobMatches();
      setMatches(data.matches || []);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to retrieve match history.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete match record for "${title}"?`)) return;

    try {
      await jobService.deleteJobMatch(id);
      setMatches((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert(`Deletion failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/job-matching"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
            title="Back to Job Matching"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
              Role Match Archive
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Historical comparisons and tailored intelligence records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchMatches}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/job-matching"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs tracking-wide shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Role Match</span>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Matches Grid */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-teal-500/20 border-t-teal-500 animate-spin"></div>
          <div className="text-xs text-slate-400">Loading match archive...</div>
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon={Target}
          badge="No Match History"
          title="No job matches analyzed yet"
          description="Benchmark your resume against target job descriptions to calculate alignment, uncover missing capabilities, and view saved history."
          actionText="Analyze Your First Role"
          actionLink="/job-matching"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((match) => (
            <JobMatchCard
              key={match._id}
              match={match}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
