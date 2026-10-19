import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Target,
  Mic,
  Compass,
  Upload,
  ArrowRight,
  Sparkles,
  History,
  Clock,
  FileText,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resumeService } from '../services/resumeService';
import { jobService } from '../services/jobService';
import { interviewService } from '../services/interviewService';
import { careerService } from '../services/careerService';
import CareerPulseGauge from '../components/CareerPulseGauge';
import MetricCard from '../components/MetricCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [interviewStats, setInterviewStats] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        const [resumeRes, matchRes, interviewRes, roadmapRes] = await Promise.all([
          resumeService.getResumes().catch(() => ({ resumes: [] })),
          jobService.getJobMatches().catch(() => ({ matches: [] })),
          interviewService.getAnalytics().catch(() => ({ data: null })),
          careerService.getRoadmap().catch(() => ({ data: null }))
        ]);

        if (isMounted) {
          setResumes(resumeRes.resumes || []);
          setMatches(matchRes.matches || []);
          setInterviewStats(interviewRes.data || null);
          setRoadmap(roadmapRes.data || null);
        }
      } catch (err) {
        console.warn('Dashboard data fetch error:', err.message);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const latestResume = resumes.length > 0 ? resumes[0] : null;
  const hasAnalyzedResume = latestResume && latestResume.status === 'analyzed' && typeof latestResume.atsScore === 'number';
  const hasPendingResume = latestResume && latestResume.status !== 'analyzed';

  const latestMatch = matches.length > 0 ? matches[0] : null;
  const hasJobMatch = latestMatch && typeof latestMatch.matchPercent === 'number';

  const interviewCount = interviewStats?.totalInterviews || 0;
  const avgInterviewScore = interviewStats?.averageScore || 0;
  const hasInterviewData = interviewCount > 0;

  const totalRoadmapItems = roadmap?.phases?.reduce((acc, p) => acc + (p.skills?.length || 0), 0) || 0;
  const completedRoadmapItems = roadmap?.phases?.reduce((acc, p) => acc + (p.skills?.filter(s => s.completed)?.length || 0), 0) || 0;
  const hasRoadmapData = totalRoadmapItems > 0;
  const careerProgressPct = hasRoadmapData ? Math.round((completedRoadmapItems / totalRoadmapItems) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Career Intelligence Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Welcome back, {user?.name || 'Explorer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your ATS diagnostics, role compatibility, and actionable career trajectory in one continuous system.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            to="/resumes"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 transition"
          >
            <Upload className="w-4 h-4" />
            <span>{latestResume ? 'Manage Resumes' : 'Upload Resume'}</span>
          </Link>

          <Link
            to="/job-matching"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-teal-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Target className="w-4 h-4" />
            <span>Match Job</span>
          </Link>
        </div>
      </div>

      {/* 4 Key Intelligence Metric Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: ATS Score */}
        {hasAnalyzedResume ? (
          <MetricCard
            title="ATS Score"
            value={`${latestResume.atsScore}%`}
            subtext={`Calibrated on "${latestResume.fileName}"`}
            icon={FileCheck2}
            badge="Analyzed"
            accentColor="emerald"
          />
        ) : hasPendingResume ? (
          <MetricCard
            title="ATS Score"
            value={null}
            emptyText="Resume uploaded"
            subtext="Analyze your resume to unlock your ATS score"
            icon={FileCheck2}
            badge="Analysis Pending"
          />
        ) : (
          <MetricCard
            title="ATS Score"
            value={null}
            emptyText="No data yet"
            subtext="Upload a resume to get started"
            icon={FileCheck2}
            badge="Awaiting Upload"
          />
        )}

        {/* Metric 2: Job Match % */}
        {hasJobMatch ? (
          <MetricCard
            title="Job Match %"
            value={`${latestMatch.matchPercent}%`}
            subtext={`Matched for "${latestMatch.jobId?.title || 'Target Role'}"`}
            icon={Target}
            badge="Role Calibrated"
            accentColor="teal"
          />
        ) : (
          <MetricCard
            title="Job Match %"
            value={null}
            emptyText="No job matches yet"
            subtext="Analyze a job description to see how your resume aligns"
            icon={Target}
            badge="Ready to Match"
          />
        )}

        {/* Metric 3: Interview Readiness */}
        {hasInterviewData ? (
          <MetricCard
            title="Interview Readiness"
            value={`${Math.round(avgInterviewScore)}%`}
            subtext={`${interviewCount} mock session${interviewCount > 1 ? 's' : ''} completed`}
            icon={Mic}
            badge="STAR Evaluated"
            accentColor="amber"
          />
        ) : (
          <MetricCard
            title="Interview Readiness"
            value={null}
            emptyText="No interviews yet"
            subtext="Practice mock screens to evaluate STAR responses"
            icon={Mic}
            badge="Ready to Prep"
          />
        )}

        {/* Metric 4: Career Progress */}
        {hasRoadmapData ? (
          <MetricCard
            title="Career Progress"
            value={`${careerProgressPct}%`}
            subtext={`${completedRoadmapItems} of ${totalRoadmapItems} roadmap skills acquired`}
            icon={Compass}
            badge="Roadmap Active"
            accentColor="sky"
          />
        ) : (
          <MetricCard
            title="Career Progress"
            value={null}
            emptyText="Trajectory unmapped"
            subtext="Generate your personalized career GPS roadmap"
            icon={Compass}
            badge="Awaiting GPS"
          />
        )}
      </div>

      {/* Signature Component: Career Pulse Gauge */}
      <CareerPulseGauge
        score={
          hasAnalyzedResume || hasJobMatch || hasInterviewData || hasRoadmapData
            ? {
                overall: Math.round(
                  ((hasAnalyzedResume ? latestResume.atsScore : 0) * 0.35) +
                  ((hasJobMatch ? latestMatch.matchPercent : 0) * 0.30) +
                  ((hasInterviewData ? avgInterviewScore : 0) * 0.20) +
                  ((hasRoadmapData ? careerProgressPct : 0) * 0.15)
                ),
                ats: hasAnalyzedResume ? latestResume.atsScore : 0,
                match: hasJobMatch ? latestMatch.matchPercent : 0,
                interview: hasInterviewData ? Math.round(avgInterviewScore) : 0,
                trajectory: hasRoadmapData ? careerProgressPct : 0
              }
            : null
        }
        status={
          hasAnalyzedResume && hasJobMatch
            ? `ATS (${latestResume.atsScore}%) & Job Match (${latestMatch.matchPercent}%) Active`
            : hasAnalyzedResume
            ? `ATS Calibrated (${latestResume.atsScore}%) &bull; Complete Job Match & Interview`
            : hasJobMatch
            ? `Job Match Calibrated (${latestMatch.matchPercent}%)`
            : 'Upload a resume or start an interview to generate your Career Pulse Score'
        }
      />

      {/* Connected Intelligence Pipeline */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-cyan-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Continuous Intelligence Pipeline</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white m-0">
              How ResumeIQ Connects Your Career Journey
            </h2>
          </div>
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Phase 3: Job Matching Live
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: 'Step 1',
              title: 'Ingest Resume',
              desc: hasAnalyzedResume
                ? `Active diagnostic score: ${latestResume.atsScore}%. Review 7-factor breakdown & feedback.`
                : 'Parse structural formatting, quantify impact verbs, and eliminate ATS disqualifiers.',
              action: hasAnalyzedResume ? 'View Diagnostic' : 'Go to Resumes',
              link: hasAnalyzedResume ? `/resumes/${latestResume._id}` : '/resumes',
              active: true
            },
            {
              step: 'Step 2',
              title: 'Target Benchmark',
              desc: hasJobMatch
                ? `Benchmarked with ${latestMatch.matchPercent}% match against ${latestMatch.jobId?.title || 'Target Role'}.`
                : 'Paste a target job description and calibrate keyword density and mandatory credentials.',
              action: hasJobMatch ? 'View Match Intelligence' : 'Match Job Now',
              link: hasJobMatch ? `/job-matching/history/${latestMatch._id}` : '/job-matching',
              active: true
            },
            {
              step: 'Step 3',
              title: 'Close Skill Gaps',
              desc: 'Pinpoint precise gaps in tech stacks and business acumen with targeted courses.',
              action: 'Inspect Gaps',
              link: '/career-gps',
              active: false
            },
            {
              step: 'Step 4',
              title: 'Simulate Screen',
              desc: 'Practice customized behavioral and algorithmic interview prompts with real-time feedback.',
              action: 'Start Prep',
              link: '/interview-prep',
              active: false
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border flex flex-col justify-between transition ${
                item.active
                  ? 'border-teal-300 dark:border-teal-800/60 bg-teal-50/40 dark:bg-teal-950/20'
                  : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/30'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {item.step}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                <Link
                  to={item.link}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  <span>{item.action}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 m-0">
              Recent Intelligence & Activity
            </h2>
          </div>
          <span className="text-xs text-slate-400">Live Audit Log</span>
        </div>

        {latestResume || latestMatch ? (
          <div className="space-y-3">
            {/* Latest Job Match item */}
            {latestMatch && (
              <div className="p-4 rounded-xl border border-teal-200/60 dark:border-teal-900/50 bg-teal-50/40 dark:bg-teal-950/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Role Match: {latestMatch.jobId?.title || 'Target Role'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Match Score: {latestMatch.matchPercent}% &bull; Analyzed on{' '}
                      {new Date(latestMatch.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/job-matching/history/${latestMatch._id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  <span>View Match</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Latest Resume item */}
            {latestResume && (
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-slate-800 text-sky-600 dark:text-cyan-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {latestResume.fileName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Uploaded on {new Date(latestResume.uploadedAt).toLocaleDateString()} &bull;{' '}
                      {hasAnalyzedResume
                        ? `ATS Score: ${latestResume.atsScore}%`
                        : 'Pending analysis'}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/resumes/${latestResume._id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-cyan-400 hover:underline"
                >
                  <span>View Diagnostic</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              No activity logged yet
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Activity logs will record resume revisions, job matches, and simulated mock interviews automatically once you upload your first document.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
