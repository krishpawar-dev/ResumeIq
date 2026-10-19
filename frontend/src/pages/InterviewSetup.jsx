import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mic,
  Play,
  FileText,
  Clock,
  Layers,
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  History,
  CheckCircle2,
  Calendar,
  Code2,
  Users,
  Compass
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { interviewService } from '../services/interviewService';
import InterviewNavTabs from '../components/interview/InterviewNavTabs';

export default function InterviewSetup() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [interviewType, setInterviewType] = useState('mixed');
  const [difficulty, setDifficulty] = useState('mid');
  const [duration, setDuration] = useState(30);
  const [focus, setFocus] = useState('fullstack');

  const [pastInterviews, setPastInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [resumesData, historyData] = await Promise.all([
          resumeService.getResumes().catch(() => ({ resumes: [] })),
          interviewService.getInterviewHistory().catch(() => ({ interviews: [] }))
        ]);

        const list = resumesData.resumes || [];
        setResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0]._id);
        }

        setPastInterviews(historyData.interviews || []);
      } catch (err) {
        console.error('[Load Setup Error]', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      setErrorMessage('Please specify your target role.');
      return;
    }

    if (resumes.length === 0) {
      setErrorMessage('Upload a resume before starting a personalized interview.');
      return;
    }

    setIsStarting(true);
    setErrorMessage('');

    try {
      const data = await interviewService.startInterview({
        targetRole: targetRole.trim(),
        interviewType,
        difficulty,
        duration: Number(duration),
        focus,
        resumeId: selectedResumeId || undefined
      });

      if (data.interview?._id) {
        navigate(`/interview/session/${data.interview._id}`);
      } else {
        throw new Error('No interview session ID returned.');
      }
    } catch (err) {
      console.error('[Start Interview Error]', err);
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to initialize mock interview. Please try again.'
      );
      setIsStarting(false);
    }
  };

  const typeOptions = [
    { id: 'mixed', label: 'Mixed Comprehensive', desc: 'Balanced technical architecture, project dive & STAR behavioral questions.' },
    { id: 'technical', label: 'Technical & Architecture', desc: 'In-depth engineering knowledge, trade-offs, debugging, and system design.' },
    { id: 'behavioral', label: 'Behavioral & Leadership', desc: 'Situational experiences, team collaboration, conflict resolution using STAR.' },
    { id: 'hr', label: 'HR & Cultural Screen', desc: 'Career goals, personal trajectory, communication clarity, and values alignment.' }
  ];

  const difficultyOptions = [
    { id: 'entry', label: 'Entry Level', desc: '0–2 years (Foundational concepts)' },
    { id: 'mid', label: 'Mid-Level', desc: '2–5 years (Practical execution & scale)' },
    { id: 'senior', label: 'Senior / Staff', desc: '5+ years (System leadership & trade-offs)' }
  ];

  const durationOptions = [
    { val: 30, label: '30 Minutes', qs: '4 Questions' },
    { val: 45, label: '45 Minutes', qs: '6 Questions' },
    { val: 60, label: '60 Minutes', qs: '8 Questions' }
  ];

  const focusOptions = [
    { id: 'fullstack', label: 'Full Stack' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'data', label: 'Data & Cloud' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-sky-500/20 border-t-sky-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-3 border-cyan-400/20 border-b-cyan-400 animate-spin reverse"></div>
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
          Loading Interview Intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <InterviewNavTabs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            AI Mock Interview Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulate realistic, timed interview screens calibrated directly to your verified resume and target role.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-cyan-400 border border-sky-200 dark:border-sky-800 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Adaptive STAR & Technical Grading</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* No Resume Guard */}
      {resumes.length === 0 ? (
        <div className="p-10 text-center rounded-3xl border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Upload a resume before starting a personalized interview
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              ResumeIQ grounds all mock interview questions in your verified background, projects, and technologies. Please upload a resume first.
            </p>
          </div>
          <Link
            to="/resumes"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs tracking-wide shadow-md transition"
          >
            <span>Upload Resume Now</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Configuration Form */
        <form onSubmit={handleStartInterview} className="space-y-8">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Target Role & Resume Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Target Job Title / Role *
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  required
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Questions will reflect industry expectations for this exact position.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Grounding Resume Context *
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
                >
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.fileName} {r.atsScore ? `(ATS: ${r.atsScore}%)` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ResumeIQ extracts your real tools, architecture, and projects to form questions.
                </p>
              </div>
            </div>

            {/* Interview Type Selection */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                Interview Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {typeOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setInterviewType(opt.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-1 ${
                      interviewType === opt.id
                        ? 'border-sky-600 dark:border-cyan-400 bg-sky-50/50 dark:bg-sky-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {opt.label}
                      </span>
                      {interviewType === opt.id && (
                        <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                Seniority / Difficulty Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {difficultyOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setDifficulty(opt.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-1 ${
                      difficulty === opt.id
                        ? 'border-sky-600 dark:border-cyan-400 bg-sky-50/50 dark:bg-sky-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {opt.label}
                      </span>
                      {difficulty === opt.id && (
                        <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {opt.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration & Focus */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                  Session Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {durationOptions.map((d) => (
                    <button
                      key={d.val}
                      type="button"
                      onClick={() => setDuration(d.val)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                        duration === d.val
                          ? 'border-sky-600 dark:border-cyan-400 bg-sky-50/60 dark:bg-sky-950/40 text-sky-700 dark:text-cyan-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{d.label}</div>
                      <div className="text-[10px] opacity-75">{d.qs}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                  Domain Focus
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {focusOptions.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFocus(f.id)}
                      className={`p-3 rounded-xl border text-center text-xs transition cursor-pointer ${
                        focus === f.id
                          ? 'border-sky-600 dark:border-cyan-400 bg-sky-50/60 dark:bg-sky-950/40 text-sky-700 dark:text-cyan-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isStarting}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                <Play className={`w-4 h-4 fill-current ${isStarting ? 'animate-spin' : ''}`} />
                <span>{isStarting ? 'Generating Personalized Interview...' : 'Start Mock Interview →'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Past Mock Interviews History Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white m-0">
              Recent Mock Interview Sessions
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {pastInterviews.length} recorded session(s)
          </span>
        </div>

        {pastInterviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-1">
            <p>No interviews recorded yet.</p>
            <p className="text-slate-500">Complete your first mock interview above to start tracking your performance trend.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastInterviews.map((session) => (
              <Link
                key={session._id}
                to={session.status === 'completed' ? `/interview/results/${session._id}` : `/interview/session/${session._id}`}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-sky-300 dark:hover:border-sky-800 transition flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-400 transition">
                      {session.targetRole}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      session.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {session.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="capitalize">{session.interviewType}</span>
                    <span>&bull;</span>
                    <span className="capitalize">{session.difficulty}</span>
                    <span>&bull;</span>
                    <span>{session.duration} min</span>
                    <span>&bull;</span>
                    <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {typeof session.overallScore === 'number' && (
                    <div className="text-right">
                      <div className="text-sm font-mono font-black text-slate-900 dark:text-white">
                        {session.overallScore} <span className="text-[10px] font-normal text-slate-400">/ 10</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Score
                      </div>
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
