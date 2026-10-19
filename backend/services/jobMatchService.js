const OpenAI = require('openai');
const { calculateWeightedMatchScore, skillPresentInText, normalizeSkill } = require('./jobScoringService');

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const extractDemonstratedYears = (resumeText = '') => {
  const explicit = resumeText.match(/(\d+)\+?\s*years?(?:\s+of)?(?:\s+professional)?(?:\s+experience)?/i);
  if (explicit) return Number(explicit[1]);

  const years = [...resumeText.matchAll(/\b(20\d{2})\b/g)].map((m) => Number(m[1]));
  if (years.length < 2) return 0;

  const minYear = Math.min(...years);
  const currentYear = new Date().getFullYear();
  return Math.max(0, Math.min(20, currentYear - minYear));
};

const calculateExperienceScore = (demonstratedYears, requiredYears) => {
  if (!requiredYears) return demonstratedYears > 0 ? 90 : 65;
  if (!demonstratedYears) return 20;
  if (demonstratedYears >= requiredYears) return Math.min(100, 88 + (demonstratedYears - requiredYears) * 4);
  return Math.max(20, 88 - (requiredYears - demonstratedYears) * 18);
};

const calculateProjectScore = (resumeText, jobData, matchedSkills) => {
  const lower = resumeText.toLowerCase();
  const projectEvidence = /(projects?|built|developed|implemented|deployed|launched|architecture|repository|github|application)/i.test(lower);
  const outcomeEvidence = /(\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?\s?(?:users?|clients?|requests?|ms|seconds?|hours?|days?))/i.test(lower);
  const relevantSkillCount = matchedSkills.filter((s) => /technical|tool|domain/i.test(s.category || '')).length;
  const requiredSkillCount = (jobData.extractedSkills || []).filter((s) => s.requiredOrPreferred !== 'preferred').length;

  if (!projectEvidence) return 20;
  if (!requiredSkillCount) return outcomeEvidence ? 80 : 65;
  if (relevantSkillCount >= Math.max(2, Math.ceil(requiredSkillCount * 0.7))) return outcomeEvidence ? 92 : 78;
  if (relevantSkillCount > 0) return outcomeEvidence ? 70 : 55;
  return 30;
};

const calculateContextScore = (resumeText, jobData) => {
  const lower = resumeText.toLowerCase();
  let score = 45;
  if (/(bachelor|master|degree|computer science|information technology|engineering)/i.test(lower)) score += 25;
  if (/(agile|scrum|team|collaborat|leadership|communication)/i.test(lower)) score += 10;
  if (jobData.educationRequired && /(bachelor|master|degree)/i.test(jobData.educationRequired) && !/(bachelor|master|degree)/i.test(lower)) score -= 20;
  return Math.max(0, Math.min(100, score));
};

const buildSkillComparison = (resumeText, extractedSkills = []) => {
  const matchedSkills = [];
  const missingSkills = [];

  const seen = new Set();
  for (const skill of extractedSkills) {
    const normalizedName = normalizeSkill(skill.name);
    const canonical = normalizedName === 'reactjs' ? 'react' : normalizedName === 'nodejs' ? 'node' : normalizedName;
    if (seen.has(canonical)) continue;
    seen.add(canonical);

    const present = skillPresentInText(resumeText, skill.name);
    if (present) {
      const sentences = resumeText.split(/(?<=[.!?\n])\s+/).filter(Boolean);
      const evidence = sentences.find((sentence) => skillPresentInText(sentence, skill.name)) || `The resume explicitly references ${skill.name}.`;
      matchedSkills.push({
        name: skill.name,
        importance: skill.importance,
        requiredOrPreferred: skill.requiredOrPreferred || 'required',
        evidence: evidence.replace(/[\r\n]+/g, ' ').trim().slice(0, 220),
        matchStrength: 'strong',
        category: skill.category || 'technical'
      });
    } else {
      missingSkills.push({
        name: skill.name,
        importance: skill.importance,
        requiredOrPreferred: skill.requiredOrPreferred || 'required',
        reason: skill.requiredOrPreferred === 'preferred'
          ? 'Preferred requirement is not clearly demonstrated in the current resume.'
          : 'Required capability is not clearly demonstrated in the current resume.',
        category: skill.category || 'technical'
      });
    }
  }

  return { matchedSkills, missingSkills };
};

const buildTailoringSuggestions = (matchedSkills, missingSkills, jobData) => {
  const suggestions = [];
  const criticalMissing = missingSkills.filter((s) => s.requiredOrPreferred !== 'preferred').sort((a, b) => b.importance - a.importance);

  if (criticalMissing.length) {
    suggestions.push({
      suggestion: `If you genuinely have experience with ${criticalMissing.slice(0, 3).map((s) => s.name).join(', ')}, add that evidence to the relevant Skills, Experience, or Projects section. Do not add a skill you cannot support.`,
      priority: 'High Priority',
      reason: 'These requirements are currently missing from the resume and directly reduce the role match.',
      section: 'Skills & Experience'
    });
  }

  if (matchedSkills.length) {
    suggestions.push({
      suggestion: `Move your strongest evidence for ${matchedSkills.slice(0, 3).map((s) => s.name).join(', ')} into prominent experience/project bullets and include outcomes where verifiable.`,
      priority: 'Recommended',
      reason: 'Matched capabilities are more convincing when supported by concrete work rather than only a skills list.',
      section: 'Experience & Projects'
    });
  }

  suggestions.push({
    suggestion: `Tailor the resume to the ${jobData.title} responsibilities by mirroring relevant terminology from the job description only when it accurately describes your experience.`,
    priority: 'Recommended',
    reason: 'Role-specific language improves clarity without encouraging keyword stuffing.',
    section: 'Summary & Experience'
  });

  return suggestions.slice(0, 4);
};

const runDeterministicMatch = (resumeText, jobData) => {
  const { matchedSkills, missingSkills } = buildSkillComparison(resumeText, jobData.extractedSkills || []);
  const demonstratedYears = extractDemonstratedYears(resumeText);
  const requiredYears = jobData.experienceRequired?.minYears || 0;
  const experienceScore = calculateExperienceScore(demonstratedYears, requiredYears);
  const projectScore = calculateProjectScore(resumeText, jobData, matchedSkills);
  const contextScore = calculateContextScore(resumeText, jobData);

  const scoring = calculateWeightedMatchScore({
    matchedSkills,
    missingSkills,
    experienceScore,
    projectScore,
    contextScore
  });

  const criticalMissing = missingSkills.filter((s) => s.requiredOrPreferred !== 'preferred');
  const matchSummary = criticalMissing.length
    ? `${criticalMissing.length} required job requirement(s) are not clearly demonstrated in this resume. The score is reduced specifically for those gaps rather than treating keyword overlap as a complete match.`
    : matchedSkills.length
      ? `The resume demonstrates ${matchedSkills.length} of ${jobData.extractedSkills?.length || matchedSkills.length} extracted job requirements, with experience and project evidence contributing to the final score.`
      : 'The job requirements could not be matched to clear evidence in the current resume.';

  return {
    matchPercent: scoring.matchPercent,
    scoreBreakdown: scoring.scoreBreakdown,
    weightsApplied: scoring.weightsApplied,
    matchedSkills,
    missingSkills,
    tailoringSuggestions: buildTailoringSuggestions(matchedSkills, missingSkills, jobData),
    matchSummary,
    experienceEvaluation: {
      requiredYears,
      demonstratedYears,
      assessment: requiredYears
        ? demonstratedYears >= requiredYears
          ? `Resume evidence indicates approximately ${demonstratedYears} year(s), meeting the ${requiredYears}+ year requirement.`
          : `Resume evidence indicates approximately ${demonstratedYears} year(s), below the ${requiredYears}+ year requirement.`
        : 'No explicit minimum experience requirement was detected in the job description.'
    },
    projectRelevanceEvaluation: {
      score: projectScore,
      summary: projectScore >= 80
        ? 'Projects contain relevant technical evidence for the extracted role requirements.'
        : 'Project evidence is limited or only partially overlaps with the extracted role requirements.'
    }
  };
};

const runOpenAIMatch = async (resumeText, jobData) => {
  const prompt = `Compare the resume with this job description using strict evidence.

Job: ${jobData.title}
Requirements: ${JSON.stringify(jobData.extractedSkills, null, 2)}
Experience required: ${jobData.experienceRequired?.minYears || 0} years

Resume:
"""
${resumeText.slice(0, 8000)}
"""

Rules:
1. A skill is matched ONLY if the resume clearly demonstrates it. Do not infer React from "frontend" or AWS from "cloud".
2. If a required skill is absent, put it in missingSkills even if it would make the candidate look stronger.
3. Preserve required/preferred status and importance from the job requirements.
4. Do not invent metrics, years, employers, technologies, projects, or responsibilities.
5. experienceScore, projectScore and contextScore must be evidence-based, not generic defaults.
6. Give 3-4 actionable tailoring suggestions.

Return JSON only with matchedSkills, missingSkills, experienceScore, projectScore, contextScore, demonstratedYears, tailoringSuggestions and matchSummary.`;

  const completion = await openaiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are ResumeIQ strict job-match intelligence. Return JSON only.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.15
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');

  // Validate AI skill claims against the actual resume and job requirements.
  const deterministicSkills = buildSkillComparison(resumeText, jobData.extractedSkills || []);
  const matchedSkills = deterministicSkills.matchedSkills.map((skill) => {
    const aiMatch = Array.isArray(parsed.matchedSkills)
      ? parsed.matchedSkills.find((s) => String(s.name || '').toLowerCase() === skill.name.toLowerCase())
      : null;
    return {
      ...skill,
      evidence: aiMatch?.evidence ? String(aiMatch.evidence) : skill.evidence,
      matchStrength: ['strong', 'moderate', 'partial'].includes(aiMatch?.matchStrength) ? aiMatch.matchStrength : 'strong'
    };
  });

  const missingSkills = deterministicSkills.missingSkills;
  const demonstratedYears = typeof parsed.demonstratedYears === 'number' ? Math.max(0, Math.min(30, parsed.demonstratedYears)) : extractDemonstratedYears(resumeText);
  const requiredYears = jobData.experienceRequired?.minYears || 0;
  const experienceScore = typeof parsed.experienceScore === 'number'
    ? Math.max(0, Math.min(100, parsed.experienceScore))
    : calculateExperienceScore(demonstratedYears, requiredYears);
  const projectScore = typeof parsed.projectScore === 'number'
    ? Math.max(0, Math.min(100, parsed.projectScore))
    : calculateProjectScore(resumeText, jobData, matchedSkills);
  const contextScore = typeof parsed.contextScore === 'number'
    ? Math.max(0, Math.min(100, parsed.contextScore))
    : calculateContextScore(resumeText, jobData);

  const scoring = calculateWeightedMatchScore({
    matchedSkills,
    missingSkills,
    experienceScore,
    projectScore,
    contextScore
  });

  const aiSuggestions = Array.isArray(parsed.tailoringSuggestions)
    ? parsed.tailoringSuggestions.map((t) => ({
        suggestion: String(t.suggestion || '').trim(),
        priority: ['High Priority', 'Recommended', 'Optional'].includes(t.priority) ? t.priority : 'Recommended',
        reason: String(t.reason || '').trim(),
        section: String(t.section || 'Experience').trim()
      })).filter((t) => t.suggestion)
    : [];

  return {
    matchPercent: scoring.matchPercent,
    scoreBreakdown: scoring.scoreBreakdown,
    weightsApplied: scoring.weightsApplied,
    matchedSkills,
    missingSkills,
    tailoringSuggestions: aiSuggestions.length ? aiSuggestions.slice(0, 4) : buildTailoringSuggestions(matchedSkills, missingSkills, jobData),
    matchSummary: String(parsed.matchSummary || 'Match calculated from verified resume evidence and job requirements.'),
    experienceEvaluation: {
      requiredYears,
      demonstratedYears,
      assessment: demonstratedYears >= requiredYears
        ? `Resume evidence indicates approximately ${demonstratedYears} year(s), meeting the ${requiredYears}+ year requirement.`
        : `Resume evidence indicates approximately ${demonstratedYears} year(s), below the ${requiredYears}+ year requirement.`
    },
    projectRelevanceEvaluation: {
      score: scoring.scoreBreakdown.projectRelevance,
      summary: 'Project relevance was checked against the extracted job requirements and resume evidence.'
    }
  };
};

const { generateCacheKey, getCache, setCache } = require('./cacheService');

const compareResumeAndJob = async (resumeText, jobData) => {
  const cacheKey = generateCacheKey('job-match-v2', resumeText, JSON.stringify(jobData?.extractedSkills || []), String(jobData?.experienceRequired?.minYears || 0));
  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  let result;
  if (openaiClient && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-api-key')) {
    try {
      result = await runOpenAIMatch(resumeText, jobData);
    } catch (err) {
      console.warn('[OpenAI Job Match - deterministic fallback]:', err.message);
      result = runDeterministicMatch(resumeText, jobData);
    }
  } else {
    result = runDeterministicMatch(resumeText, jobData);
  }

  await setCache(cacheKey, result, 86400);
  return result;
};

module.exports = {
  compareResumeAndJob,
  runDeterministicMatch
};
