import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Sparkles,
  FileText,
  Briefcase,
  ShieldAlert,
  Loader2,
  AlertCircle
} from 'lucide-react';
import PracticeRunner from '../../components/practice/PracticeRunner';
import { resumeService } from '../../services/resumeService';
import { interviewService } from '../../services/interviewService';

export default function CompanyPractice() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Frontend Engineer');
  const [companyName, setCompanyName] = useState('Google');

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

  const popularCompanies = ['Google', 'Amazon', 'Microsoft', 'Stripe', 'Meta', 'Netflix', 'Uber', 'Datadog'];

  const handleStart = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !targetRole.trim() || isStarting) return;

    try {
      setIsStarting(true);
      setErrorMessage('');

      const res = await interviewService.startPracticeSession({
        sessionType: 'company',
        targetRole: targetRole.trim(),
        resumeId: selectedResumeId || undefined,
        companyName: companyName.trim()
      });

      setActiveSession(res.session);
    } catch (err) {
      console.error('[Start Company Practice Error]', err);
      setErrorMessage(err.response?.data?.message || 'Could not start company practice. Please try again.');
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
          <span>Back to Company Selection</span>
        </button>

        <PracticeRunner
          session={activeSession}
          modeTitle={`Company Practice: ${companyName}`}
          modeIcon={Building2}
          contextBadge={companyName}
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
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Company-Specific Practice
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prepare for your dream company with questions tailored to role themes and engineering standards.
            </p>
          </div>
        </div>

        {/* Responsible AI Disclaimer Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5 mb-5">
          <ShieldAlert className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <span>
            <strong>Authentic Context:</strong> Questions are synthesized from your resume, role requirements, and publicly known engineering paradigms for the company. ResumeIQ does not fabricate or claim these are leaked or official internal materials.
          </span>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Target Company *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Google, Amazon, Stripe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Quick select:</span>
              {popularCompanies.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCompanyName(c)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                    companyName.toLowerCase() === c.toLowerCase()
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {c}
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
                placeholder="e.g., Software Engineer III"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              disabled={isStarting || !companyName.trim() || !targetRole.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing {companyName} practice questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start {companyName} Practice</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
