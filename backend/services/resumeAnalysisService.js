const OpenAI = require('openai');

// ATS scoring is intentionally evidence-based. A polished resume should not automatically
// receive an 80+ score just because it contains common keywords.
const FACTOR_WEIGHTS = {
  keywordDensity: 0.25,
  quantifiableResults: 0.20,
  formatStructure: 0.15,
  actionVerbUsage: 0.15,
  contactInformation: 0.10,
  optimalLength: 0.10,
  skillsSection: 0.05
};

const TECH_DICTIONARY = [
  'javascript', 'typescript', 'react', 'react.js', 'next.js', 'vue', 'angular', 'node',
  'node.js', 'express', 'python', 'java', 'c++', 'c#', 'go', 'php', 'sql', 'postgresql',
  'mysql', 'mongodb', 'redis', 'graphql', 'rest api', 'restful', 'aws', 'azure', 'gcp',
  'docker', 'kubernetes', 'git', 'github', 'gitlab', 'ci/cd', 'jenkins', 'terraform',
  'kafka', 'microservices', 'system design', 'html', 'css', 'tailwind', 'redux', 'jest',
  'cypress', 'playwright', 'linux', 'agile', 'scrum'
];

const STRONG_VERBS = [
  'built', 'developed', 'engineered', 'architected', 'designed', 'implemented', 'deployed',
  'optimized', 'automated', 'streamlined', 'scaled', 'launched', 'delivered', 'migrated',
  'integrated', 'refactored', 'reduced', 'increased', 'improved', 'led', 'owned', 'mentored',
  'orchestrated', 'accelerated', 'created', 'configured', 'debugged', 'tested'
];

const WEAK_PHRASES = [
  'responsible for', 'worked on', 'worked with', 'helped with', 'helped to', 'assisted with',
  'assisted in', 'participated in', 'involved in', 'did', 'made', 'supported', 'handled'
];

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(value)));

const countMatches = (text, regex) => (text.match(regex) || []).length;

const hasSkill = (text, skill) => {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9+#.])${escaped}(?:$|[^a-z0-9+#.])`, 'i').test(text);
};

const extractSections = (text) => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const headings = [
    'summary', 'professional summary', 'executive summary', 'profile', 'objective',
    'experience', 'work experience', 'professional experience', 'employment',
    'projects', 'project experience',
    'skills', 'technical skills', 'technical skills & tools', 'technical competencies', 'technical competencies & skills', 'technologies',
    'education', 'education & certifications', 'certifications', 'achievements'
  ];

  const normalizedHeadings = new Map(headings.map((h) => [h, h]));
  const sections = {};
  let current = 'header';
  sections[current] = [];

  for (const line of lines) {
    const clean = line.toLowerCase().replace(/[:|]+$/g, '').trim();
    const heading = normalizedHeadings.get(clean);
    if (heading) {
      current = heading;
      sections[current] = [];
    } else {
      sections[current] = sections[current] || [];
      sections[current].push(line);
    }
  }

  return Object.fromEntries(Object.entries(sections).map(([key, value]) => [key, value.join(' ')]));
};

const getSection = (sections, aliases) => {
  for (const alias of aliases) {
    if (sections[alias] && sections[alias].trim()) return sections[alias].trim();
  }
  return '';
};

const buildDeterministicImprovementPlan = (text, breakdown) => {
  const sections = extractSections(text);
  const summary = getSection(sections, ['summary', 'professional summary', 'executive summary', 'profile', 'objective']);
  const experience = getSection(sections, ['experience', 'work experience', 'professional experience', 'employment']);
  const projects = getSection(sections, ['projects', 'project experience']);
  const skills = getSection(sections, ['skills', 'technical skills', 'technical skills & tools', 'technical competencies', 'technical competencies & skills', 'technologies']);
  const bullets = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => /^[•*\-]\s+/.test(l)).map((l) => l.replace(/^[•*\-]\s*/, '').trim()).filter((l) => l.length > 25);
  const metricCount = countMatches(text, /(\d+(?:\.\d+)?%|\$\s?\d[\d,.]*|\b\d+(?:\.\d+)?\s?(?:k|m|million|billion|users?|clients?|requests?|ms|seconds?|hours?|days?|months?|years?)\b)/gi);
  const weakCount = WEAK_PHRASES.reduce((sum, phrase) => sum + countMatches(text, new RegExp(`\\b${phrase}\\b`, 'gi')), 0);
  const techList = TECH_DICTIONARY.filter((tech) => hasSkill(text, tech)).slice(0, 6);
  const techCount = techList.length;
  const yearsMatch = text.match(/(\d+)\+?\s*years?(?:\s+of)?(?:\s+professional)?(?:\s+experience)?/i);
  const metricExamples = text.match(/(\d+(?:\.\d+)?%|\$\s?\d[\d,.]*|\b\d+(?:\.\d+)?\s?(?:k|m|million|billion|users?|clients?|requests?|ms|seconds?|hours?|days?|months?|years?)\b)/gi) || [];
  const summaryExample = [
    yearsMatch ? `Professional with ${yearsMatch[1]}+ years of experience` : 'Professional with hands-on engineering experience',
    techList.length ? `working with ${techList.join(', ')}` : 'working across the technologies demonstrated in this resume',
    projects ? `and practical experience demonstrated through ${projects.split(/\s+/).slice(0, 18).join(' ')}` : 'and practical project experience',
    metricExamples.length ? `including measurable outcomes such as ${metricExamples.slice(0, 2).join(' and ')}` : 'with measurable outcomes added where they can be verified'
  ].join('. ') + '.';

  const priorityActions = [];
  if (!summary) priorityActions.push('Add a 3–4 line targeted professional summary that names your target role, strongest verified technologies, domain, and one measurable achievement if available.');
  else if ((breakdown?.keywordDensity?.score || 0) < 70) priorityActions.push('Rewrite the summary around the target role and verified technical keywords instead of generic career statements.');
  if (metricCount < 3) priorityActions.push('Convert responsibility-only bullets into outcome statements and add real, verifiable metrics such as users, latency, revenue, time saved, scale, or delivery volume.');
  if (weakCount > 0) priorityActions.push(`Replace ${weakCount} passive/responsibility phrases with direct action verbs and state the result of the work.`);
  if (!projects) priorityActions.push('Add 2–3 strongest projects with problem, your contribution, technology used, and measurable outcome.');
  else if (projects.length < 350) priorityActions.push('Expand project descriptions so each project explains the problem, architecture/implementation, your individual contribution, and result.');
  if (!skills || techCount < 5) priorityActions.push('Create a clearly labeled Technical Skills section and group verified skills by Languages, Frameworks, Backend, Databases, Cloud, and Tools.');
  if ((breakdown?.formatStructure?.score || 0) < 75) priorityActions.push('Use standard ATS headings, consistent dates, simple bullets, and a single-column reading order.');

  if (priorityActions.length === 0) priorityActions.push('Keep the current structure, but tailor keywords and measurable outcomes to each target job description.');

  const sectionImprovements = [];

  sectionImprovements.push({
    section: 'Professional Summary',
    issue: summary ? 'The summary should communicate role fit and verified value quickly.' : 'No dedicated professional summary was detected.',
    whyItMatters: 'The first few lines determine whether the reader immediately understands your role, stack, and relevance.',
    currentText: summary || 'No summary detected.',
    improvedExample: summary
      ? `Suggested rewrite based only on detected evidence: ${summaryExample}`
      : `Suggested starting summary based only on detected evidence: ${summaryExample}`,
    checklist: ['Target role is explicit', 'Only verified technologies are named', 'Avoids generic objective statements', 'Contains a real result when available']
  });

  sectionImprovements.push({
    section: 'Experience',
    issue: metricCount < 3 ? 'Experience bullets contain too few measurable outcomes.' : weakCount > 0 ? 'Some bullets use responsibility-focused language.' : 'Experience bullets can be made more outcome-focused.',
    whyItMatters: 'Recruiters need to see what changed because of your work, not only what tasks you performed.',
    currentText: experience ? experience.slice(0, 700) : 'No experience section detected.',
    improvedExample: bullets.length > 0
      ? `Use this pattern on your strongest bullet: "${bullets[0].slice(0, 180)}" → Action + technology + problem/context + measurable result. Add only a metric you can verify.`
      : 'Use: "Action verb + what you built/changed + verified technology + business/technical outcome + measurable result."',
    checklist: ['Starts with a strong action verb', 'Names relevant verified technology', 'Explains individual contribution', 'Ends with a measurable outcome where possible']
  });

  sectionImprovements.push({
    section: 'Projects',
    issue: projects ? 'Project detail should make ownership, technical decisions, and outcomes obvious.' : 'No dedicated projects section was detected.',
    whyItMatters: 'Projects are strong evidence of practical ability, especially for early-career candidates.',
    currentText: projects ? projects.slice(0, 700) : 'No projects section detected.',
    improvedExample: 'For every important project use 3–4 bullets: Problem → Architecture/implementation → Your contribution → Result/scale. Mention the exact verified stack used in the project.',
    checklist: ['Problem is clear', 'Architecture/implementation is clear', 'Your contribution is separated from team work', 'Outcome or scale is included when verifiable']
  });

  sectionImprovements.push({
    section: 'Technical Skills',
    issue: skills ? 'Skills should be grouped and prioritized around the roles you are targeting.' : 'A dedicated skills section was not detected.',
    whyItMatters: 'ATS systems and recruiters scan this area quickly for role-specific capabilities.',
    currentText: skills ? skills.slice(0, 700) : 'No skills section detected.',
    improvedExample: 'Languages: [verified]. Frontend: [verified]. Backend: [verified]. Databases: [verified]. Cloud/DevOps: [verified]. Tools: [verified].',
    checklist: ['Only verified skills', 'Grouped by category', 'No skill padding', 'Most relevant skills appear first']
  });

  return {
    overallAssessment: `Resume diagnostic found ${metricCount} measurable result(s), ${techCount} recognized technical skill(s), and ${weakCount} responsibility/passive phrase(s). The highest-impact improvements are listed below.`,
    priorityActions: priorityActions.slice(0, 6),
    sectionImprovements
  };
};

const applyEvidenceCalibration = (breakdown, text, metadata) => {
  const lower = text.toLowerCase();
  const wordCount = metadata?.wordCount || text.split(/\s+/).filter(Boolean).length;
  const metricCount = countMatches(text, /(\d+(?:\.\d+)?%|\$\s?\d[\d,.]*|\b\d+(?:\.\d+)?\s?(?:k|m|million|billion|users?|clients?|requests?|ms|seconds?|hours?|days?|months?|years?)\b)/gi);
  const matchedTech = TECH_DICTIONARY.filter((tech) => hasSkill(text, tech));
  const standardHeaders = ['experience', 'work experience', 'professional experience', 'education', 'education & certifications', 'skills', 'technical skills', 'technical competencies', 'technical competencies & skills', 'projects', 'summary', 'executive summary', 'certifications'];
  const headerCount = standardHeaders.filter((h) => lower.includes(h)).length;
  const email = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const phone = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/.test(text);
  const links = /(linkedin\.com|github\.com|portfolio)/i.test(text);
  const weakCount = WEAK_PHRASES.reduce((sum, phrase) => sum + countMatches(text, new RegExp(`\\b${phrase}\\b`, 'gi')), 0);

  // Hard evidence caps prevent inflated AI scores when critical evidence is absent.
  breakdown.quantifiableResults.score = Math.min(breakdown.quantifiableResults.score, metricCount === 0 ? 18 : metricCount < 3 ? 55 : metricCount < 6 ? 78 : 100);
  breakdown.skillsSection.score = Math.min(breakdown.skillsSection.score, matchedTech.length === 0 ? 20 : matchedTech.length < 3 ? 48 : 100);
  breakdown.formatStructure.score = Math.min(breakdown.formatStructure.score, headerCount < 3 ? 55 : headerCount < 4 ? 72 : 100);
  breakdown.contactInformation.score = Math.min(breakdown.contactInformation.score, email ? 100 : 55);
  if (!phone) breakdown.contactInformation.score = Math.min(breakdown.contactInformation.score, 78);
  if (!links) breakdown.contactInformation.score = Math.min(breakdown.contactInformation.score, 88);
  if (wordCount < 250) breakdown.optimalLength.score = Math.min(breakdown.optimalLength.score, 55);
  if (wordCount > 1100) breakdown.optimalLength.score = Math.min(breakdown.optimalLength.score, 72);
  if (weakCount >= 4) breakdown.actionVerbUsage.score = Math.min(breakdown.actionVerbUsage.score, 60);

  return { metricCount, matchedTech, headerCount, email, phone, links, weakCount };
};

const runDeterministicAnalysis = (text, metadata) => {
  const lowerText = text.toLowerCase();
  const wordCount = metadata?.wordCount || text.split(/\s+/).filter(Boolean).length;
  const sections = extractSections(text);
  const matchedTech = TECH_DICTIONARY.filter((tech) => hasSkill(text, tech));
  const metricMatches = text.match(/(\d+(?:\.\d+)?%|\$\s?\d[\d,.]*|\b\d+(?:\.\d+)?\s?(?:k|m|million|billion|users?|clients?|requests?|ms|seconds?|hours?|days?|months?|years?)\b)/gi) || [];
  const strongVerbMatches = STRONG_VERBS.filter((v) => new RegExp(`\\b${v}\\b`, 'i').test(text));
  const weakCount = WEAK_PHRASES.reduce((sum, phrase) => sum + countMatches(text, new RegExp(`\\b${phrase}\\b`, 'gi')), 0);

  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/.test(text);
  const hasLinks = /(linkedin\.com|github\.com|portfolio)/i.test(text);
  const contactScore = clamp((hasEmail ? 45 : 0) + (hasPhone ? 25 : 0) + (hasLinks ? 30 : 0));

  const formatScore = clamp((Object.keys(sections).filter((k) => k !== 'header').length / 5) * 100);
  const quantScore = clamp(metricMatches.length === 0 ? 10 : metricMatches.length * 14);
  const verbScore = clamp(35 + strongVerbMatches.length * 10 - weakCount * 5);
  const skillScore = matchedTech.length === 0 ? 15 : matchedTech.length < 3 ? 45 : matchedTech.length < 6 ? 72 : 100;
  const keywordScore = clamp(matchedTech.length * 8 + Object.keys(sections).length * 4);
  const lengthScore = wordCount >= 450 && wordCount <= 950 ? 100 : wordCount < 300 ? 45 : wordCount < 450 ? 75 : wordCount <= 1100 ? 88 : 65;

  const scoreBreakdown = {
    keywordDensity: {
      score: keywordScore, weight: FACTOR_WEIGHTS.keywordDensity,
      feedback: matchedTech.length >= 8 ? 'Strong technical vocabulary coverage detected.' : 'Technical and role vocabulary coverage is incomplete.',
      evidence: `Detected ${matchedTech.length} recognizable technical/domain terms.`,
      suggestion: 'Add only verified technologies and role-specific terminology that genuinely appear in your experience or projects.'
    },
    quantifiableResults: {
      score: quantScore, weight: FACTOR_WEIGHTS.quantifiableResults,
      feedback: metricMatches.length >= 6 ? `Strong evidence of measurable outcomes (${metricMatches.length} detected).` : `Only ${metricMatches.length} measurable result(s) detected.`,
      evidence: metricMatches.length ? `Examples: ${metricMatches.slice(0, 4).join(', ')}.` : 'No clear outcome metrics detected.',
      suggestion: 'Turn task statements into outcome statements and add real metrics such as users, latency, revenue, time saved, scale, or volume.'
    },
    formatStructure: {
      score: formatScore, weight: FACTOR_WEIGHTS.formatStructure,
      feedback: 'ATS structure is evaluated from recognizable section hierarchy and reading order.',
      evidence: `Recognized sections: ${Object.keys(sections).filter((k) => k !== 'header').join(', ') || 'none'}.`,
      suggestion: 'Use standard headings such as Summary, Experience, Projects, Skills, and Education in a simple single-column structure.'
    },
    actionVerbUsage: {
      score: verbScore, weight: FACTOR_WEIGHTS.actionVerbUsage,
      feedback: weakCount ? `${weakCount} responsibility/passive phrase(s) were detected.` : 'Experience language contains several direct action verbs.',
      evidence: strongVerbMatches.length ? `Action verbs detected: ${strongVerbMatches.slice(0, 6).join(', ')}.` : 'Few strong action verbs detected.',
      suggestion: 'Start bullets with direct action verbs and finish them with the result or impact of the work.'
    },
    contactInformation: {
      score: contactScore, weight: FACTOR_WEIGHTS.contactInformation,
      feedback: `Contact evidence: email ${hasEmail ? 'present' : 'missing'}, phone ${hasPhone ? 'present' : 'missing'}, professional link ${hasLinks ? 'present' : 'missing'}.`,
      evidence: 'ATS-readable contact details are checked independently from the visual header.',
      suggestion: 'Keep professional email, phone, and at least one professional link in a simple parseable header.'
    },
    optimalLength: {
      score: lengthScore, weight: FACTOR_WEIGHTS.optimalLength,
      feedback: `Resume contains approximately ${wordCount} words.`,
      evidence: `Estimated length: ${wordCount} words.`,
      suggestion: 'Keep content concise while preserving enough detail to demonstrate impact; remove repetition rather than deleting evidence.'
    },
    skillsSection: {
      score: skillScore, weight: FACTOR_WEIGHTS.skillsSection,
      feedback: sections['skills'] || sections['technical skills'] ? `Dedicated skills content detected with ${matchedTech.length} recognized technical terms.` : 'A clearly labeled skills section was not detected.',
      evidence: matchedTech.length ? `Detected skills include: ${matchedTech.slice(0, 8).join(', ')}.` : 'No recognized technical skills detected.',
      suggestion: 'Group verified skills into clear categories and prioritize those relevant to your target role.'
    }
  };

  const evidence = applyEvidenceCalibration(scoreBreakdown, text, metadata);
  return {
    scoreBreakdown,
    improvementPlan: buildDeterministicImprovementPlan(text, scoreBreakdown),
    evidence
  };
};

const runOpenAIAnalysis = async (parsedText, metadata) => {
  const prompt = `You are ResumeIQ's strict ATS evaluator and resume coach.
Analyze the resume using evidence from the supplied text. Do NOT inflate scores. A resume should receive 80+ only when the evidence is genuinely strong across most factors. Missing metrics, missing sections, weak contact details, or generic content must materially lower the score.

Return EXACTLY these 7 factors with score 0-100, plus a detailed improvement plan.
For every factor provide grounded feedback, evidence, and a concrete suggestion.

Factors and weights:
1. keywordDensity 25%
2. quantifiableResults 20%
3. formatStructure 15%
4. actionVerbUsage 15%
5. contactInformation 10%
6. optimalLength 10%
7. skillsSection 5%

Improvement plan requirements:
- overallAssessment: 2-3 specific sentences about the actual resume.
- priorityActions: 4-6 highest-impact actions, ordered by impact.
- sectionImprovements: exactly 4 objects for Professional Summary, Experience, Projects, Technical Skills.
- Each section object must contain: section, issue, whyItMatters, currentText, improvedExample, checklist (3-5 items).
- When rewriting text, NEVER invent employers, technologies, metrics, degrees, dates, users, achievements, or responsibilities. If a metric is missing, use a clear placeholder such as [add verified metric].
- For the summary, provide an actual improved version using only facts present in the resume.
- For projects, provide an actual improved project description when the project details exist; otherwise explain exactly what is missing.

Resume text:
"""
${parsedText.slice(0, 10000)}
"""

Word count: ${metadata?.wordCount || 'unknown'}

Return JSON only:
{
  "keywordDensity": {"score": 0, "feedback": "", "evidence": "", "suggestion": ""},
  "quantifiableResults": {"score": 0, "feedback": "", "evidence": "", "suggestion": ""},
  "formatStructure": {"score": 0, "feedback": "", "evidence": "", "suggestion": ""},
  "actionVerbUsage": {"score": 0, "feedback": "", "evidence": "", "suggestion": ""},
  "contactInformation": {"score": 0, "feedback": "", "evidence": "", "suggestion": ""},
  "optimalLength": {"score": 0, "feedback": "", "evidence": "", "suggestion": ""},
  "skillsSection": {"score": 0, "feedback": "", "evidence": "", "suggestion": ""},
  "improvementPlan": {
    "overallAssessment": "",
    "priorityActions": [],
    "sectionImprovements": []
  }
}`;

  const completion = await openaiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are ResumeIQ strict ATS intelligence. Return valid JSON only.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.15
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty response');
  const raw = JSON.parse(content);

  const scoreBreakdown = {};
  for (const factorKey of Object.keys(FACTOR_WEIGHTS)) {
    const item = raw[factorKey];
    if (!item || typeof item.score !== 'number') throw new Error(`AI response missing ${factorKey}`);
    scoreBreakdown[factorKey] = {
      score: clamp(item.score),
      weight: FACTOR_WEIGHTS[factorKey],
      feedback: String(item.feedback || 'Evidence-based ATS evaluation completed.'),
      evidence: String(item.evidence || ''),
      suggestion: String(item.suggestion || 'Refine this section using verified resume evidence.')
    };
  }

  const deterministicPlan = buildDeterministicImprovementPlan(parsedText, scoreBreakdown);
  const aiPlan = raw.improvementPlan || {};
  const sectionImprovements = Array.isArray(aiPlan.sectionImprovements) && aiPlan.sectionImprovements.length
    ? aiPlan.sectionImprovements.slice(0, 4).map((item) => ({
        section: String(item.section || 'Resume Section'),
        issue: String(item.issue || ''),
        whyItMatters: String(item.whyItMatters || ''),
        currentText: String(item.currentText || ''),
        improvedExample: String(item.improvedExample || ''),
        checklist: Array.isArray(item.checklist) ? item.checklist.map(String).slice(0, 5) : []
      }))
    : deterministicPlan.sectionImprovements;

  return {
    scoreBreakdown,
    improvementPlan: {
      overallAssessment: String(aiPlan.overallAssessment || deterministicPlan.overallAssessment),
      priorityActions: Array.isArray(aiPlan.priorityActions) && aiPlan.priorityActions.length
        ? aiPlan.priorityActions.map(String).slice(0, 6)
        : deterministicPlan.priorityActions,
      sectionImprovements
    }
  };
};

const analyzeResumeATS = async (parsedText, metadata) => {
  const { generateCacheKey, getCache, setCache } = require('./cacheService');
  const cacheKey = generateCacheKey('resume-ats-v2', parsedText, String(metadata?.wordCount || ''));
  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  let scoreBreakdown;
  let improvementPlan;
  let isAIPowered = false;

  if (openaiClient && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-api-key')) {
    try {
      const result = await runOpenAIAnalysis(parsedText, metadata);
      scoreBreakdown = result.scoreBreakdown;
      improvementPlan = result.improvementPlan;
      isAIPowered = true;
    } catch (err) {
      console.warn('[OpenAI Resume Analysis - deterministic fallback]:', err.message);
      const result = runDeterministicAnalysis(parsedText, metadata);
      scoreBreakdown = result.scoreBreakdown;
      improvementPlan = result.improvementPlan;
    }
  } else {
    const result = runDeterministicAnalysis(parsedText, metadata);
    scoreBreakdown = result.scoreBreakdown;
    improvementPlan = result.improvementPlan;
  }

  // Apply the same evidence calibration to AI output so an LLM cannot inflate the score.
  applyEvidenceCalibration(scoreBreakdown, parsedText, metadata);

  let weightedScore = 0;
  for (const [key, weight] of Object.entries(FACTOR_WEIGHTS)) {
    scoreBreakdown[key].weight = weight;
    weightedScore += scoreBreakdown[key].score * weight;
  }

  const finalScore = clamp(weightedScore);
  const result = {
    atsScore: finalScore,
    scoreBreakdown,
    improvementPlan,
    isAIPowered
  };

  await setCache(cacheKey, result, 86400);
  return result;
};

module.exports = {
  analyzeResumeATS,
  FACTOR_WEIGHTS,
  buildDeterministicImprovementPlan,
  runDeterministicAnalysis
};
