import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Target,
  FileText,
  Sparkles,
  ArrowRight,
  History,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus,
  RotateCcw
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { jobService } from '../services/jobService';
import JobMatchScoreGauge from '../components/JobMatchScoreGauge';
import SkillsComparisonView from '../components/SkillsComparisonView';
import TailoringSuggestionsList from '../components/TailoringSuggestionsList';
import EmptyState from '../components/EmptyState';

const SAMPLE_JOB_DESCRIPTION = `Senior Full Stack Engineer at Stripe
We are seeking an experienced Senior Full Stack Engineer with 5+ years of software development experience to design, build, and maintain mission-critical web applications.

Requirements:
- 4+ years of hands-on experience building scalable applications using React, TypeScript, and modern JavaScript (ES6+).
- Strong proficiency with Node.js, Express, and distributed microservices architecture.
- Demonstrated experience optimizing API latency and database performance with PostgreSQL, MongoDB, and Redis caching.
- Familiarity with cloud infrastructure (AWS) and modern containerization technologies (Docker, Kubernetes).
- Deep commitment to Test-Driven Development (TDD), CI/CD automation, and clean architecture principles.
- Preferred: Experience with Next.js, GraphQL, and high-volume financial transaction processing.
- Excellent communication and collaborative problem-solving skills in an Agile environment.`;

export default function JobMatching() {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [historyCount, setHistoryCount] = useState(0);

  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [matchResult, setMatchResult] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        setIsLoadingResumes(true);
        const [resumeData, historyData] = await Promise.all([
          resumeService.getResumes(),
          jobService.getJobMatches().catch(() => ({ matches: [] }))
        ]);

        if (isMounted) {
          const userResumes = resumeData.resumes || [];
          setResumes(userResumes);
          setHistoryCount(historyData.matches?.length || 0);

          // Pre-select highest ATS or latest resume if available
          if (userResumes.length > 0) {
            const bestResume = [...userResumes].sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0))[0];
            setSelectedResumeId(bestResume._id);
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage('Failed to load user documents. Please refresh.');
        }
      } finally {
        if (isMounted) setIsLoadingResumes(false);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRunMatch = async () => {
    if (!jobDescriptionText.trim() || jobDescriptionText.trim().length < 50) {
      setErrorMessage('Please paste at least 50 characters of a job description.');
      return;
    }

    if (!selectedResumeId) {
      setErrorMessage('Please select a resume to match against this job.');
      return;
    }

    setErrorMessage('');
    setIsMatching(true);

    try {
      const response = await jobService.matchJob({
        jobDescriptionText: jobDescriptionText.trim(),
        resumeId: selectedResumeId
      });

      setMatchResult(response.match);
      setHistoryCount((prev) => prev + 1);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Job match calculation failed. Please try again.'
      );
    } finally {
      setIsMatching(false);
    }
  };

  const handleResetForNewJob = () => {
    setMatchResult(null);
    setJobDescriptionText('');
    setErrorMessage('');
  };

  const selectedResume = resumes.find((r) => r._id === selectedResumeId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Role Compatibility Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Job Description Matching & Skill Alignment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Benchmark your resume against target roles with 4-dimension weighted intelligence and actionable tailoring recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            to="/job-matching/history"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
          >
            <History className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Match History ({historyCount})</span>
          </Link>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* RESULTS VIEW (Rendered after match calculation) */}
      {matchResult ? (
        <div className="space-y-8 animate-in zoom-in-95 duration-200">
          {/* Top Bar with action to analyze another role */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">Active Match:</span>
              <span>{matchResult.jobId?.title || 'Target Role'}</span>
              <span>&bull;</span>
              <span className="italic">{matchResult.resumeId?.fileName || 'Selected Resume'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetForNewJob}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Analyze Another Job</span>
              </button>

              <Link
                to={`/job-matching/history/${matchResult._id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold transition shadow-sm"
              >
                <span>Full Match View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Signature Job Match Score Gauge */}
          <JobMatchScoreGauge
            matchPercent={matchResult.matchPercent}
            scoreBreakdown={matchResult.scoreBreakdown}
            jobTitle={matchResult.jobId?.title}
            company={matchResult.jobId?.company}
          />

          {/* Matched vs Missing Skills Matrix */}
          <SkillsComparisonView
            matchedSkills={matchResult.matchedSkills}
            missingSkills={matchResult.missingSkills}
          />

          {/* Actionable Tailoring Recommendations */}
          <TailoringSuggestionsList
            suggestions={matchResult.tailoringSuggestions}
          />
        </div>
      ) : (
        /* TWO-PANEL WORKSPACE (Input state) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* PANEL 1: Job Description Input (7 Cols) */}
            <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white m-0">
                    Step 1: Paste Target Job Description
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setJobDescriptionText(SAMPLE_JOB_DESCRIPTION)}
                    className="text-xs text-sky-600 dark:text-cyan-400 hover:underline font-medium cursor-pointer"
                  >
                    Load Sample Stripe JD
                  </button>
                  {jobDescriptionText && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        type="button"
                        onClick={() => setJobDescriptionText('')}
                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={13}
                  value={jobDescriptionText}
                  onChange={(e) => setJobDescriptionText(e.target.value)}
                  placeholder="Paste the full job posting here (Title, responsibilities, technical requirements, qualifications, and preferred tools)..."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:focus:ring-teal-400/50 leading-relaxed resize-y transition"
                />

                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>
                    {jobDescriptionText.length} characters{' '}
                    {jobDescriptionText.length < 50 && (
                      <span className="text-amber-500">(minimum 50 required)</span>
                    )}
                  </span>
                  <span>Requires valid role details</span>
                </div>
              </div>
            </div>

            {/* PANEL 2: Resume Selector (5 Cols) */}
            <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-cyan-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white m-0">
                    Step 2: Select Resume
                  </h2>
                </div>

                <Link
                  to="/resumes"
                  className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-cyan-400 hover:underline font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Upload New</span>
                </Link>
              </div>

              {isLoadingResumes ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <div className="w-6 h-6 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin"></div>
                  <div className="text-xs text-slate-400">Loading your resumes...</div>
                </div>
              ) : resumes.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    You haven't uploaded any resumes yet. Upload a resume first to run role compatibility matching.
                  </p>
                  <Link
                    to="/resumes"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs tracking-wide shadow-md"
                  >
                    <span>Upload Resume Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {resumes.map((resume) => {
                    const isSelected = selectedResumeId === resume._id;
                    return (
                      <div
                        key={resume._id}
                        onClick={() => setSelectedResumeId(resume._id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40 shadow-sm'
                            : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-sky-600 bg-sky-600 text-white dark:border-cyan-400 dark:bg-cyan-400 dark:text-slate-950'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-950" />}
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {resume.fileName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {new Date(resume.uploadedAt).toLocaleDateString()} &bull;{' '}
                              {resume.metadata?.wordCount || 0} words
                            </div>
                          </div>
                        </div>

                        {typeof resume.atsScore === 'number' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-cyan-400 border border-sky-200 dark:border-sky-800 shrink-0">
                            ATS {resume.atsScore}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Big Action Bar */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-900/10 via-sky-900/10 to-transparent dark:from-slate-900 dark:to-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Ready to execute weighted role comparison?
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedResume
                  ? `Comparing "${selectedResume.fileName}" against requirements with 4-pillar weighting.`
                  : 'Select a resume above to proceed.'}
              </p>
            </div>

            <button
              onClick={handleRunMatch}
              disabled={isMatching || !selectedResumeId || jobDescriptionText.trim().length < 50}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-teal-600/20 dark:shadow-teal-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            >
              {isMatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Role Alignment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Role Match</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
