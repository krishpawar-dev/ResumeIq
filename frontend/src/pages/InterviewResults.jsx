import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Award,
  ArrowLeft,
  RotateCcw,
  Printer,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Clock,
  ShieldCheck,
  Tag,
  MessageSquare,
  FileCheck,
  Zap,
  TrendingUp
} from 'lucide-react';
import { interviewService } from '../services/interviewService';
import CriterionScoreBar from '../components/interview/CriterionScoreBar';

export default function InterviewResults() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    let mounted = true;
    async function fetchResults() {
      try {
        setIsLoading(true);
        const data = await interviewService.getInterviewById(id);

        if (!mounted) return;

        setSession(data.interview);
        setReport(data.report);

        // Open first question by default
        if (data.report?.perQuestionReports?.length > 0) {
          setExpandedQuestions({ 0: true });
        }
      } catch (err) {
        if (mounted) {
          setErrorMessage(err.response?.data?.message || err.message || 'Failed to retrieve interview results.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    if (id) fetchResults();

    return () => {
      mounted = false;
    };
  }, [id]);

  const toggleQuestion = (index) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-sky-500/20 border-t-sky-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-3 border-cyan-400/20 border-b-cyan-400 animate-spin reverse"></div>
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
          Compiling Detailed Performance Report...
        </p>
      </div>
    );
  }

  if (errorMessage || !session) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Report Unavailable</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{errorMessage || 'Interview session not found.'}</p>
        <Link
          to="/interview"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Interview Prep</span>
        </Link>
      </div>
    );
  }

  const overallScore = report?.overallScore || session.overallScore || 0;
  const avg = report?.averageScores || { relevance: 0, clarity: 0, star: 0, technicalAccuracy: 0, completeness: 0 };
  const perQuestionReports = report?.perQuestionReports || [];

  const getReadinessBadge = (score) => {
    if (score >= 8.5) return { label: 'Exceptional Screen Readiness', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
    if (score >= 7.0) return { label: 'Strong Technical Competence', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-cyan-300 border-sky-200 dark:border-sky-800' };
    if (score >= 5.5) return { label: 'Solid Foundation — Refine Results', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
    return { label: 'Needs Practice & STAR Polish', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
  };

  const readiness = getReadinessBadge(overallScore);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 print:m-0 print:p-0">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/interview"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
              Mock Interview Performance Report
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive 5-criteria evaluation, missing points diagnosis, and improved model answers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <Link
            to="/interview"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs tracking-wide shadow-md transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New Screen</span>
          </Link>
        </div>
      </div>

      {/* RESULTS HERO CARD */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${readiness.color}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{readiness.label}</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
              {session.targetRole}
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span className="capitalize">{session.interviewType}</span> Focus &bull; <span className="capitalize">{session.difficulty}</span> Seniority &bull; {session.duration} min duration &bull; Completed {perQuestionReports.length} questions
            </p>
          </div>

          {/* Prominent Overall Score Gauge */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 self-start md:self-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white flex items-center justify-center font-mono font-black text-2xl shadow-lg shadow-sky-600/20">
              {overallScore}
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Overall Score
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {overallScore} <span className="text-xs font-normal text-slate-400">/ 10</span>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Weighted across 5 factors
              </div>
            </div>
          </div>
        </div>

        {/* 5-Criteria Average Breakdown */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Average Criteria Performance
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80">
              <CriterionScoreBar label="Relevance" weight={30} score={avg.relevance} />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80">
              <CriterionScoreBar label="Clarity" weight={20} score={avg.clarity} />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80">
              <CriterionScoreBar label="STAR Structure" weight={20} score={avg.star} />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80">
              <CriterionScoreBar label="Technical" weight={15} score={avg.technicalAccuracy} />
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80">
              <CriterionScoreBar label="Completeness" weight={15} score={avg.completeness} />
            </div>
          </div>
        </div>

        {/* Executive Strengths & Recurring Weaknesses Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Strengths */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Overall Key Strengths</span>
            </div>
            <ul className="space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
              {(report?.overallStrengths || []).map((s, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">&bull;</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Recurring Weaknesses & Patterns</span>
            </div>
            <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              {(report?.overallWeaknesses || []).map((w, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="font-bold text-amber-600 dark:text-amber-400">&bull;</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* PER-QUESTION DETAILED AUDIT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
            Per-Question Evaluation & Diagnostic Breakdown
          </h3>
          <span className="text-xs text-slate-400">
            Click to expand/collapse details
          </span>
        </div>

        <div className="space-y-4">
          {perQuestionReports.map((item, idx) => {
            const isExpanded = Boolean(expandedQuestions[idx]);
            const q = item.question;
            const ans = item.answer;
            const ev = item.evaluation;

            return (
              <div
                key={q._id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm transition-all"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleQuestion(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Question {idx + 1} &bull; {q.questionType}
                      </span>
                      {ans?.timeSpentSeconds > 0 && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{ans.timeSpentSeconds}s response time</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      "{q.questionText}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {ev?.overallScore !== undefined && (
                      <div className="text-right">
                        <div className="text-base font-mono font-black text-slate-900 dark:text-white">
                          {ev.overallScore} <span className="text-xs font-normal text-slate-400">/ 10</span>
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Score
                        </div>
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-6 bg-slate-50/40 dark:bg-slate-950/30">
                    {/* Candidate's Submitted Answer */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Your Submitted Response
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                        {ans?.answerText || 'No answer recorded.'}
                      </p>
                    </div>

                    {ev ? (
                      <div className="space-y-6">
                        {/* 5-Criteria Bars */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                            Grading Criteria Breakdown
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <CriterionScoreBar label="Relevance" weight={30} score={ev.relevanceScore} />
                            <CriterionScoreBar label="Clarity" weight={20} score={ev.clarityScore} />
                            <CriterionScoreBar label="STAR" weight={20} score={ev.starScore} />
                            <CriterionScoreBar label="Technical" weight={15} score={ev.technicalAccuracyScore} />
                            <CriterionScoreBar label="Completeness" weight={15} score={ev.completenessScore} />
                          </div>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Strengths</span>
                            </span>
                            <ul className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                              {(ev.strengths || []).map((s, i) => (
                                <li key={i}>&bull; {s}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Areas for Improvement</span>
                            </span>
                            <ul className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                              {(ev.weaknesses || []).map((w, i) => (
                                <li key={i}>&bull; {w}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Missing Points */}
                        {ev.missingPoints && ev.missingPoints.length > 0 && (
                          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <FileCheck className="w-3.5 h-3.5 text-sky-500" />
                              <span>Key Information You Should Have Included</span>
                            </span>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                              {ev.missingPoints.map((m, i) => (
                                <li key={i}>&bull; {m}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Improved Model Answer */}
                        {ev.improvedModelAnswer && (
                          <div className="p-5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-cyan-400 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Example of a Stronger Answer (Model Response)</span>
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Grounded in your real experience
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed italic font-serif">
                              "{ev.improvedModelAnswer}"
                            </p>
                          </div>
                        )}

                        {/* Keyword & Filler Word Diagnostics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Keywords */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-sky-500" />
                              <span>Keyword Analysis</span>
                            </span>

                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-[10px] font-semibold text-slate-400 block mb-1">Keywords Used:</span>
                                <div className="flex flex-wrap gap-1">
                                  {(ev.keywords?.used || []).length > 0 ? (
                                    ev.keywords.used.map((kw, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        ✓ {kw}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">None detected</span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] font-semibold text-slate-400 block mb-1">Useful Missing Keywords:</span>
                                <div className="flex flex-wrap gap-1">
                                  {(ev.keywords?.missing || []).length > 0 ? (
                                    ev.keywords.missing.map((kw, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                        + {kw}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">None</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Filler Words */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                              <span>Filler Word Detection</span>
                            </span>

                            <div className="space-y-1.5 text-xs">
                              <div className="text-slate-600 dark:text-slate-400">
                                Total detected:{' '}
                                <strong className="font-mono text-slate-900 dark:text-white">
                                  {ev.fillerWords?.totalCount || 0}
                                </strong>
                              </div>

                              <div className="flex flex-wrap gap-1 pt-1">
                                {(ev.fillerWords?.occurrences || []).length > 0 ? (
                                  ev.fillerWords.occurrences.map((fw, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                      "{fw.word}" &times; {fw.count}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Zero verbal filler words detected</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No evaluation recorded for this question.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
