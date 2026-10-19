import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Eye,
  ArrowLeft,
  Clock,
  Scan,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  FileText
} from 'lucide-react';
import { resumeService } from '../services/resumeService';

// Heuristic analysis of what a recruiter sees in 6 seconds
const analyzeRecruiterView = (resumeText, fileName) => {
  if (!resumeText || resumeText.trim().length < 50) {
    return null;
  }

  const lines = resumeText.split('\n').filter((l) => l.trim().length > 0);
  const lower = resumeText.toLowerCase();
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;

  // Detect name (likely first non-empty line or first capitalized proper noun cluster)
  const nameLine = lines[0]?.trim() || 'Not immediately visible';

  // Detect contact info
  const hasEmail = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/.test(lower);
  const hasPhone = /(\+?\d[\d\s\-().]{7,}\d)/.test(resumeText);
  const hasLinkedIn = lower.includes('linkedin');
  const hasGithub = lower.includes('github');
  const hasWebsite = /https?:\/\//.test(lower) || lower.includes('portfolio');

  // Detect sections
  const sectionKeywords = ['experience', 'education', 'skills', 'projects', 'summary', 'objective', 'certifications', 'awards', 'publications', 'volunteer'];
  const detectedSections = sectionKeywords.filter((k) => lower.includes(k));

  // Detect job titles / seniority
  const seniorityKeywords = ['senior', 'lead', 'principal', 'staff', 'manager', 'director', 'vp', 'head of', 'junior', 'mid-level', 'intern'];
  const detectedSeniority = seniorityKeywords.find((k) => lower.includes(k));

  // Detect recent companies
  const companyPatterns = resumeText.match(/(?:at|@)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s*[-|,\n]|\s*\()/g) || [];
  const companiesMentioned = companyPatterns.slice(0, 3).map((c) => c.replace(/^(?:at|@)\s+/, '').trim());

  // Detect quantification
  const quantMatches = resumeText.match(/\d+%|\$\d+|\d+x|\d+k|\d+ (users|customers|engineers|teams)/gi) || [];
  const hasQuantification = quantMatches.length > 0;

  // Detect tech stack / skills
  const techKeywords = ['react', 'node', 'python', 'java', 'aws', 'docker', 'kubernetes', 'sql', 'typescript', 'javascript', 'go', 'rust', 'scala'];
  const detectedTech = techKeywords.filter((t) => lower.includes(t)).slice(0, 8);

  // Page / length estimate
  const estimatedPages = Math.ceil(wordCount / 400);

  // Compute 6-second scan score
  let score = 0;
  let items = [];

  // Name visible at top
  if (nameLine.length > 2 && nameLine.length < 60 && /^[A-Z]/.test(nameLine)) {
    score += 15;
    items.push({ label: 'Name visible at top', pass: true, weight: 'critical' });
  } else {
    items.push({ label: 'Name not immediately visible', pass: false, weight: 'critical', fix: 'Ensure your full name is the first thing on the document.' });
  }

  // Contact info
  if (hasEmail) { score += 12; items.push({ label: 'Email address present', pass: true, weight: 'critical' }); }
  else { items.push({ label: 'Email address missing', pass: false, weight: 'critical', fix: 'Add your professional email near the top.' }); }

  if (hasPhone) { score += 8; items.push({ label: 'Phone number present', pass: true, weight: 'high' }); }
  else { items.push({ label: 'Phone number missing', pass: false, weight: 'high', fix: 'Add a phone number in the contact section.' }); }

  if (hasLinkedIn) { score += 6; items.push({ label: 'LinkedIn profile linked', pass: true, weight: 'medium' }); }
  else { items.push({ label: 'LinkedIn not found', pass: false, weight: 'medium', fix: 'Add your LinkedIn profile URL.' }); }

  if (hasGithub || hasWebsite) { score += 5; items.push({ label: 'Portfolio/GitHub present', pass: true, weight: 'medium' }); }
  else { items.push({ label: 'No portfolio or GitHub', pass: false, weight: 'low', fix: 'Add a GitHub profile or portfolio website.' }); }

  // Sections
  if (detectedSections.includes('experience')) { score += 12; items.push({ label: 'Experience section found', pass: true, weight: 'critical' }); }
  else { items.push({ label: 'No experience section detected', pass: false, weight: 'critical', fix: 'Add a clear "Experience" or "Work Experience" section.' }); }

  if (detectedSections.includes('skills')) { score += 10; items.push({ label: 'Skills section found', pass: true, weight: 'high' }); }
  else { items.push({ label: 'No skills section', pass: false, weight: 'high', fix: 'Add a "Skills" or "Technical Skills" section.' }); }

  if (detectedSections.includes('education')) { score += 8; items.push({ label: 'Education section found', pass: true, weight: 'high' }); }
  else { items.push({ label: 'No education section', pass: false, weight: 'medium', fix: 'Add your education details.' }); }

  // Quantification
  if (hasQuantification) { score += 12; items.push({ label: `${quantMatches.length} quantified achievement${quantMatches.length !== 1 ? 's' : ''} found`, pass: true, weight: 'high' }); }
  else { items.push({ label: 'No quantified achievements', pass: false, weight: 'high', fix: 'Add specific numbers: % improvement, revenue, team size, etc.' }); }

  // Length
  if (estimatedPages === 1) { score += 8; items.push({ label: 'Concise (1 page)', pass: true, weight: 'medium' }); }
  else if (estimatedPages === 2) { score += 6; items.push({ label: 'Standard length (2 pages)', pass: true, weight: 'medium' }); }
  else { score += 2; items.push({ label: `Long resume (~${estimatedPages} pages)`, pass: false, weight: 'low', fix: 'Consider reducing to 1-2 pages for most roles.' }); }

  // Tech stack visible
  if (detectedTech.length > 0) { score += 4; items.push({ label: `${detectedTech.length} technologies visible`, pass: true, weight: 'medium' }); }
  else { items.push({ label: 'No tech stack keywords found', pass: false, weight: 'medium', fix: 'Ensure key technologies are clearly listed.' }); }

  score = Math.min(100, score);

  return {
    score,
    nameLine,
    hasEmail, hasPhone, hasLinkedIn, hasGithub, hasWebsite,
    detectedSections,
    detectedSeniority,
    companiesMentioned,
    quantMatches,
    detectedTech,
    estimatedPages,
    wordCount,
    items,
    verdict: score >= 80 ? 'strong' : score >= 60 ? 'good' : score >= 40 ? 'weak' : 'critical',
    firstImpressionText: score >= 80
      ? 'Strong first impression. The recruiter sees a professional, structured candidate.'
      : score >= 60
      ? 'Decent first impression, but key elements could be more prominent.'
      : score >= 40
      ? 'Weak first impression. Several critical elements are missing or buried.'
      : 'Poor first impression. Critical information is absent or hard to find.'
  };
};

export default function RecruiterView() {
  const { id } = useParams();

  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [scanTimer, setScanTimer] = useState(6);
  const timerRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function fetchResume() {
      try {
        setIsLoading(true);
        const data = await resumeService.getResumeById(id);
        if (mounted) {
          setResume(data.resume);
          // Automatically run local heuristic analysis
          const result = analyzeRecruiterView(data.resume?.parsedText, data.resume?.fileName);
          setAnalysis(result);
        }
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || 'Failed to load resume.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    if (id) fetchResume();
    return () => { mounted = false; };
  }, [id]);

  const startScan = () => {
    setScanning(true);
    setRevealed(false);
    setScanTimer(6);

    let t = 6;
    scanIntervalRef.current = setInterval(() => {
      t -= 1;
      setScanTimer(t);
      if (t <= 0) {
        clearInterval(scanIntervalRef.current);
        setScanning(false);
        setRevealed(true);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading resume...</p>
        </div>
      </div>
    );
  }

  const verdictColors = {
    strong: 'emerald',
    good: 'sky',
    weak: 'amber',
    critical: 'rose'
  };
  const verdictColor = verdictColors[analysis?.verdict] || 'slate';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Link
            to={`/resumes/${id}`}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Resume</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recruiter Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Recruiter 6-Second View
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulate how a recruiter scans your resume in 6 seconds. See exactly what they see — and what they miss.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {!analysis && !isLoading && (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-8 h-8 mx-auto mb-3" />
          <p className="text-sm">No parsed text available. Please ensure this resume was uploaded with readable text.</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* 6-Second Simulation */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 flex flex-col items-center text-center space-y-6 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center">
              <Eye className="w-8 h-8 text-sky-500" />
            </div>

            {!scanning && !revealed && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Simulate the 6-Second Scan</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                    Research shows recruiters spend just 6 seconds on initial resume scan. Start the simulation to see what they focus on.
                  </p>
                </div>
                <button
                  onClick={startScan}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-sky-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Scan className="w-4 h-4" />
                  <span>Start 6-Second Scan</span>
                </button>
              </>
            )}

            {scanning && (
              <>
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                    <circle
                      cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                      strokeDasharray={`${(scanTimer / 6) * 283} 283`}
                      className="text-sky-500 transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">{scanTimer}</span>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">Scanning...</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Recruiter is reviewing your resume right now.</div>
                </div>
              </>
            )}

            {revealed && (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-center gap-2 text-sky-600 dark:text-cyan-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold text-sm">Scan Complete. Here's what the recruiter saw:</span>
                </div>

                {/* What recruiter sees in 6 seconds */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">First thing seen</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{analysis.nameLine || 'Unknown'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Seniority signal</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white capitalize">{analysis.detectedSeniority || 'Not apparent'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Technologies spotted</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{analysis.detectedTech.slice(0, 3).join(', ') || 'None visible'}</div>
                  </div>
                </div>

                <button
                  onClick={startScan}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Simulate Again</span>
                </button>
              </div>
            )}
          </div>

          {/* Score Card */}
          <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            verdictColor === 'emerald' ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50' :
            verdictColor === 'sky' ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/50' :
            verdictColor === 'amber' ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50' :
            'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
          }`}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">6-Second Impression Score</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">{analysis.firstImpressionText}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {analysis.wordCount} words · ~{analysis.estimatedPages} page{analysis.estimatedPages !== 1 ? 's' : ''} · {analysis.detectedSections.length} sections detected
              </div>
            </div>
            <div className="shrink-0 text-center">
              <div className="text-4xl font-bold text-slate-900 dark:text-white font-mono">{analysis.score}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">/ 100</div>
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">Recruiter Scan Checklist</h3>
            <div className="space-y-2.5">
              {analysis.items.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {item.pass
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      : <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                    <div>
                      <div className={`text-xs font-semibold ${item.pass ? 'text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                        {item.label}
                      </div>
                      {!item.pass && item.fix && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.fix}</div>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                    item.weight === 'critical' ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400' :
                    item.weight === 'high' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400' :
                    'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {item.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech and Contacts Quick View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Contact Visibility</h4>
              <div className="space-y-2">
                {[
                  { label: 'Email', has: analysis.hasEmail },
                  { label: 'Phone', has: analysis.hasPhone },
                  { label: 'LinkedIn', has: analysis.hasLinkedIn },
                  { label: 'GitHub / Portfolio', has: analysis.hasGithub || analysis.hasWebsite }
                ].map((c) => (
                  <div key={c.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400">{c.label}</span>
                    {c.has
                      ? <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Present</span>
                      : <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1"><XCircle className="w-3 h-3" />Missing</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Tech Stack Spotted</h4>
              {analysis.detectedTech.length > 0
                ? <div className="flex flex-wrap gap-2">
                    {analysis.detectedTech.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-cyan-400 border border-sky-200 dark:border-sky-900/50 font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                : <p className="text-xs text-slate-400">No common technologies detected in resume text.</p>}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">Want to improve your score?</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Use AI Improvement to fix weak sections and increase your recruiter scan score.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/resumes/${id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs tracking-wide shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Improve with AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
