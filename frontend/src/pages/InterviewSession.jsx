import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  Send,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  BookOpen
} from 'lucide-react';
import { interviewService } from '../services/interviewService';

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Authoritative timers
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(1800); // 30 min default
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const timerIntervalRef = useRef(null);

  // Load session data
  useEffect(() => {
    let mounted = true;
    async function fetchSession() {
      try {
        setLoadingSession(true);
        const data = await interviewService.getInterviewById(id);

        if (!mounted) return;

        if (data.interview.status === 'completed') {
          navigate(`/interview/results/${id}`, { replace: true });
          return;
        }

        setSession(data.interview);
        setQuestions(data.questions || []);

        const idx = data.interview.currentQuestionIndex || 0;
        setCurrentQuestionIndex(idx);
        setCurrentQuestion(data.questions[idx] || null);

        // Calculate remaining duration
        const durationSec = (data.interview.duration || 30) * 60;
        if (data.interview.startedAt) {
          const elapsed = Math.floor((Date.now() - new Date(data.interview.startedAt).getTime()) / 1000);
          const remaining = Math.max(0, durationSec - elapsed);
          setTimeLeftSeconds(remaining);
        } else {
          setTimeLeftSeconds(durationSec);
        }

        setQuestionStartTime(Date.now());
      } catch (err) {
        if (mounted) {
          setErrorMessage(err.response?.data?.message || err.message || 'Failed to load interview session.');
        }
      } finally {
        if (mounted) setLoadingSession(false);
      }
    }

    if (id) fetchSession();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  // Run Countdown Timer
  useEffect(() => {
    if (loadingSession || !session || session.status === 'completed') return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [loadingSession, session]);

  // Format timer seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeftSeconds < 180; // less than 3 minutes

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    const timeSpentSeconds = Math.max(10, Math.round((Date.now() - questionStartTime) / 1000));

    try {
      const res = await interviewService.submitAnswer({
        mockInterviewId: session._id,
        questionId: currentQuestion._id,
        answerText: answerText.trim(),
        timeSpentSeconds,
        startedAt: new Date(questionStartTime).toISOString()
      });

      if (res.isFinished) {
        // Final question answered: navigate directly to results
        navigate(`/interview/results/${session._id}`);
      } else {
        // Advance to next question
        const nextIdx = res.nextQuestionIndex;
        setCurrentQuestionIndex(nextIdx);
        setCurrentQuestion(res.nextQuestion);
        setAnswerText('');
        setQuestionStartTime(Date.now());
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('[Submit Answer Error]', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to submit answer. Please try again; your text is preserved.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-sky-500/20 border-t-sky-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-3 border-cyan-400/20 border-b-cyan-400 animate-spin reverse"></div>
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
          Initializing Your Personalized Interview...
        </p>
      </div>
    );
  }

  if (errorMessage && !currentQuestion) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Session Unavailable</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{errorMessage}</p>
        <button
          onClick={() => navigate('/interview')}
          className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs"
        >
          Return to Setup
        </button>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const wordCount = answerText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Session Progress Bar & Authoritative Countdown */}
      <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-xs font-bold text-sky-700 dark:text-cyan-400">
              {session.targetRole}
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              {session.interviewType} &bull; {session.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Question Counter */}
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Question <span className="text-sky-600 dark:text-cyan-400">{currentQuestionIndex + 1}</span> of {totalQuestions}
            </div>

            {/* Countdown Timer */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
              isLowTime
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse border border-rose-300 dark:border-rose-800'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Question Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {currentQuestion?.questionType} Focus
            </span>
            <span className="text-[11px] text-slate-400">
              Take time to structure your thoughts clearly
            </span>
          </div>

          {/* Prominent Question Text */}
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug m-0">
            "{currentQuestion?.questionText}"
          </h2>

          {/* Topic Guidance Badges */}
          {currentQuestion?.expectedTopics && currentQuestion.expectedTopics.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Expected Themes:</span>
              {currentQuestion.expectedTopics.map((topic, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Answer Input Workspace */}
        <form onSubmit={handleSubmitAnswer} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Your Spoken / Written Response
              </label>
              <span className="text-slate-400 text-[11px]">
                {wordCount} words &bull; {answerText.length} characters
              </span>
            </div>

            <textarea
              rows={8}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              disabled={isSubmitting}
              placeholder="Structure your answer clearly. If behavioral, use Situation, Task, Action, Result (STAR). If technical, describe architecture, investigation, trade-offs, and measurable impact..."
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none leading-relaxed font-sans disabled:opacity-50"
              required
            />
          </div>

          {/* Guidance note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
            <HelpCircle className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Evaluation Engine:</strong> Your response will be scored across 5 weighted dimensions: Relevance (30%), Clarity (20%), STAR Framework (20%), Technical Accuracy (15%), and Completeness (15%).
            </p>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Future Voice Mode extension ready &bull; Text answers active
            </span>

            <button
              type="submit"
              disabled={isSubmitting || !answerText.trim()}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Answer...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Polished Submitting / Evaluation Overlay */}
        {isSubmitting && (
          <div className="p-6 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 text-center space-y-3 animate-in fade-in">
            <div className="relative w-10 h-10 mx-auto">
              <div className="absolute inset-0 rounded-full border-3 border-sky-500/20 border-t-sky-500 animate-spin"></div>
              <div className="absolute inset-1.5 rounded-full border-3 border-cyan-400/20 border-b-cyan-400 animate-spin reverse"></div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Evaluating your answer...
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Checking relevance, clarity, STAR structure, technical accuracy, and completeness.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
