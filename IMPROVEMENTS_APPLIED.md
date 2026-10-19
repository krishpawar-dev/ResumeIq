# ResumeIQ – Intelligence Improvements Applied

## 1. Resume ATS score calibration
- Replaced the old generous heuristic scoring with evidence-based scoring.
- Missing metrics, missing skills, weak structure, incomplete contact details, weak action verbs, and poor length now lower the score.
- Added hard evidence caps so an LLM cannot simply return 80–100 for a weak resume.
- ATS cache key moved from `resume-ats-v1` to `resume-ats-v2` so old inflated cached scores are not reused.

## 2. Strong resume improvement guidance
Every new/re-analyzed resume now receives an `improvementPlan` containing:
- overall assessment
- prioritized actions
- Professional Summary improvement
- Experience improvement
- Projects improvement
- Technical Skills improvement
- why each issue matters
- current evidence
- improved version / structure
- section checklist

The AI prompt explicitly forbids invented employers, technologies, dates, metrics, achievements, or responsibilities.

## 3. Adaptive Interview Prep
Question generation now changes based on:
- Entry / Mid / Senior difficulty
- Technical / Behavioral / HR / Mixed interview type
- Full Stack / Frontend / Backend / Data & Cloud focus
- verified resume technologies and projects
- recent questions already asked to the user

The generator no longer injects fake default technologies such as React or Node.js when they are absent from the resume.

Recent question history is passed to generation to reduce repeated questions across sessions.

## 4. Practice Mode
Practice generation now uses the same adaptive interview engine so Flashcard, Timed, Category, and Company practice sessions vary by difficulty, role, category and resume evidence instead of relying on a small static question pool.

Practice sessions now store difficulty and focus for analytics.

## 5. Interview Analytics
Analytics now includes:
- total questions answered
- completed mock interviews
- average evaluated score
- practice streak
- readiness index
- weakest evaluation criterion and recommended practice
- score trend
- recent mock interview sessions
- answered questions / total questions per recent session
- difficulty, interview type, focus, duration and date for recent sessions
- richer recent practice activity

Frontend analytics response handling was fixed so the actual `/analytics` payload is consumed correctly.

## 6. Job Matching
Job matching is now requirement-driven:
- Required skills have higher weight than preferred skills.
- A missing critical required skill materially reduces the final score.
- One missing critical requirement caps the score at 69.
- Multiple critical missing requirements cap the score at 55.
- Preferred-only gaps have a smaller effect.
- Generic fallback experience/context scores were removed.
- Skill claims from AI are verified against the actual resume before scoring.
- React / React.js / ReactJS and Node / Node.js / NodeJS aliases are handled.
- Job-match cache key moved from `job-match-v1` to `job-match-v2`.

Example: if a job requires React and the resume does not demonstrate React, the system will put React in Missing Skills and the final score cannot remain in the 80+ range just because other keywords match.

## Important
Existing resumes and old job-match records may still contain old stored scores. Re-run analysis/matching to calculate the new scores. New uploads/matches automatically use the new engines.
