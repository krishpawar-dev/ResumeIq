const OpenAI = require('openai');

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Ghost Job Detector: Analyzes job description signals to determine
 * if the role is likely a real active opening or a ghost/evergreen posting.
 * @param {string} jobDescriptionText
 * @returns {object} ghost detection analysis
 */
const detectGhostJob = async (jobDescriptionText) => {
  if (!openaiClient) {
    return runDeterministicGhostDetection(jobDescriptionText);
  }

  const systemPrompt = `You are an expert recruiter analyst specializing in job market intelligence.
Your task is to analyze job postings and determine if they are genuine active openings or
"ghost jobs" — postings that are stale, perpetually open, placeholder roles, or pipeline-building exercises.
Always respond with valid JSON matching the exact schema provided.`;

  const userPrompt = `Analyze this job description for signs of being a ghost job or genuine opening.

JOB DESCRIPTION:
${jobDescriptionText.slice(0, 5000)}

Return JSON with exactly this structure:
{
  "ghostProbability": 42,
  "verdict": "likely_real|possibly_ghost|likely_ghost|uncertain",
  "confidenceScore": 78,
  "signals": {
    "redSignals": [
      {
        "signal": "string (ghost indicator)",
        "explanation": "string",
        "weight": "high|medium|low"
      }
    ],
    "greenSignals": [
      {
        "signal": "string (real job indicator)",
        "explanation": "string",
        "weight": "high|medium|low"
      }
    ]
  },
  "postingAge": {
    "assessment": "string",
    "indicators": ["string"]
  },
  "applicationStrategy": {
    "shouldApply": true,
    "urgency": "apply_now|apply_soon|apply_cautiously|skip",
    "tips": ["string (actionable tips for applying to this type of posting)"]
  },
  "likelyReason": "string (why this might be ghost or real)"
}`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 1500
    });

    const raw = completion.choices[0]?.message?.content;
    const parsed = JSON.parse(raw);
    return validateGhostResult(parsed);
  } catch (err) {
    console.error('[Ghost Job Detector AI Error]', err.message);
    return runDeterministicGhostDetection(jobDescriptionText);
  }
};

const validateGhostResult = (data) => {
  const validVerdicts = ['likely_real', 'possibly_ghost', 'likely_ghost', 'uncertain'];
  const validUrgencies = ['apply_now', 'apply_soon', 'apply_cautiously', 'skip'];

  return {
    ghostProbability: Math.min(100, Math.max(0, Number(data.ghostProbability) || 30)),
    verdict: validVerdicts.includes(data.verdict) ? data.verdict : 'uncertain',
    confidenceScore: Math.min(100, Math.max(0, Number(data.confidenceScore) || 50)),
    signals: {
      redSignals: Array.isArray(data.signals?.redSignals) ? data.signals.redSignals.slice(0, 5) : [],
      greenSignals: Array.isArray(data.signals?.greenSignals) ? data.signals.greenSignals.slice(0, 5) : []
    },
    postingAge: data.postingAge || { assessment: 'Unknown', indicators: [] },
    applicationStrategy: {
      shouldApply: data.applicationStrategy?.shouldApply !== false,
      urgency: validUrgencies.includes(data.applicationStrategy?.urgency) ? data.applicationStrategy.urgency : 'apply_cautiously',
      tips: Array.isArray(data.applicationStrategy?.tips) ? data.applicationStrategy.tips.slice(0, 4) : []
    },
    likelyReason: data.likelyReason || 'Insufficient data to determine posting authenticity.'
  };
};

const runDeterministicGhostDetection = (jobText) => {
  const lower = jobText.toLowerCase();
  let ghostScore = 30;
  const redSignals = [];
  const greenSignals = [];

  // Ghost indicators
  if (lower.includes('we are always looking for') || lower.includes('join our talent pool')) {
    ghostScore += 30;
    redSignals.push({ signal: 'Talent pool language', explanation: '"Always looking for" indicates pipeline building, not an active role', weight: 'high' });
  }
  if (!lower.includes('apply') && !lower.includes('submit')) {
    ghostScore += 15;
    redSignals.push({ signal: 'No clear application CTA', explanation: 'Genuine postings typically have clear application instructions', weight: 'medium' });
  }
  if (lower.includes('ideal candidate') && lower.includes('must have') && lower.includes('preferred') && lower.includes('nice to have')) {
    ghostScore -= 10;
    greenSignals.push({ signal: 'Structured requirements', explanation: 'Layered requirement tiers suggest active screening process', weight: 'medium' });
  }
  if (lower.includes('immediate') || lower.includes('urgent') || lower.includes('asap')) {
    ghostScore -= 20;
    greenSignals.push({ signal: 'Urgency language', explanation: 'Urgency indicators suggest real hiring timeline', weight: 'high' });
  }
  if (lower.includes('team of') || lower.includes('you will work with') || lower.includes('report to')) {
    ghostScore -= 15;
    greenSignals.push({ signal: 'Specific team context', explanation: 'References to specific team structure suggest real role', weight: 'medium' });
  }

  ghostScore = Math.min(95, Math.max(5, ghostScore));
  const verdict = ghostScore > 65 ? 'likely_ghost' : ghostScore > 45 ? 'possibly_ghost' : ghostScore > 25 ? 'likely_real' : 'likely_real';

  return {
    ghostProbability: ghostScore,
    verdict,
    confidenceScore: 45,
    signals: { redSignals, greenSignals },
    postingAge: { assessment: 'Cannot determine without AI analysis', indicators: [] },
    applicationStrategy: {
      shouldApply: ghostScore < 65,
      urgency: ghostScore > 65 ? 'apply_cautiously' : 'apply_soon',
      tips: [
        'Research the company on LinkedIn to verify active hiring',
        'Check if similar roles appear repeatedly on job boards',
        'Look for the posting date — recent posts are more likely active',
        'Reach out to employees at the company to confirm the role exists'
      ]
    },
    likelyReason: `Deterministic analysis (AI not configured). Ghost probability: ${ghostScore}%.`
  };
};

module.exports = { detectGhostJob };
