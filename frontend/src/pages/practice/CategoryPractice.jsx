import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  Sparkles,
  FileText,
  Briefcase,
  Code2,
  Users,
  Compass,
  FolderGit2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import PracticeRunner from '../../components/practice/PracticeRunner';
import { resumeService } from '../../services/resumeService';
import { interviewService } from '../../services/interviewService';

export default function CategoryPractice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCategory = searchParams.get('category');

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [category, setCategory] = useState(
    ['technical', 'behavioral', 'situational', 'project'].includes(preselectedCategory?.toLowerCase())
      ? preselectedCategory.toLowerCase()
      : 'behavioral'
  );

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

  const categories = [
    {
      id: 'technical',
      name: 'Technical',
      icon: Code2,
      desc: 'Technologies, architecture, debugging, concepts, and technical trade-offs'
    },
    {
      id: 'behavioral',
      name: 'Behavioral',
      icon: Users,
      desc: 'Teamwork, leadership, conflict resolution, failure, and communication'
    },
    {
      id: 'situational',
      name: 'Situational',
      icon: Compass,
      desc: 'Hypothetical workplace scenarios, outages, trade-offs, and ambiguous specs'
    },
    {
      id: 'project',
      name: 'Project Deep-Dive',
      icon: FolderGit2,
      desc: 'Direct exploration of projects, architectures, and outcomes on your resume'
    }
  ];

  const handleStart = async (e) => {
    e.preventDefault();
    if (!targetRole.trim() || isStarting) return;

    try {
      setIsStarting(true);
      setErrorMessage('');

      const res = await interviewService.startPracticeSession({
        sessionType: 'category',
        targetRole: targetRole.trim(),
        resumeId: selectedResumeId || undefined,
        category
      });

      setActiveSession(res.session);
    } catch (err) {
      console.error('[Start Category Practice Error]', err);
      setErrorMessage(err.response?.data?.message || 'Could not start category practice. Please try again.');
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
          <span>Back to Category Selection</span>
        </button>

        <PracticeRunner
          session={activeSession}
          modeTitle={`Category Focus: ${category.charAt(0).toUpperCase() + category.slice(1)}`}
          modeIcon={Layers}
          contextBadge={category}
          onRestart={() => setActiveSession(null)}
        />
      </div>
    );
  }

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
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Category Focus Practice
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target a specific interview category with personalized questions generated from your background.
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
          {/* Category Selector Cards */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Choose Interview Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 dark:border-indigo-700 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {c.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {c.desc}
                    </p>
                  </button>
                );
              })}
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
                placeholder="e.g., Cloud Architect"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No resume (Role context only)</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title || r.fileName || 'Uploaded Resume'}
                  </option>
                ))}
              </select>
            </div>
            {category === 'project' && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                Tip: Selecting a resume enables questions focused specifically on your past projects.
              </p>
            )}
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isStarting || !targetRole.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating {category} questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start {category.charAt(0).toUpperCase() + category.slice(1)} Practice</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
