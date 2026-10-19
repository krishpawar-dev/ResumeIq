import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Eye,
  MessageSquare,
  TrendingUp,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { intelligenceService } from '../services/intelligenceService';

const VERDICT_CONFIG = {
  strong: {
    label: 'Strong Credibility',
    icon: ShieldCheck,
    color: 'emerald',
    desc: 'This resume demonstrates high credibility with specific, quantified, and verifiable claims.'
  },
  credible: {
    label: 'Credible',
    icon: ShieldCheck,
    color: 'sky',
    desc: 'Resume is generally credible with some opportunities to strengthen specificity and impact language.'
  },
  needs_work: {
    label: 'Needs Strengthening',
    icon: ShieldAlert,
    color: 'amber',
    desc: 'Several areas of vague language or unquantified claims that reduce recruiter confidence.'
  },
  concerning: {
    label: 'Credibility Concerns',
    icon: ShieldX,
    color: 'rose',
    desc: 'Multiple credibility gaps detected. Significant revision recommended before submitting to employers.'
  }
};

const SEVERITY_STYLES = {
  high: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300',
  medium: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300',
  low: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
};

const ISSUE_TYPE_LABELS = {
  vague_claim: 'Vague Claim',
  missing_metric: 'Missing Metric',
  timeline_gap: 'Timeline Gap',
  title_inflation: 'Title Inflation',
  hollow_bullet: 'Hollow Bullet',
  overstatement: 'Overstatement'
};

export default function ResumeTruthDetector() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let mounted = true;
    async function fetchResume() {
      try {
        setIsLoadingResume(true);
        const data = await resumeService.getResumeById(id);
        if (mounted) setResume(data.resume);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || 'Failed to load resume.');
      } finally {
        if (mounted) setIsLoadingResume(false);
      }
    }
    if (id) fetchResume();
    return () => { mounted = false; };
  }, [id]);

  const runAnalysis = async () => {
    setError('');
    setIsLoading(true);
    setAnalysis(null);
    try {
      const data = await intelligenceService.runTruthDetector(id);
      setAnalysis(data.analysis);
      setActiveTab('overview');
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (idx) => {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (isLoadingResume) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading resume...</p>
        </div>
      </div>
    );
  }

  const verdictCfg = analysis ? (VERDICT_CONFIG[analysis.verdict] || VERDICT_CONFIG.needs_work) : null;
  const VerdictIcon = verdictCfg?.icon;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/resumes/${id}`}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Resume</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Authenticity Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Resume Truth Detector
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            AI audit of your resume's credibility — vague language, unquantified claims, and recruiter red flags.
          </p>
        </div>
        <div className="self-start sm:self-auto">
          {resume && (
            <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{resume.fileName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Pre-analysis state */}
      {!analysis && !isLoading && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 flex flex-col items-center text-center space-y-6 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Ready to audit your resume's credibility?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              The Truth Detector scans for vague verbs, missing metrics, hollow bullet points, and timeline inconsistencies.
              It asks the exact questions a recruiter would ask.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-xl">
            {[
              { icon: Eye, label: 'Vague Language', desc: 'Detects hollow verbs' },
              { icon: TrendingUp, label: 'Missing Metrics', desc: 'Finds unquantified claims' },
              { icon: Clock, label: 'Timeline Gaps', desc: 'Spots date inconsistencies' },
              { icon: MessageSquare, label: 'Recruiter Questions', desc: 'What they\'d ask you' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-center">
                  <Icon className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              );
            })}
          </div>
          <button
            onClick={runAnalysis}
            disabled={!resume?.parsedText}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Truth Detection</span>
          </button>
          {!resume?.parsedText && (
            <p className="text-xs text-slate-400">This resume has no parsed text. Please upload a resume with readable text.</p>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-16 flex flex-col items-center text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Auditing resume credibility...</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Scanning for vague language, missing metrics, and recruiter red flags.</div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !isLoading && (
        <div className="space-y-6">
          {/* Verdict Banner */}
          <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            verdictCfg?.color === 'emerald' ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50' :
            verdictCfg?.color === 'sky' ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/50' :
            verdictCfg?.color === 'amber' ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50' :
            'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
          }`}>
            <div className="flex items-center gap-4">
              {VerdictIcon && (
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  verdictCfg?.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' :
                  verdictCfg?.color === 'sky' ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-cyan-400' :
                  verdictCfg?.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' :
                  'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                }`}>
                  <VerdictIcon className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trust Verdict</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{verdictCfg?.label}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-lg">{verdictCfg?.desc}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
                  {analysis.overallTrustScore}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Trust Score</div>
              </div>
              <button
                onClick={runAnalysis}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-run</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'sections', label: `Sections (${analysis.sections?.length || 0})` },
              { id: 'language', label: 'Language Audit' },
              { id: 'questions', label: 'Recruiter Questions' },
              { id: 'priorities', label: 'Fix Priority' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in duration-200">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Top Issues */}
                {analysis.topIssues?.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Top Credibility Issues
                    </h3>
                    <div className="space-y-3">
                      {analysis.topIssues.map((issue, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{issue.issue}</span>
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              ×{issue.occurrences || 1}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{issue.impact}</p>
                          {issue.fix && (
                            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1">
                                <CheckCircle2 className="w-3 h-3" /> Fix:
                              </span>
                              <p className="text-xs text-emerald-800 dark:text-emerald-300">{issue.fix}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {analysis.timelineAnalysis && (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-500" />
                      Timeline Analysis
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className={`p-3 rounded-xl border text-center ${analysis.timelineAnalysis.hasGaps ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'}`}>
                        {analysis.timelineAnalysis.hasGaps
                          ? <XCircle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                          : <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />}
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Employment Gaps</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{analysis.timelineAnalysis.hasGaps ? 'Gap(s) detected' : 'None detected'}</div>
                      </div>
                      <div className={`p-3 rounded-xl border text-center ${analysis.timelineAnalysis.chronologicalConsistency === 'consistent' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50' : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'}`}>
                        <CheckCircle2 className={`w-5 h-5 mx-auto mb-1 ${analysis.timelineAnalysis.chronologicalConsistency === 'consistent' ? 'text-emerald-500' : 'text-amber-500'}`} />
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Chronology</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{analysis.timelineAnalysis.chronologicalConsistency?.replace('_', ' ')}</div>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
                        <FileText className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Gap Periods</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{analysis.timelineAnalysis.gapPeriods?.length || 0} detected</div>
                      </div>
                    </div>
                    {analysis.timelineAnalysis.gapPeriods?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {analysis.timelineAnalysis.gapPeriods.map((gap, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                            {gap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SECTIONS TAB */}
            {activeTab === 'sections' && (
              <div className="space-y-3">
                {analysis.sections?.length > 0 ? analysis.sections.map((section, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
                    <button
                      onClick={() => toggleSection(i)}
                      className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                          section.trustScore >= 75 ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' :
                          section.trustScore >= 55 ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' :
                          'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                        }`}>
                          {section.trustScore}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{section.sectionName}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {section.issues?.length || 0} issue{section.issues?.length !== 1 ? 's' : ''} detected
                          </div>
                        </div>
                      </div>
                      {expandedSections[i] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {expandedSections[i] && (
                      <div className="px-5 pb-5 space-y-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                        {section.strengths?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {section.strengths.map((s, si) => (
                              <span key={si} className="px-2.5 py-1 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />{s}
                              </span>
                            ))}
                          </div>
                        )}
                        {section.issues?.map((issue, ii) => (
                          <div key={ii} className={`p-3.5 rounded-xl border ${SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.low}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                {ISSUE_TYPE_LABELS[issue.type] || issue.type}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                issue.severity === 'high' ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200' :
                                issue.severity === 'medium' ? 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200' :
                                'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}>{issue.severity}</span>
                            </div>
                            {issue.original && (
                              <div className="font-mono text-[11px] italic opacity-70 mb-1 line-clamp-2">"{issue.original}"</div>
                            )}
                            <p className="text-xs">{issue.issue}</p>
                            {issue.betterVersion && (
                              <div className="mt-2 p-2 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-current/20 text-xs">
                                <strong>Better: </strong>{issue.betterVersion}
                              </div>
                            )}
                          </div>
                        ))}
                        {(!section.issues || section.issues.length === 0) && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> No issues detected in this section.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-400 text-sm">No section-level analysis available.</div>
                )}
              </div>
            )}

            {/* LANGUAGE AUDIT TAB */}
            {activeTab === 'language' && analysis.languageAudit && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Stats */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Quantification Rate</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Quantified claims', value: analysis.languageAudit.quantifiedClaims, color: 'emerald' },
                      { label: 'Unquantified claims', value: analysis.languageAudit.unquantifiedClaims, color: 'rose' },
                      { label: 'Passive voice uses', value: analysis.languageAudit.passiveVoiceInstances, color: 'amber' }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 dark:text-slate-400">{item.label}</span>
                        <span className={`text-sm font-bold font-mono ${
                          item.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                          item.color === 'rose' ? 'text-rose-600 dark:text-rose-400' :
                          'text-amber-600 dark:text-amber-400'
                        }`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strong Verbs */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500" /> Strong Verbs Found
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.languageAudit.strongVerbs?.length > 0
                      ? analysis.languageAudit.strongVerbs.map((v, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 font-semibold">
                            ✓ {v}
                          </span>
                        ))
                      : <span className="text-xs text-slate-400">None detected</span>}
                  </div>
                </div>

                {/* Vague Verbs */}
                <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Vague Verbs Detected
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.languageAudit.vagueVerbs?.length > 0
                      ? analysis.languageAudit.vagueVerbs.map((v, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 font-semibold">
                            ⚠ {v}
                          </span>
                        ))
                      : <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> No vague verbs detected</span>}
                  </div>
                </div>
              </div>
            )}

            {/* RECRUITER QUESTIONS TAB */}
            {activeTab === 'questions' && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Questions a Recruiter Would Ask</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                  These are the questions your resume's vague or unquantified claims invite. Strengthen your resume to answer them proactively.
                </p>
                {analysis.recruiterQuestions?.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.recruiterQuestions.map((q, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-200">{q}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">No major recruiter concerns generated.</p>
                )}
              </div>
            )}

            {/* FIX PRIORITY TAB */}
            {activeTab === 'priorities' && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Prioritized Improvement Plan</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                  High-impact actions first. Focus on these in order.
                </p>
                {analysis.improvementPriority?.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.improvementPriority.map((item, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-4">
                        <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          item.impact === 'high' ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300' :
                          item.impact === 'medium' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' :
                          'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-cyan-400'
                        }`}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.action}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              item.impact === 'high' ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300' :
                              item.impact === 'medium' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' :
                              'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-cyan-400'
                            }`}>
                              {item.impact} impact
                            </span>
                            <span className="text-[10px] text-slate-400">{item.effort} effort</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">No improvement priorities generated — resume is in good shape!</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
