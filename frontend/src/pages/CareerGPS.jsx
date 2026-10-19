import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Briefcase,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  Mic,
  ShieldAlert,
  Loader2,
  AlertCircle,
  FileText,
  RotateCcw,
  Zap,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { careerService } from '../services/careerService';
import { resumeService } from '../services/resumeService';

export default function CareerGPS() {
  const navigate = useNavigate();

  // Profile Context & Form Inputs
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [industryPreference, setIndustryPreference] = useState('Technology');
  const [careerGoal, setCareerGoal] = useState('Advance to technical leadership and system architecture');

  // Career Data State
  const [careerPath, setCareerPath] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Expandable UX states
  const [expandedGapIdx, setExpandedGapIdx] = useState(null);
  const [expandedStepIdx, setExpandedStepIdx] = useState(1); // default expand next step
  const [expandedRoadmapIdx, setExpandedRoadmapIdx] = useState(null);

  // Analysis steps animation state
  const [analysisStep, setAnalysisStep] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [resumesRes, pathRes, roadmapRes] = await Promise.all([
          resumeService.getResumes().catch(() => ({ resumes: [] })),
          careerService.getCareerPath().catch(() => ({ data: { careerPath: null } })),
          careerService.getRoadmap().catch(() => ({ data: { roadmap: null } }))
        ]);

        const resList = resumesRes.resumes || [];
        setResumes(resList);
        if (resList.length > 0) {
          setSelectedResumeId(resList[0]._id);
          if (resList[0].jobTitle && !pathRes?.data?.careerPath) {
            setTargetRole(`Senior ${resList[0].jobTitle}`);
          }
        }

        if (pathRes?.data?.careerPath) {
          setCareerPath(pathRes.data.careerPath);
          setTargetRole(pathRes.data.careerPath.targetRole || 'Senior Full Stack Engineer');
          setIndustryPreference(pathRes.data.careerPath.industryPreference || 'Technology');
        }

        if (roadmapRes?.data?.roadmap) {
          setRoadmap(roadmapRes.data.roadmap);
        }
      } catch (err) {
        console.error('[Load Career GPS Data Error]', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Run Career Analysis
  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!targetRole.trim() || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      setErrorMessage('');
      setAnalysisStep(1);

      const stepInterval = setInterval(() => {
        setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1200);

      const res = await careerService.analyzeCareer({
        targetRole: targetRole.trim(),
        industryPreference,
        targetIndustry: industryPreference,
        careerGoal: careerGoal.trim(),
        resumeId: selectedResumeId || undefined
      });

      clearInterval(stepInterval);
      setCareerPath(res.data.careerPath);
      setRoadmap(res.data.roadmap);
    } catch (err) {
      console.error('[Analyze Career Error]', err);
      setErrorMessage(
        err.response?.data?.message || 'We could not generate your career path right now. Your existing career data is safe.'
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  // Toggle Roadmap Item Completion
  const handleToggleRoadmapItem = async (itemId, currentCompleted) => {
    try {
      // Optimistic update
      setRoadmap((prev) => {
        if (!prev) return prev;
        const newItems = prev.items.map((item) =>
          item._id === itemId ? { ...item, completed: !currentCompleted } : item
        );
        const completedCount = newItems.filter((i) => i.completed).length;
        const overallProgress = Math.round((completedCount / newItems.length) * 100);
        return { ...prev, items: newItems, overallProgress };
      });

      const res = await careerService.toggleRoadmapItem(itemId, !currentCompleted);
      if (res?.data?.roadmap) {
        setRoadmap(res.data.roadmap);
      }
    } catch (err) {
      console.error('[Toggle Roadmap Item Error]', err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500 mb-3" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Loading your Career GPS...
        </p>
      </div>
    );
  }

  const analysisStepMessages = [
    'Analyzing your current profile & experience...',
    'Comparing your skills with target role expectations...',
    'Building ordered career progression & learning roadmap...'
  ];

  const popularRoles = [
    'Senior Frontend Engineer',
    'Lead Backend Architect',
    'Full Stack Tech Lead',
    'Engineering Manager',
    'Staff Cloud Architect',
    'DevOps & Platform Lead'
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold text-sky-600 dark:text-cyan-400">
              Long-Term Career Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-sky-500" />
            <span>Career GPS</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Understand where you are, where you want to go, and what to work on next.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/applications"
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Briefcase className="w-3.5 h-3.5 text-sky-500" />
            <span>Application Tracker</span>
          </Link>
        </div>
      </div>

      {/* Mandatory Non-Guaranteed AI Guidance Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5 shadow-sm">
        <ShieldAlert className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
        <span>
          <strong>AI-generated guidance:</strong> Career GPS uses your profile, goals, skills, and selected target role to generate this roadmap. It is guidance, not a guaranteed prediction of your career path or future outcomes.
        </span>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => handleAnalyze()}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-500"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Target Career Configuration Card */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-sky-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Target Career Configuration
            </h2>
          </div>
          {careerPath && (
            <span className="text-[11px] font-mono text-slate-400">
              Last updated: {new Date(careerPath.updatedAt || careerPath.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target Role */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Target Role *
              </label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Full Stack Engineer, Engineering Manager"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Popular:</span>
                {popularRoles.map((role) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => setTargetRole(role)}
                    className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                      targetRole.toLowerCase() === role.toLowerCase()
                        ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/50 dark:text-cyan-400 dark:border-sky-800'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Industry */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Target Industry
              </label>
              <select
                value={industryPreference}
                onChange={(e) => setIndustryPreference(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Technology">Technology & SaaS</option>
                <option value="Fintech">Fintech & Banking</option>
                <option value="E-Commerce">E-Commerce & Retail</option>
                <option value="Healthcare">Healthcare & Biotech</option>
                <option value="Enterprise">Enterprise Cloud</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Career Goal */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Primary Career Goal
              </label>
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g., Transition from Mid-level to Staff level in 18 months"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Resume Grounding Context */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Profile / Resume Context
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Default Profile Context</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title || r.fileName || 'Uploaded Resume'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isAnalyzing || !targetRole.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {analysisStepMessages[analysisStep - 1] || 'Analyzing your career path...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{careerPath ? 'Re-Analyze Career Path' : 'Analyze My Career Path'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Empty State when no CareerPath is generated yet */}
      {!careerPath && !isAnalyzing && (
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-2">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Your Career GPS starts here.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Choose a target role above and we will map the skills, learning areas, projects, and interview preparation calibrated to help you work toward it.
          </p>
          <button
            onClick={() => handleAnalyze()}
            className="mt-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Career Blueprint</span>
          </button>
        </div>
      )}

      {/* Generated Career Intelligence Content */}
      {careerPath && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* AI Summary Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50/70 via-white to-cyan-50/40 dark:from-slate-900 dark:via-[#0c1427] dark:to-slate-900 border border-sky-200 dark:border-sky-800/60 shadow-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-cyan-400 border border-sky-300 dark:border-sky-800 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-sky-600 dark:text-cyan-400">
                Career Trajectory Assessment
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed mt-0.5">
                {careerPath.aiSummary}
              </p>
            </div>
          </div>

          {/* PRIMARY VISUALIZATION: The 4 Conceptual Stages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-500" />
                4-Stage Career Progression Architecture
              </h2>
              {roadmap && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Learning Progress:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {roadmap.overallProgress}% Complete
                  </span>
                </div>
              )}
            </div>

            {/* Horizontal flow on Desktop, Vertical on Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative">
              {/* STAGE 1: Current Skills */}
              <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between relative group hover:border-sky-300 dark:hover:border-sky-700 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                      Stage 01
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Current Skills
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-3">
                    Grounded in your verified resume profile.
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {careerPath.currentSkills?.slice(0, 8).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {skill}
                      </span>
                    )) || <span className="text-xs text-slate-400">Standard tech stack</span>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 font-mono">
                  Base: {careerPath.currentRole || 'Engineer'}
                </div>
              </div>

              {/* STAGE 2: Skill Gap */}
              <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between relative group hover:border-amber-300 dark:hover:border-amber-700 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                      Stage 02
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Skill Gap
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-3">
                    High-leverage gaps required for {careerPath.targetRole}.
                  </p>

                  <div className="space-y-2">
                    {careerPath.skillGap?.slice(0, 3).map((gap, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-[120px]">
                          {gap.skill}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          gap.importance === 'high'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {gap.importance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 font-mono">
                  {careerPath.skillGap?.length || 0} identified gaps
                </div>
              </div>

              {/* STAGE 3: Learning Roadmap */}
              <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between relative group hover:border-sky-300 dark:hover:border-sky-700 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                      Stage 03
                    </span>
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Learning Roadmap
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-3">
                    Milestones and projects to build readiness.
                  </p>

                  {roadmap && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span>Completion</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {roadmap.items.filter((i) => i.completed).length}/{roadmap.items.length} done
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-sky-500 to-cyan-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${roadmap.overallProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 font-mono">
                  {roadmap?.items?.length || 0} actionable items
                </div>
              </div>

              {/* STAGE 4: Target Career */}
              <div className="bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-cyan-500/10 dark:from-slate-900 dark:via-[#09152b] dark:to-slate-900 rounded-2xl border border-sky-300 dark:border-sky-800/80 p-5 shadow-sm flex flex-col justify-between relative group transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-sky-700 dark:text-cyan-400">
                      Destination
                    </span>
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {careerPath.targetRole}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 mb-3">
                    Industry: {careerPath.targetIndustry || 'Technology'}
                  </p>

                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-sky-100 dark:border-sky-900/50 text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="font-semibold block mb-0.5">Primary Target:</span>
                    {careerPath.careerGoal || 'Long-term engineering leadership'}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-sky-200 dark:border-sky-900/60 flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-cyan-400">
                  <Link to="/interview/practice" className="hover:underline flex items-center gap-1">
                    <span>Practice for this role</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILED SKILL GAP BREAKDOWN */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-sky-500" />
                  Detailed Skill Gap Analysis
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  AI-estimated competency differences between your current profile and {careerPath.targetRole}.
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">1 to 5 scale</span>
            </div>

            <div className="space-y-3 pt-2">
              {careerPath.skillGap?.map((gap, idx) => {
                const isExpanded = expandedGapIdx === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedGapIdx(isExpanded ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          gap.importance === 'high'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                        }`}>
                          {gap.importance}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {gap.skill}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                            L{gap.currentLevel}
                          </span>
                          <span>&rarr;</span>
                          <span className="font-mono font-bold text-sky-600 dark:text-cyan-400">
                            L{gap.targetLevel}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 text-xs space-y-2 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/60">
                        <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>Why it matters:</strong> {gap.reason}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-400 italic">
                            * ResumeIQ estimate based on industry role benchmarks.
                          </span>
                          <Link
                            to="/interview/practice/category?category=technical"
                            className="text-sky-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            <span>Practice this skill</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* INTERACTIVE LEARNING ROADMAP */}
          {roadmap && (
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-500" />
                    Interactive Learning Roadmap
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Actionable milestones tied to your skill gap. Check items off as you complete them.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {roadmap.overallProgress}% Overall Progress
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {roadmap.items.map((item, idx) => {
                  const isExpanded = expandedRoadmapIdx === idx;
                  return (
                    <div
                      key={item._id}
                      className={`rounded-xl border transition-all ${
                        item.completed
                          ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50'
                      }`}
                    >
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleRoadmapItem(item._id, item.completed)}
                            className="p-1 text-slate-400 hover:text-emerald-500 transition-colors"
                            title={item.completed ? 'Mark uncompleted' : 'Mark completed'}
                          >
                            {item.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${
                                item.completed
                                  ? 'line-through text-slate-500 dark:text-slate-400'
                                  : 'text-slate-900 dark:text-white'
                              }`}>
                                {item.title}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {item.estimatedEffort}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              Skill: {item.skill}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedRoadmapIdx(isExpanded ? null : idx)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-4 pt-1 text-xs space-y-3 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/60">
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {item.description}
                          </p>

                          {item.projectIdea && (
                            <div className="p-3 rounded-lg bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-slate-700 dark:text-slate-300">
                              <span className="font-bold text-sky-800 dark:text-cyan-400 block mb-0.5">
                                Recommended Project:
                              </span>
                              {item.projectIdea}
                            </div>
                          )}

                          {item.resources && item.resources.length > 0 && (
                            <div>
                              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Recommended Study Areas:
                              </span>
                              <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                                {item.resources.map((res, rIdx) => (
                                  <li key={rIdx}>{res}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ORDERED CAREER PROGRESSION STEPS */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-500" />
                Ordered Career Progression Path
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sequential engineering milestones from your current foundation to {careerPath.targetRole}.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {careerPath.progression?.map((step, idx) => {
                const isExpanded = expandedStepIdx === idx;
                const isTarget = idx === (careerPath.progression.length - 1);

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isTarget
                        ? 'border-sky-300 dark:border-sky-800 bg-sky-50/20 dark:bg-sky-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedStepIdx(isExpanded ? null : idx)}
                      className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-100/40 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isTarget
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          0{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              {step.title}
                            </span>
                            {isTarget && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-cyan-300">
                                Target Destination
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {step.requiredSkills?.length || 0} key skills • {step.suggestedProjects?.length || 0} projects
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-5 pt-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] space-y-5 text-xs">
                        {/* Required Skills */}
                        <div>
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                            Required Competencies
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {step.requiredSkills?.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Learning Plan */}
                        <div>
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                            Learning Plan
                          </h4>
                          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc pl-4">
                            {step.learningPlan?.map((plan, pIdx) => (
                              <li key={pIdx} className="leading-relaxed">{plan}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Suggested Projects */}
                        {step.suggestedProjects && step.suggestedProjects.length > 0 && (
                          <div>
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                              Suggested Portfolio Projects
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {step.suggestedProjects.map((proj, prIdx) => (
                                <div
                                  key={prIdx}
                                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {proj.projectTitle}
                                    </span>
                                    <span className="text-[10px] font-mono capitalize px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                      {proj.difficulty}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {proj.description}
                                  </p>
                                  {proj.skillsPracticed && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {proj.skillsPracticed.map((sk, skIdx) => (
                                        <span key={skIdx} className="text-[10px] text-sky-600 dark:text-cyan-400 font-medium">
                                          #{sk}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Interview Prep Guidance */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                              <Mic className="w-3.5 h-3.5 text-sky-500" />
                              Interview Preparation for this Level
                            </h4>
                            <ul className="space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400 list-disc pl-4">
                              {step.interviewPrep?.map((ip, ipIdx) => (
                                <li key={ipIdx}>{ip}</li>
                              ))}
                            </ul>
                          </div>

                          <Link
                            to="/interview/practice"
                            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
                          >
                            <span>Practice These Skills</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
