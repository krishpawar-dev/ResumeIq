const OpenAI = require('openai');

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Resume Truth Detector: Analyzes a resume for:
 * - Overstated claims vs what can be verified
 * - Vague/empty impact language (responsible for, helped with)
 * - Missing quantification
 * - Inconsistencies (timeline gaps, title inflation)
 * - ATS-optimized but hollow bullet points
 * @param {string} resumeText
 * @returns {object} truth detection analysis
 */
const runTruthDetector = async (resumeText) => {
  if (!openaiClient) {
    return runDeterministicTruthDetection(resumeText);
  }

  const systemPrompt = `You are a senior technical recruiter and resume authenticity expert.
Your job is to analyze resumes for credibility, specificity, and potential overstatement.
You identify vague language, unverifiable claims, timeline issues, and hollow bullet points.
You do NOT make accusations — you ask smart questions and flag areas for improvement.
You rate each section and bullet point for authenticity and impact quality.
Always respond with valid JSON matching the exact schema provided.`;

  const userPrompt = `Perform a Resume Truth Detection analysis on this resume text.

RESUME TEXT:
${resumeText.slice(0, 6000)}

Return JSON with exactly this structure:
{
  "overallTrustScore": 72,
  "verdict": "strong|credible|needs_work|concerning",
  "sections": [
    {
      "sectionName": "string",
      "trustScore": 85,
      "issues": [
        {
          "type": "vague_claim|missing_metric|timeline_gap|title_inflation|hollow_bullet|overstatement",
          "original": "string (exact text from resume)",
          "issue": "string (what's wrong)",
          "betterVersion": "string (how to fix it)",
          "severity": "high|medium|low"
        }
      ],
      "strengths": ["string (what's done well in this section)"]
    }
  ],
  "topIssues": [
    {
      "issue": "string",
      "occurrences": 3,
      "impact": "string (why this hurts)",
      "fix": "string"
    }
  ],
  "languageAudit": {
    "vagueVerbs": ["string (e.g. 'helped', 'worked on', 'responsible for')"],
    "strongVerbs": ["string (e.g. 'engineered', 'reduced', 'launched')"],
    "quantifiedClaims": 4,
    "unquantifiedClaims": 12,
    "passiveVoiceInstances": 2
  },
  "timelineAnalysis": {
    "hasGaps": false,
    "gapPeriods": ["string (e.g. 'Jan 2020 - Aug 2020')"],
    "overlapIssues": [],
    "chronologicalConsistency": "consistent|minor_issues|major_issues"
  },
  "recruiterQuestions": [
    "string (questions a recruiter would ask based on vague claims)"
  ],
  "improvementPriority": [
    {
      "action": "string",
      "impact": "high|medium|low",
      "effort": "low|medium|high"
    }
  ]
}`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.35,
      response_format: { type: 'json_object' },
      max_tokens: 3000
    });

    const raw = completion.choices[0]?.message?.content;
    const parsed = JSON.parse(raw);
    return validateTruthResult(parsed);
  } catch (err) {
    console.error('[Truth Detector AI Error]', err.message);
    return runDeterministicTruthDetection(resumeText);
  }
};

const validateTruthResult = (data) => {
  const validVerdicts = ['strong', 'credible', 'needs_work', 'concerning'];

  return {
    overallTrustScore: Math.min(100, Math.max(0, Number(data.overallTrustScore) || 60)),
    verdict: validVerdicts.includes(data.verdict) ? data.verdict : 'needs_work',
    sections: Array.isArray(data.sections) ? data.sections.slice(0, 6).map((s) => ({
      sectionName: s.sectionName || 'Section',
      trustScore: Math.min(100, Math.max(0, Number(s.trustScore) || 60)),
      issues: Array.isArray(s.issues) ? s.issues.slice(0, 5) : [],
      strengths: Array.isArray(s.strengths) ? s.strengths : []
    })) : [],
    topIssues: Array.isArray(data.topIssues) ? data.topIssues.slice(0, 5) : [],
    languageAudit: {
      vagueVerbs: Array.isArray(data.languageAudit?.vagueVerbs) ? data.languageAudit.vagueVerbs : [],
      strongVerbs: Array.isArray(data.languageAudit?.strongVerbs) ? data.languageAudit.strongVerbs : [],
      quantifiedClaims: Number(data.languageAudit?.quantifiedClaims) || 0,
      unquantifiedClaims: Number(data.languageAudit?.unquantifiedClaims) || 0,
      passiveVoiceInstances: Number(data.languageAudit?.passiveVoiceInstances) || 0
    },
    timelineAnalysis: {
      hasGaps: !!data.timelineAnalysis?.hasGaps,
      gapPeriods: Array.isArray(data.timelineAnalysis?.gapPeriods) ? data.timelineAnalysis.gapPeriods : [],
      overlapIssues: Array.isArray(data.timelineAnalysis?.overlapIssues) ? data.timelineAnalysis.overlapIssues : [],
      chronologicalConsistency: data.timelineAnalysis?.chronologicalConsistency || 'consistent'
    },
    recruiterQuestions: Array.isArray(data.recruiterQuestions) ? data.recruiterQuestions.slice(0, 5) : [],
    improvementPriority: Array.isArray(data.improvementPriority) ? data.improvementPriority.slice(0, 6) : []
  };
};

const runDeterministicTruthDetection = (resumeText) => {
  // Vague verb detection
  const vagueVerbPatterns = [
    'responsible for', 'helped with', 'worked on', 'assisted with',
    'involved in', 'contributed to', 'participated in', 'supported',
    'was part of', 'played a role in'
  ];

  const strongVerbPatterns = [
    'engineered', 'built', 'launched', 'deployed', 'optimized', 'reduced',
    'increased', 'designed', 'architected', 'led', 'delivered', 'automated',
    'implemented', 'created', 'developed', 'managed', 'scaled'
  ];

  const lower = resumeText.toLowerCase();
  const foundVague = vagueVerbPatterns.filter((v) => lower.includes(v));
  const foundStrong = strongVerbPatterns.filter((v) => lower.includes(v));

  // Quantification check
  const quantMatches = resumeText.match(/\d+%|\$\d+|\d+x|\d+k|\d+ (users|customers|engineers|teams|projects)/gi) || [];
  const sentences = resumeText.split(/[.\n]/).filter((s) => s.trim().length > 20);
  const unquantified = Math.max(0, sentences.length - quantMatches.length);

  const trustScore = Math.min(95, Math.max(40,
    80 -
    (foundVague.length * 5) +
    (foundStrong.length * 3) +
    (quantMatches.length * 4) -
    (unquantified > 10 ? 10 : 0)
  ));

  const issues = [];
  if (foundVague.length > 0) {
    issues.push({
      issue: 'Vague action verbs detected',
      occurrences: foundVague.length,
      impact: 'Reduces credibility and ATS keyword strength',
      fix: `Replace "${foundVague.slice(0, 2).join('", "')}" with specific action verbs like "engineered", "reduced", "launched"`
    });
  }
  if (quantMatches.length < 3) {
    issues.push({
      issue: 'Low quantification rate',
      occurrences: quantMatches.length,
      impact: 'Recruiters cannot assess actual scope of impact',
      fix: 'Add specific numbers: team size, % improvement, revenue impact, time saved'
    });
  }

  return {
    overallTrustScore: trustScore,
    verdict: trustScore > 75 ? 'credible' : trustScore > 60 ? 'needs_work' : 'concerning',
    sections: [
      {
        sectionName: 'Overall Resume',
        trustScore,
        issues: foundVague.slice(0, 3).map((v) => ({
          type: 'vague_claim',
          original: v,
          issue: `"${v}" is vague and unverifiable`,
          betterVersion: 'Replace with specific action verb + measurable outcome',
          severity: 'medium'
        })),
        strengths: foundStrong.slice(0, 3)
      }
    ],
    topIssues: issues,
    languageAudit: {
      vagueVerbs: foundVague,
      strongVerbs: foundStrong,
      quantifiedClaims: quantMatches.length,
      unquantifiedClaims: Math.min(unquantified, 20),
      passiveVoiceInstances: (resumeText.match(/\bwas\b|\bwere\b|\bbeen\b/gi) || []).length
    },
    timelineAnalysis: {
      hasGaps: false,
      gapPeriods: [],
      overlapIssues: [],
      chronologicalConsistency: 'consistent'
    },
    recruiterQuestions: [
      'What specific metrics demonstrate this impact?',
      'How many people did you directly manage?',
      'What was the scale of the system you built?',
      'Enable AI analysis for deeper question generation'
    ],
    improvementPriority: [
      { action: 'Add 3-5 quantified achievements per role', impact: 'high', effort: 'medium' },
      { action: 'Replace vague verbs with specific action verbs', impact: 'high', effort: 'low' },
      { action: 'Specify team sizes and project scopes', impact: 'medium', effort: 'low' }
    ]
  };
};

module.exports = { runTruthDetector };
