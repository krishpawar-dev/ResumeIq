/**
 * Job match scoring is intentionally requirement-driven.
 * A missing core requirement must materially lower the final score.
 */
const MATCH_WEIGHTS = {
  skillAlignment: 0.55,
  relevantExperience: 0.20,
  projectRelevance: 0.15,
  additionalContext: 0.10
};

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(value)));

const SKILL_ALIASES = {
  'react.js': ['react'],
  react: ['react.js', 'reactjs'],
  reactjs: ['react', 'react.js'],
  'node.js': ['node', 'nodejs'],
  node: ['node.js', 'nodejs'],
  nodejs: ['node.js', 'node'],
  'next.js': ['nextjs'],
  nextjs: ['next.js'],
  'rest apis': ['rest api', 'restful api', 'restful'],
  'rest api': ['rest apis', 'restful api', 'restful'],
  mongodb: ['mongo'],
  postgresql: ['postgres', 'postgresql'],
  javascript: ['js'],
  typescript: ['ts'],
  'tailwind css': ['tailwind'],
  'amazon web services': ['aws'],
  'google cloud platform': ['gcp'],
  'microsoft azure': ['azure']
};

const normalizeSkill = (skill = '') => skill.toLowerCase().trim().replace(/[.,]/g, '').replace(/\s+/g, ' ');

const skillPresentInText = (resumeText = '', skill = '') => {
  const text = resumeText.toLowerCase();
  const normalized = normalizeSkill(skill);
  const candidates = [normalized, ...(SKILL_ALIASES[normalized] || [])].map(normalizeSkill);
  return candidates.some((candidate) => {
    const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|[^a-z0-9+#])${escaped}(?:$|[^a-z0-9+#])`, 'i').test(text);
  });
};

/**
 * Calculate a transparent weighted match score.
 * Required skills are weighted more heavily and critical missing skills create a hard cap.
 */
const calculateWeightedMatchScore = ({
  matchedSkills = [],
  missingSkills = [],
  experienceScore = 0,
  projectScore = 0,
  contextScore = 0
}) => {
  let matchedWeighted = 0;
  let totalWeighted = 0;
  let criticalMissing = 0;
  let requiredMissingWeight = 0;
  let preferredMissingWeight = 0;

  for (const skill of matchedSkills) {
    const importance = clamp(skill.importance * 100, 10, 100) / 100;
    const requirementMultiplier = skill.requiredOrPreferred === 'preferred' ? 0.65 : 1;
    const strengthMultiplier = skill.matchStrength === 'strong' ? 1 : skill.matchStrength === 'moderate' ? 0.8 : 0.55;
    const weighted = importance * requirementMultiplier;
    totalWeighted += weighted;
    matchedWeighted += weighted * strengthMultiplier;
  }

  for (const skill of missingSkills) {
    const importance = clamp(skill.importance * 100, 10, 100) / 100;
    const requirementMultiplier = skill.requiredOrPreferred === 'preferred' ? 0.65 : 1;
    const weighted = importance * requirementMultiplier;
    totalWeighted += weighted;

    if (skill.requiredOrPreferred === 'preferred') {
      preferredMissingWeight += weighted;
    } else {
      requiredMissingWeight += weighted;
      if (importance >= 0.85) criticalMissing += 1;
    }
  }

  const skillAlignmentScore = totalWeighted > 0
    ? clamp((matchedWeighted / totalWeighted) * 100)
    : 50;

  const finalExperience = clamp(experienceScore);
  const finalProject = clamp(projectScore);
  const finalContext = clamp(contextScore);

  let final =
    skillAlignmentScore * MATCH_WEIGHTS.skillAlignment +
    finalExperience * MATCH_WEIGHTS.relevantExperience +
    finalProject * MATCH_WEIGHTS.projectRelevance +
    finalContext * MATCH_WEIGHTS.additionalContext;

  // Missing a core requirement is materially different from missing a nice-to-have.
  if (criticalMissing >= 2) final = Math.min(final, 55);
  else if (criticalMissing === 1) final = Math.min(final, 69);
  else if (requiredMissingWeight > 0) final = Math.min(final, 79);

  // A resume cannot be "perfect" while important preferred requirements are absent either.
  if (preferredMissingWeight > 0 && criticalMissing === 0) final = Math.min(final, 92);

  return {
    matchPercent: clamp(final),
    scoreBreakdown: {
      skillAlignment: skillAlignmentScore,
      relevantExperience: finalExperience,
      projectRelevance: finalProject,
      additionalContext: finalContext
    },
    weightsApplied: MATCH_WEIGHTS,
    scoringMeta: {
      criticalMissingSkills: criticalMissing,
      requiredMissingWeight: Math.round(requiredMissingWeight * 100) / 100,
      preferredMissingWeight: Math.round(preferredMissingWeight * 100) / 100
    }
  };
};

module.exports = {
  calculateWeightedMatchScore,
  MATCH_WEIGHTS,
  skillPresentInText,
  normalizeSkill
};
