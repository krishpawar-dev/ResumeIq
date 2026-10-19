import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  ArrowLeft,
  Sparkles,
  FileText,
  Briefcase,
  Loader2,
  AlertCircle
} from 'lucide-react';
import PracticeRunner from '../../components/practice/PracticeRunner';
import { resumeService } from '../../services/resumeService';
import { interviewService } from '../../services/interviewService';

export default function FlashcardPractice() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');

  const [activeSession, setActiveSession] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadResumes() {
      try {
        setIsLoading(true);
        const res = await resumeService.getResumes();
        const list = res.resumes || [];
        setResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0]._id);
          if (list[0].jobTitle) {
            setTargetRole(list[0].jobTitle);
          }
        }
      } catch (err) {
        console.error('[Load Resumes Error]', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadResumes();
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!targetRole.trim() || isStarting) return;

    try {
      setIsStarting(true);
      setErrorMessage('');

      const res = await interviewService.startPracticeSession({
        sessionType: 'flashcard',
        targetRole: targetRole.trim(),
        resumeId: selectedResumeId || undefined
      });

      setActiveSession(res.session);
    } catch (err) {
      console.error('[Start Flashcard Error]', err);
      setErrorMessage(err.response?.data?.message || 'Could not start flashcard practice. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  if (activeSession) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <button
          onClick={() => setActiveSession(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Practice Setup</span>
        </button>

        <PracticeRunner
          session={activeSession}
          modeTitle="Flashcard Practice"
          modeIcon={Zap}
          contextBadge={targetRole}
          onRestart={() => setActiveSession(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back button */}
      <Link
        to="/interview/practice"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Practice Modes</span>
      </Link>

      {/* Card Header */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Flashcard Mode
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quick 1-question practice drills with immediate AI evaluation feedback.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-5">
          {/* Target Role */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Target Role *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Frontend Engineer, DevOps Lead"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Resume Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Resume Context
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">No resume (Role context only)</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title || r.fileName || 'Uploaded Resume'}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Selecting a resume grounds flashcard questions in your real tech stack and projects.
            </p>
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isStarting || !targetRole.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-medium shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing personalized flashcard...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Flashcard Practice</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
