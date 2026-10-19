import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  ArrowLeft,
  Sparkles,
  FileText,
  Briefcase,
  Loader2,
  AlertCircle,
  Timer
} from 'lucide-react';
import PracticeRunner from '../../components/practice/PracticeRunner';
import { resumeService } from '../../services/resumeService';
import { interviewService } from '../../services/interviewService';

export default function TimedPractice() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [duration, setDuration] = useState(10); // minutes

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
        sessionType: 'timed',
        targetRole: targetRole.trim(),
        resumeId: selectedResumeId || undefined,
        duration: Number(duration)
      });

      setActiveSession(res.session);
    } catch (err) {
      console.error('[Start Timed Practice Error]', err);
      setErrorMessage(err.response?.data?.message || 'Could not start timed practice. Please try again.');
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
          <span>Back to Timed Setup</span>
        </button>

        <PracticeRunner
          session={activeSession}
          modeTitle={`Timed Practice (${duration} min)`}
          modeIcon={Clock}
          contextBadge={`${duration}m countdown`}
          onRestart={() => setActiveSession(null)}
        />
      </div>
    );
  }

  const durationOptions = [
    { label: '5 Minutes', value: 5, desc: 'Quick 2–3 question drill' },
    { label: '10 Minutes', value: 10, desc: 'Balanced 4–5 questions' },
    { label: '15 Minutes', value: 15, desc: 'In-depth 6–7 questions' },
    { label: '20 Minutes', value: 20, desc: 'Full endurance test' }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Link
        to="/interview/practice"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Practice Modes</span>
      </Link>

      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Timed Practice
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Practice answering questions under authoritative countdown pressure.
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
          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Select Practice Duration
            </label>
            <div className="grid grid-cols-2 gap-3">
              {durationOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    duration === opt.value
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 dark:border-amber-700 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {opt.label}
                    </span>
                    <Timer className={`w-4 h-4 ${duration === opt.value ? 'text-amber-500' : 'text-slate-400'}`} />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

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
                placeholder="e.g., Lead Backend Architect"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">No resume (Role context only)</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title || r.fileName || 'Uploaded Resume'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isStarting || !targetRole.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Configuring timed session...</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Start {duration}-Minute Timed Practice</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
