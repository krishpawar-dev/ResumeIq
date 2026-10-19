const OpenAI = require('openai');

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Job X-Ray: Deep structural analysis of a job description.
 * Reveals what the job is actually looking for vs what it says.
 * @param {string} jobDescriptionText
 * @param {string} resumeText
 * @returns {object} xray analysis
 */
const runJobXRay = async (jobDescriptionText, resumeText) => {
  if (!openaiClient) {
    return runDeterministicXRay(jobDescriptionText, resumeText);
  }

  const systemPrompt = `You are an expert job description analyst and recruiter intelligence system.
Your job is to perform a deep X-Ray analysis on a job description, revealing the hidden structure,
unspoken priorities, cultural signals, and realistic expectations behind the official text.
You compare this against a candidate's resume to give them insider intelligence.
Always respond with valid JSON matching the exact schema provided.`;

  const userPrompt = `Perform a deep Job X-Ray analysis on this job description.

JOB DESCRIPTION:
${jobDescriptionText.slice(0, 6000)}

CANDIDATE RESUME (for comparison):
${resumeText.slice(0, 4000)}

Return a JSON object with this exact structure:
{
  "realPriorities": [
    {
      "priority": "string (the actual priority)",
      "evidence": "string (quote or paraphrase from JD showing this)",
      "likelyWeight": "high|medium|low",
      "candidateStatus": "strong|partial|gap"
    }
  ],
  "unspokenRequirements": [
    {
      "requirement": "string",
      "signal": "string (what in the JD signals this)",
      "candidateHasIt": true
    }
  ],
  "redFlags": [
    {
      "flag": "string (warning about this role/company)",
      "reason": "string",
      "severity": "high|medium|low"
    }
  ],
  "greenFlags": [
    {
      "flag": "string (positive signal about this role/company)",
      "reason": "string"
    }
  ],
  "salarySignals": {
    "estimatedRange": "string (e.g. $120k-$160k)",
    "signals": ["string"],
    "confidence": "high|medium|low"
  },
  "teamCultureDNA": {
    "workStyle": "string (remote-first|hybrid|office)",
    "pace": "string (startup-pace|structured|balanced)",
    "collaboration": "string",
    "keyTraits": ["string"]
  },
  "hiringUrgency": {
    "level": "high|medium|low",
    "signals": ["string"]
  },
  "candidatePositioning": {
    "overallFit": "strong|moderate|stretch",
    "topStrengths": ["string"],
    "criticalGaps": ["string"],
    "pitchAngle": "string (how this candidate should position themselves)"
  },
  "interviewForecast": {
    "likelyRounds": 3,
    "expectedFocus": ["string"],
    "trickyQuestions": ["string"]
  }
}`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
      max_tokens: 2800
    });

    const raw = completion.choices[0]?.message?.content;
    const parsed = JSON.parse(raw);
    return validateXRayResult(parsed);
  } catch (err) {
    console.error('[Job X-Ray AI Error]', err.message);
    return runDeterministicXRay(jobDescriptionText, resumeText);
  }
};

const validateXRayResult = (data) => {
  return {
    realPriorities: Array.isArray(data.realPriorities) ? data.realPriorities.slice(0, 6) : [],
    unspokenRequirements: Array.isArray(data.unspokenRequirements) ? data.unspokenRequirements.slice(0, 5) : [],
    redFlags: Array.isArray(data.redFlags) ? data.redFlags.slice(0, 4) : [],
    greenFlags: Array.isArray(data.greenFlags) ? data.greenFlags.slice(0, 4) : [],
    salarySignals: data.salarySignals || { estimatedRange: 'Not determined', signals: [], confidence: 'low' },
    teamCultureDNA: data.teamCultureDNA || { workStyle: 'unknown', pace: 'unknown', collaboration: 'unknown', keyTraits: [] },
    hiringUrgency: data.hiringUrgency || { level: 'medium', signals: [] },
    candidatePositioning: data.candidatePositioning || { overallFit: 'moderate', topStrengths: [], criticalGaps: [], pitchAngle: '' },
    interviewForecast: data.interviewForecast || { likelyRounds: 3, expectedFocus: [], trickyQuestions: [] }
  };
};

const runDeterministicXRay = (jobText, resumeText) => {
  const lower = jobText.toLowerCase();
  const redFlags = [];
  const greenFlags = [];

  if (lower.includes('wear many hats') || lower.includes('fast-paced startup')) {
    redFlags.push({ flag: 'Potential scope creep', reason: '"Wear many hats" often means understaffed team', severity: 'medium' });
  }
  if (lower.includes('competitive salary') || lower.includes('market rate')) {
    redFlags.push({ flag: 'Vague compensation', reason: 'No salary range provided despite "competitive" claim', severity: 'low' });
  }
  if (lower.includes('unlimited pto')) {
    redFlags.push({ flag: 'Unlimited PTO signal', reason: 'Unlimited PTO cultures often discourage actual time off', severity: 'low' });
  }
  if (lower.includes('series a') || lower.includes('series b') || lower.includes('well-funded')) {
    greenFlags.push({ flag: 'Funded startup', reason: 'Company appears to have secured institutional investment' });
  }
  if (lower.includes('remote') || lower.includes('work from anywhere')) {
    greenFlags.push({ flag: 'Remote-friendly culture', reason: 'Explicitly supports remote or distributed work' });
  }

  return {
    realPriorities: [
      { priority: 'Technical execution', evidence: 'Multiple technical requirements listed', likelyWeight: 'high', candidateStatus: 'partial' },
      { priority: 'Communication skills', evidence: 'Collaboration and communication mentioned', likelyWeight: 'medium', candidateStatus: 'partial' }
    ],
    unspokenRequirements: [
      { requirement: 'Startup adaptability', signal: 'Broad role scope described', candidateHasIt: false },
      { requirement: 'Self-direction', signal: 'Limited management structure described', candidateHasIt: false }
    ],
    redFlags,
    greenFlags,
    salarySignals: { estimatedRange: 'Not determinable without AI', signals: ['No salary range provided'], confidence: 'low' },
    teamCultureDNA: { workStyle: 'hybrid', pace: 'structured', collaboration: 'cross-functional', keyTraits: ['ownership', 'collaboration'] },
    hiringUrgency: { level: 'medium', signals: ['Standard posting language'] },
    candidatePositioning: { overallFit: 'moderate', topStrengths: ['Review your resume match score'], criticalGaps: ['Enable AI for full analysis'], pitchAngle: 'Position yourself around impact and technical depth.' },
    interviewForecast: { likelyRounds: 3, expectedFocus: ['Technical screen', 'System design', 'Behavioral'], trickyQuestions: ['Why this company?', 'How do you handle ambiguity?'] }
  };
};

module.exports = { runJobXRay };
