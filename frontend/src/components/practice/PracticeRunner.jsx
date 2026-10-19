import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  BarChart3,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Send,
  Loader2
} from 'lucide-react';
import { interviewService } from '../../services/interviewService';

export default function PracticeRunner({
  session,
  onComplete,
  onRestart,
  modeTitle,
  modeIcon: ModeIcon = Zap,
  contextBadge
}) {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(session.currentQuestionIndex || 0);
  const [currentQuestion, setCurrentQuestion] = useState(session.questions?.[0] || null);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [isCompleted, setIsCompleted] = useState(session.status === 'completed');
  const [summaryData, setSummaryData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Timer state for timed practice
  const isTimed = session.sessionType === 'timed';
  const durationSeconds = (session.duration || 10) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (!isTimed) return 0;
    const elapsed = Math.floor((Date.now() - new Date(session.startedAt || Date.now()).getTime()) / 1000);
    return Math.max(0, durationSeconds - elapsed);
  });

  // Keep question state synced
  useEffect(() => {
    if (session.questions && session.questions.length > 0) {
      const q = session.questions[currentIndex] || session.questions[session.questions.length - 1];
      setCurrentQuestion(q);
      setQuestionStartTime(Date.now());
      setAnswerText('');
      setLastEvaluation(null);
    }
  }, [currentIndex, session.questions]);

  // Handle countdown for timed mode
  useEffect(() => {
    if (!isTimed || isCompleted) return;

    if (secondsRemaining <= 0) {
      handleFinishSession();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimed, secondsRemaining, isCompleted]);

  // Format time (MM:SS)
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));

      const result = await interviewService.submitPracticeAnswer(session._id, {
        questionId: currentQuestion._id,
        answerText: answerText.trim(),
        timeSpentSeconds: timeSpent,
        startedAt: new Date(questionStartTime).toISOString()
      });

      setLastEvaluation(result.evaluation);
    } catch (err) {
      console.error('[Submit Practice Answer Error]', err);
      setErrorMessage(err.response?.data?.message || 'Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move to next question or complete
  const handleNextQuestion = () => {
    if (currentIndex + 1 < (session.questions?.length || 0)) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinishSession();
    }
  };

  // Finish practice session
  const handleFinishSession = async () => {
    try {
      setIsSubmitting(true);
      const res = await interviewService.completePracticeSession(session._id);
      setIsCompleted(true);
      setSummaryData(res.session);
      if (onComplete) onComplete(res.session);
    } catch (err) {
      console.error('[Complete Practice Error]', err);
      setIsCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final Summary Screen
  if (isCompleted) {
    const finalScore = summaryData?.averageScore ?? session.averageScore ?? 0;
    const answeredCount = summaryData?.questionsAnswered ?? (currentIndex + (lastEvaluation ? 1 : 0));
    const strongest = summaryData?.strongestArea || 'Technical Accuracy';
    const improve = summaryData?.areaToImprove || 'Completeness';

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-500" />
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Award className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-cyan-400 border border-sky-200 dark:border-sky-800/50 mb-3">
            <ModeIcon className="w-3.5 h-3.5" />
            {modeTitle} Complete
          </span>

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Practice Session Completed!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto mb-8">
            Your answers have been evaluated with the shared ResumeIQ weighted scoring engine and synced with your analytics.
          </p>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-left">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Average Score</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-baseline gap-1">
                {finalScore.toFixed(1)}
                <span className="text-xs text-slate-400 font-normal">/10</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Questions</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {answeredCount}
                <span className="text-xs text-slate-400 font-normal"> answered</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Strongest Area</div>
              <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                {strongest}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Focus Next</div>
              <div className="text-sm font-semibold text-amber-600 dark:text-amber-400 truncate">
                {improve}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {onRestart && (
              <button
                onClick={onRestart}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-750 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Practice Again
              </button>
            )}

            <button
              onClick={() => navigate('/interview/analytics')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-medium shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              View Updated Analytics
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalQuestions = session.questions?.length || 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Session Progress Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 text-sky-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <ModeIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-sky-600 dark:text-cyan-400">
                {modeTitle}
              </span>
              {contextBadge && (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {contextBadge}
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Question {currentIndex + 1} of {totalQuestions}
            </div>
          </div>
        </div>

        {/* Timed countdown or End session button */}
        <div className="flex items-center gap-3">
          {isTimed && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${
              secondsRemaining < 60
                ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 animate-pulse'
                : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          )}

          <button
            onClick={handleFinishSession}
            disabled={isSubmitting}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-sky-500 to-cyan-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {currentQuestion?.category || 'Interview'}
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold capitalize bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-cyan-400 border border-sky-100 dark:border-sky-900/40">
            {currentQuestion?.difficulty || 'mid'} difficulty
          </span>
          {currentQuestion?.companyContext && (
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
              Context: {currentQuestion.companyContext}
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
          "{currentQuestion?.questionText}"
        </h2>

        {currentQuestion?.contextNote && (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Note: {currentQuestion.contextNote}
          </p>
        )}
      </div>

      {/* Answer Area (if not evaluated yet) */}
      {!lastEvaluation ? (
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>Your Answer</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                (Recommend STAR structure: Situation, Task, Action, Result)
              </span>
            </label>
            <span className="text-xs font-mono text-slate-400">
              {answerText.length} characters
            </span>
          </div>

          <textarea
            rows={7}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={isSubmitting}
            placeholder="Type your structured answer here. Speak to your real experiences, decisions, technical context, and quantifiable results..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm leading-relaxed placeholder:text-slate-400 resize-y"
          />

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              Reuses ResumeIQ weighted AI evaluation criteria (30% Relevance, 20% Clarity, 20% STAR, 15% Tech, 15% Completeness)
            </span>

            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || !answerText.trim()}
              className="ml-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-medium shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Answer...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Answer</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Instant Evaluation Card */
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                Evaluation Complete
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Feedback & Scoring
              </h3>
            </div>

            <div className="flex items-baseline gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
              <span className="text-2xl font-extrabold">{lastEvaluation.score?.toFixed(1) || '0.0'}</span>
              <span className="text-xs font-medium text-emerald-600/70">/ 10</span>
            </div>
          </div>

          {/* Criteria Breakdown Grid */}
          {lastEvaluation.criteria && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Relevance (30%)', val: lastEvaluation.criteria.relevance },
                { label: 'Clarity (20%)', val: lastEvaluation.criteria.clarity },
                { label: 'STAR Framework (20%)', val: lastEvaluation.criteria.starMethod },
                { label: 'Tech Accuracy (15%)', val: lastEvaluation.criteria.technicalAccuracy },
                { label: 'Completeness (15%)', val: lastEvaluation.criteria.completeness }
              ].map((c) => (
                <div key={c.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mb-1">
                    {c.label}
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {c.val?.toFixed(1) ?? '—'} <span className="text-[10px] text-slate-400 font-normal">/10</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Strengths
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {lastEvaluation.strengths?.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                )) || <li>Solid response context.</li>}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Areas to Improve
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {lastEvaluation.improvements?.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                )) || <li>Add more quantified outcomes.</li>}
              </ul>
            </div>
          </div>

          {/* Suggestion / Ideal Answer Tip */}
          {lastEvaluation.suggestedAnswer && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                Suggested Refinement
              </h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {lastEvaluation.suggestedAnswer}
              </p>
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-medium shadow-md shadow-sky-600/20 transition-all flex items-center gap-2"
            >
              <span>{currentIndex + 1 < totalQuestions ? 'Next Question' : 'Finish Practice Session'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
