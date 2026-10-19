import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Target,
  Sparkles,
  Mic,
  Compass,
  Zap,
  CheckCircle2,
  Sun,
  Moon,
  ChevronRight,
  BarChart3,
  BrainCircuit,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
  {
    step: '01',
    title: 'Resume Diagnostic',
    icon: FileCheck2,
    description:
      'Analyze structure, keywords, impact, and ATS compatibility with a multi-layer resume intelligence engine.',
  },
  {
    step: '02',
    title: 'Job Match Calibration',
    icon: Target,
    description:
      'Compare your experience against target roles and surface the competencies that matter most.',
  },
  {
    step: '03',
    title: 'Skill Gap Intelligence',
    icon: BrainCircuit,
    description:
      'Identify technical and behavioral gaps so you know exactly what to strengthen before applying.',
  },
  {
    step: '04',
    title: 'Interactive Mock Interview',
    icon: Mic,
    description:
      'Practice realistic technical and behavioral interviews calibrated to your resume and target role.',
  },
  {
    step: '05',
    title: 'Performance Diagnostics',
    icon: BarChart3,
    description:
      'Track communication, structure, confidence, and domain performance with actionable feedback.',
  },
  {
    step: '06',
    title: 'Career GPS Roadmap',
    icon: Compass,
    description:
      'Turn insights into a personalized progression plan with focused skills, projects, and milestones.',
  },
];

const TRUST_POINTS = [
  '42-Point ATS Diagnostic',
  'Market-Calibrated Role Matching',
  'End-to-End Interview Readiness',
];

function PrimaryButton({ children = "Let's See Project", onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        group inline-flex items-center justify-center gap-2
        rounded-xl px-6 py-3.5
        bg-slate-950 dark:bg-white
        text-white dark:text-slate-950
        text-sm font-semibold
        shadow-[0_12px_35px_rgba(15,23,42,0.18)]
        dark:shadow-[0_12px_35px_rgba(255,255,255,0.08)]
        transition-all duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_18px_45px_rgba(15,23,42,0.25)]
        dark:hover:shadow-[0_18px_45px_rgba(255,255,255,0.12)]
        active:translate-y-0
        focus:outline-none focus:ring-2
        focus:ring-sky-500 focus:ring-offset-2
        dark:focus:ring-offset-slate-950
      "
    >
      <span>{children}</span>

      <ArrowRight
        className="
          h-4 w-4
          transition-transform duration-300
          group-hover:translate-x-1
        "
      />
    </button>
  );
}

function FeatureCard({ feature }) {
  const Icon = feature.icon;

  return (
    <article
      className="
        group relative overflow-hidden
        rounded-2xl
        border border-slate-200/80
        dark:border-white/[0.08]
        bg-white/80
        dark:bg-white/[0.025]
        backdrop-blur-xl
        p-6
        transition-all duration-500
        hover:-translate-y-1
        hover:border-sky-300/70
        dark:hover:border-cyan-400/20
        hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)]
        dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]
      "
    >
      {/* Ambient hover glow */}
      <div
        className="
          absolute -right-20 -top-20
          h-40 w-40 rounded-full
          bg-sky-500/10 dark:bg-cyan-400/10
          blur-3xl
          opacity-0
          transition-opacity duration-500
          group-hover:opacity-100
        "
      />

      <div className="relative">
        <div className="mb-8 flex items-center justify-between">
          <div
            className="
              flex h-11 w-11 items-center justify-center
              rounded-xl
              border border-sky-200/70
              bg-sky-50
              text-sky-600
              shadow-sm
              dark:border-cyan-400/10
              dark:bg-cyan-400/[0.07]
              dark:text-cyan-300
              transition-transform duration-300
              group-hover:scale-105
            "
          >
            <Icon className="h-5 w-5" />
          </div>

          <span
            className="
              font-mono text-[10px] font-semibold
              tracking-[0.18em]
              text-slate-400
              dark:text-slate-600
            "
          >
            PHASE {feature.step}
          </span>
        </div>

        <h3
          className="
            mb-3 text-lg font-semibold tracking-tight
            text-slate-900
            dark:text-white
          "
        >
          {feature.title}
        </h3>

        <p
          className="
            text-sm leading-6
            text-slate-500
            dark:text-slate-400
          "
        >
          {feature.description}
        </p>

        <div
          className="
            mt-6 flex items-center gap-1
            text-xs font-semibold
            text-sky-600
            dark:text-cyan-300
            opacity-0
            -translate-x-2
            transition-all duration-300
            group-hover:translate-x-0
            group-hover:opacity-100
          "
        >
          Explore intelligence
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div
      className="
        min-h-screen overflow-x-hidden
        bg-[#f8fafc]
        text-slate-900
        selection:bg-sky-500
        selection:text-white
        dark:bg-[#070a11]
        dark:text-slate-100
      "
    >
      {/* =========================================================
          BACKGROUND SYSTEM
      ========================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="
            absolute left-1/2 top-[-20rem]
            h-[45rem] w-[45rem]
            -translate-x-1/2
            rounded-full
            bg-sky-400/[0.08]
            blur-[120px]
            dark:bg-cyan-400/[0.06]
          "
        />

        <div
          className="
            absolute right-[-15rem] top-[30rem]
            h-[30rem] w-[30rem]
            rounded-full
            bg-indigo-400/[0.05]
            blur-[120px]
            dark:bg-indigo-500/[0.05]
          "
        />
      </div>

      {/* =========================================================
          NAVIGATION
      ========================================================== */}
      <header
        className="
          sticky top-0 z-50
          border-b border-slate-200/70
          bg-white/75
          backdrop-blur-2xl
          dark:border-white/[0.06]
          dark:bg-[#070a11]/75
        "
      >
        <div
          className="
            mx-auto flex h-[72px] max-w-7xl
            items-center justify-between
            px-5 sm:px-8
          "
        >
          {/* Brand */}
          <Link
            to="/"
            className="group flex items-center gap-3"
            aria-label="ResumeIQ home"
          >
            <div
              className="
                relative flex h-9 w-9 items-center justify-center
                overflow-hidden rounded-xl
                bg-gradient-to-br
                from-slate-950 via-slate-800 to-slate-950
                text-sm font-bold text-white
                shadow-lg shadow-slate-900/10
                dark:from-white dark:via-slate-100 dark:to-slate-300
                dark:text-slate-950
                transition-transform duration-300
                group-hover:scale-105
              "
            >
              <span className="relative z-10">IQ</span>

              <div
                className="
                  absolute inset-0
                  bg-gradient-to-tr
                  from-sky-500/40 to-transparent
                  opacity-0
                  transition-opacity
                  group-hover:opacity-100
                "
              />
            </div>

            <div className="flex items-center gap-2">
              <span
                className="
                  text-lg font-bold tracking-tight
                  text-slate-950
                  dark:text-white
                "
              >
                Resume<span className="text-sky-500 dark:text-cyan-400">IQ</span>
              </span>

              <span
                className="
                  hidden rounded-full
                  border border-slate-200
                  bg-slate-50
                  px-2 py-0.5
                  font-mono text-[9px]
                  font-medium uppercase
                  tracking-wider
                  text-slate-500
                  sm:inline-flex
                  dark:border-white/[0.08]
                  dark:bg-white/[0.04]
                  dark:text-slate-500
                "
              >
                Career Intelligence
              </span>
            </div>
          </Link>

          {/* Navigation actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="
                flex h-9 w-9 items-center justify-center
                rounded-lg
                text-slate-500
                transition-all duration-200
                hover:bg-slate-100
                hover:text-slate-950
                dark:text-slate-400
                dark:hover:bg-white/[0.06]
                dark:hover:text-white
              "
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <Link
              to="/login"
              className="
                hidden px-2 py-2
                text-sm font-medium
                text-slate-600
                transition-colors
                hover:text-slate-950
                sm:block
                dark:text-slate-400
                dark:hover:text-white
              "
            >
              Sign In
            </Link>

            <button
              onClick={() => navigate('/login')}
              className="
                inline-flex items-center gap-2
                rounded-lg
                border border-slate-200
                bg-white
                px-4 py-2.5
                text-xs font-semibold
                text-slate-900
                shadow-sm
                transition-all duration-300
                hover:-translate-y-0.5
                hover:border-slate-300
                hover:shadow-md
                dark:border-white/[0.1]
                dark:bg-white/[0.06]
                dark:text-white
                dark:hover:bg-white/[0.1]
              "
            >
              <span>View Platform</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================== */}
      <main>
        <section
          className="
            relative
            border-b border-slate-200/70
            px-5 pb-20 pt-20
            sm:px-8 sm:pb-28 sm:pt-28
            dark:border-white/[0.06]
          "
        >
          <div className="mx-auto max-w-6xl text-center">
            {/* Eyebrow */}
            <div
              className="
                mb-8 inline-flex items-center gap-2
                rounded-full
                border border-sky-200/80
                bg-sky-50/80
                px-3.5 py-1.5
                text-[11px] font-semibold
                tracking-wide
                text-sky-700
                shadow-sm
                dark:border-cyan-400/10
                dark:bg-cyan-400/[0.06]
                dark:text-cyan-300
              "
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Career intelligence, engineered for your next move.</span>
            </div>

            {/* Heading */}
            <h1
              className="
                mx-auto max-w-5xl
                text-4xl font-semibold
                leading-[1.05]
                tracking-[-0.04em]
                text-slate-950
                sm:text-6xl
                lg:text-7xl
                dark:text-white
              "
            >
              Your career deserves
              <br className="hidden sm:block" />

              <span
                className="
                  bg-gradient-to-r
                  from-slate-950
                  via-sky-700
                  to-cyan-500
                  bg-clip-text
                  text-transparent
                  dark:from-white
                  dark:via-cyan-200
                  dark:to-sky-400
                "
              >
                intelligent direction.
              </span>
            </h1>

            {/* Description */}
            <p
              className="
                mx-auto mt-7 max-w-2xl
                text-base leading-7
                text-slate-500
                sm:text-lg
                dark:text-slate-400
              "
            >
              ResumeIQ connects resume intelligence, role matching, skill-gap
              analysis, interview practice, and career planning into one
              focused professional workspace.
            </p>

            {/* Actions */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryButton onClick={() => navigate('/login')}>
                Explore ResumeIQ
              </PrimaryButton>

              <Link
                to="/register"
                className="
                  inline-flex items-center justify-center
                  rounded-xl
                  border border-slate-200
                  bg-white/80
                  px-6 py-3.5
                  text-sm font-semibold
                  text-slate-700
                  backdrop-blur
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:border-slate-300
                  hover:bg-white
                  dark:border-white/[0.08]
                  dark:bg-white/[0.03]
                  dark:text-slate-200
                  dark:hover:bg-white/[0.06]
                "
              >
                Create Free Account
              </Link>
            </div>

            {/* Trust indicators */}
            <div
              className="
                mt-10 flex flex-wrap
                items-center justify-center
                gap-x-6 gap-y-3
                text-[11px] font-medium
                text-slate-500
                dark:text-slate-500
              "
            >
              {TRUST_POINTS.map((point) => (
                <span key={point} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {point}
                </span>
              ))}
            </div>

            {/* Hero product panel */}
            <div
              className="
                relative mx-auto mt-16 max-w-5xl
                overflow-hidden rounded-3xl
                border border-slate-200/80
                bg-white/70
                p-2
                shadow-[0_30px_100px_rgba(15,23,42,0.10)]
                backdrop-blur-xl
                dark:border-white/[0.08]
                dark:bg-white/[0.025]
                dark:shadow-[0_30px_100px_rgba(0,0,0,0.35)]
              "
            >
              <div
                className="
                  overflow-hidden rounded-[22px]
                  border border-slate-200/70
                  bg-slate-50
                  dark:border-white/[0.06]
                  dark:bg-[#0b1019]
                "
              >
                {/* Mock application top bar */}
                <div
                  className="
                    flex h-12 items-center
                    justify-between
                    border-b border-slate-200/70
                    px-4
                    dark:border-white/[0.06]
                  "
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400/70" />
                    <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                  </div>

                  <div
                    className="
                      hidden h-6 w-40 rounded-md
                      bg-slate-200/70
                      sm:block
                      dark:bg-white/[0.05]
                    "
                  />

                  <div className="h-6 w-6 rounded-md bg-slate-200/70 dark:bg-white/[0.05]" />
                </div>

                {/* Mock dashboard */}
                <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
                  <div
                    className="
                      rounded-2xl
                      border border-slate-200/70
                      bg-white
                      p-5
                      text-left
                      dark:border-white/[0.06]
                      dark:bg-white/[0.025]
                    "
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                        Resume Score
                      </span>
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </div>

                    <div className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                      87<span className="text-sm text-slate-400">/100</span>
                    </div>

                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                      <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" />
                    </div>
                  </div>

                  <div
                    className="
                      rounded-2xl
                      border border-slate-200/70
                      bg-white
                      p-5
                      text-left
                      dark:border-white/[0.06]
                      dark:bg-white/[0.025]
                    "
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                        Role Match
                      </span>
                      <Target className="h-4 w-4 text-sky-500" />
                    </div>

                    <div className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                      92<span className="text-sm text-slate-400">%</span>
                    </div>

                    <div className="mt-4 flex gap-1">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <span
                          key={item}
                          className={`h-1.5 flex-1 rounded-full ${item <= 4
                            ? 'bg-sky-500'
                            : 'bg-slate-100 dark:bg-white/[0.06]'
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div
                    className="
                      rounded-2xl
                      border border-slate-200/70
                      bg-white
                      p-5
                      text-left
                      dark:border-white/[0.06]
                      dark:bg-white/[0.025]
                    "
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                        Skill Coverage
                      </span>
                      <Zap className="h-4 w-4 text-amber-500" />
                    </div>

                    <div className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                      76<span className="text-sm text-slate-400">%</span>
                    </div>

                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                      <div className="h-full w-[76%] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            INTELLIGENCE CONTINUUM
        ======================================================== */}
        <section className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <div
                className="
                  mb-4 inline-flex items-center gap-2
                  text-[11px] font-semibold
                  uppercase tracking-[0.18em]
                  text-sky-600
                  dark:text-cyan-400
                "
              >
                <span className="h-px w-5 bg-sky-500/40" />
                <Zap className="h-3.5 w-3.5" />
                Intelligence Continuum
                <span className="h-px w-5 bg-sky-500/40" />
              </div>

              <h2
                className="
                  text-3xl font-semibold
                  tracking-[-0.03em]
                  text-slate-950
                  sm:text-4xl
                  dark:text-white
                "
              >
                One career system.
                <br />
                <span className="text-slate-400 dark:text-slate-500">
                  Six intelligent layers.
                </span>
              </h2>

              <p
                className="
                  mt-5 text-sm leading-6
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Every insight feeds the next decision, creating a continuous
                intelligence loop from your resume to your next career move.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.step} feature={feature} />
              ))}
            </div>

            {/* Premium CTA */}
            <div
              className="
                relative mt-20 overflow-hidden
                rounded-3xl
                border border-slate-200/80
                bg-slate-950
                px-6 py-12
                text-center
                shadow-[0_30px_80px_rgba(15,23,42,0.15)]
                sm:px-12
                dark:border-white/[0.08]
                dark:bg-white/[0.035]
                dark:shadow-none
              "
            >
              <div
                className="
                  absolute left-1/2 top-0
                  h-64 w-64
                  -translate-x-1/2
                  rounded-full
                  bg-cyan-400/10
                  blur-[100px]
                "
              />

              <div className="relative">
                <div
                  className="
                    mx-auto mb-5 flex h-11 w-11
                    items-center justify-center
                    rounded-xl
                    border border-white/10
                    bg-white/[0.06]
                    text-cyan-300
                  "
                >
                  <Sparkles className="h-5 w-5" />
                </div>

                <h3
                  className="
                    text-2xl font-semibold
                    tracking-tight text-white
                    sm:text-3xl
                  "
                >
                  Build your next career move with clarity.
                </h3>

                <p
                  className="
                    mx-auto mt-4 max-w-xl
                    text-sm leading-6
                    text-slate-400
                  "
                >
                  Step into the ResumeIQ platform and turn scattered career
                  information into a focused, actionable intelligence system.
                </p>

                <div className="mt-8">
                  <button
                    onClick={() => navigate('/login')}
                    className="
                      group inline-flex items-center gap-2
                      rounded-xl
                      bg-white
                      px-6 py-3.5
                      text-sm font-semibold
                      text-slate-950
                      transition-all duration-300
                      hover:-translate-y-0.5
                      hover:bg-cyan-50
                      hover:shadow-xl
                    "
                  >
                    Enter ResumeIQ
                    <ArrowRight
                      className="
                        h-4 w-4
                        transition-transform
                        group-hover:translate-x-1
                      "
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer
        className="
          border-t border-slate-200/70
          px-5 py-8
          dark:border-white/[0.06]
        "
      >
        <div
          className="
            mx-auto flex max-w-7xl
            flex-col items-center
            justify-between gap-4
            text-xs
            text-slate-400
            sm:flex-row
          "
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              ResumeIQ
            </span>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <span>AI-Powered Career Intelligence</span>
          </div>

          <span>
            © {new Date().getFullYear()} ResumeIQ. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
