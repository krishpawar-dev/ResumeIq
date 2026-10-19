const OpenAI = require('openai');

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Career Twin: Finds a hypothetical "career twin" - someone who was
 * in the candidate's current position and successfully transitioned
 * to their target role. Provides trajectory insights.
 * @param {string} resumeText
 * @param {string} targetRole
 * @param {string} currentRole
 * @returns {object} career twin analysis
 */
const analyzeCareerTwin = async (resumeText, targetRole, currentRole) => {
  if (!openaiClient) {
    return runDeterministicCareerTwin(resumeText, targetRole, currentRole);
  }

  const systemPrompt = `You are a career intelligence analyst specializing in career trajectory modeling.
You analyze a candidate's background and create a "Career Twin" profile — a hypothetical but realistic
person who was in the same position and successfully made the transition to the target role.
This helps the candidate understand the realistic path and what they need to do.
Always respond with valid JSON matching the exact schema provided.`;

  const userPrompt = `Create a Career Twin analysis for this candidate.

CANDIDATE RESUME:
${resumeText.slice(0, 4000)}

CURRENT ROLE: ${currentRole || 'Not specified'}
TARGET ROLE: ${targetRole || 'Senior Software Engineer'}

Return JSON with exactly this structure:
{
  "careerTwin": {
    "name": "string (fictional but realistic name)",
    "currentTitle": "string",
    "targetTitle": "string",
    "yearsToTransition": 2,
    "transitionType": "vertical|lateral|pivot|acceleration",
    "background": "string (2-3 sentence narrative of the twin's background)"
  },
  "twinJourney": {
    "startingPoint": "string (where the twin started)",
    "keyMoves": [
      {
        "move": "string (action taken)",
        "timeline": "string (e.g. 'Month 3-6')",
        "impact": "string (outcome/result)"
      }
    ],
    "pivotMoment": "string (the key decision or event that accelerated the transition)",
    "totalTimeline": "string (e.g. '18 months')"
  },
  "sharedStrengths": [
    {
      "strength": "string",
      "relevance": "string (why this matters for the target role)"
    }
  ],
  "gapsYourTwinHadToClose": [
    {
      "gap": "string",
      "howTheyClosedIt": "string",
      "timeToClose": "string"
    }
  ],
  "candidateComparison": {
    "advantagesOverTwin": ["string (where this candidate is ahead)"],
    "disadvantagesVsTwin": ["string (where the twin had an edge)"],
    "overallReadiness": "ahead|similar|behind",
    "estimatedTimeToTransition": "string"
  },
  "actionPlan": [
    {
      "action": "string",
      "priority": "critical|high|medium",
      "timeline": "string",
      "resource": "string (specific course, project, cert, etc.)"
    }
  ],
  "successProbability": {
    "score": 72,
    "confidence": "high|medium|low",
    "keyFactors": ["string"]
  }
}`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.6,
      response_format: { type: 'json_object' },
      max_tokens: 2500
    });

    const raw = completion.choices[0]?.message?.content;
    const parsed = JSON.parse(raw);
    return validateCareerTwinResult(parsed);
  } catch (err) {
    console.error('[Career Twin AI Error]', err.message);
    return runDeterministicCareerTwin(resumeText, targetRole, currentRole);
  }
};

const validateCareerTwinResult = (data) => {
  return {
    careerTwin: {
      name: data.careerTwin?.name || 'Alex Chen',
      currentTitle: data.careerTwin?.currentTitle || 'Software Engineer',
      targetTitle: data.careerTwin?.targetTitle || 'Senior Engineer',
      yearsToTransition: Number(data.careerTwin?.yearsToTransition) || 2,
      transitionType: data.careerTwin?.transitionType || 'vertical',
      background: data.careerTwin?.background || 'A software engineer with similar technical background who made the transition through targeted skill development.'
    },
    twinJourney: {
      startingPoint: data.twinJourney?.startingPoint || 'Similar position to the candidate',
      keyMoves: Array.isArray(data.twinJourney?.keyMoves) ? data.twinJourney.keyMoves.slice(0, 5) : [],
      pivotMoment: data.twinJourney?.pivotMoment || 'Not specified',
      totalTimeline: data.twinJourney?.totalTimeline || '18 months'
    },
    sharedStrengths: Array.isArray(data.sharedStrengths) ? data.sharedStrengths.slice(0, 4) : [],
    gapsYourTwinHadToClose: Array.isArray(data.gapsYourTwinHadToClose) ? data.gapsYourTwinHadToClose.slice(0, 5) : [],
    candidateComparison: {
      advantagesOverTwin: Array.isArray(data.candidateComparison?.advantagesOverTwin) ? data.candidateComparison.advantagesOverTwin : [],
      disadvantagesVsTwin: Array.isArray(data.candidateComparison?.disadvantagesVsTwin) ? data.candidateComparison.disadvantagesVsTwin : [],
      overallReadiness: data.candidateComparison?.overallReadiness || 'similar',
      estimatedTimeToTransition: data.candidateComparison?.estimatedTimeToTransition || '12-18 months'
    },
    actionPlan: Array.isArray(data.actionPlan) ? data.actionPlan.slice(0, 6) : [],
    successProbability: {
      score: Math.min(100, Math.max(0, Number(data.successProbability?.score) || 65)),
      confidence: data.successProbability?.confidence || 'medium',
      keyFactors: Array.isArray(data.successProbability?.keyFactors) ? data.successProbability.keyFactors : []
    }
  };
};

const runDeterministicCareerTwin = (resumeText, targetRole, currentRole) => {
  return {
    careerTwin: {
      name: 'Alex Rivera',
      currentTitle: currentRole || 'Software Engineer',
      targetTitle: targetRole || 'Senior Software Engineer',
      yearsToTransition: 2,
      transitionType: 'vertical',
      background: `Alex was a ${currentRole || 'software engineer'} with a similar technical background who successfully transitioned to ${targetRole || 'a senior role'} through deliberate skill development and strategic positioning.`
    },
    twinJourney: {
      startingPoint: `Mid-level ${currentRole || 'engineer'} with 3 years of experience`,
      keyMoves: [
        { move: 'Led first end-to-end feature delivery', timeline: 'Month 1-3', impact: 'Demonstrated ownership and execution capability' },
        { move: 'Completed system design course (Grokking)', timeline: 'Month 3-6', impact: 'Unlocked ability to discuss architectural tradeoffs' },
        { move: 'Mentored two junior engineers', timeline: 'Month 6-12', impact: 'Built leadership narrative for promotion case' },
        { move: 'Delivered high-visibility project', timeline: 'Month 12-18', impact: 'Cross-team recognition accelerated promotion timeline' }
      ],
      pivotMoment: 'Volunteered to lead a critical migration project that exposed Alex to stakeholders and cross-functional collaboration at the next level.',
      totalTimeline: '18-24 months'
    },
    sharedStrengths: [
      { strength: 'Technical execution', relevance: 'Foundation for senior-level system ownership' },
      { strength: 'Problem solving', relevance: 'Core to technical leadership credibility' }
    ],
    gapsYourTwinHadToClose: [
      { gap: 'System design knowledge', howTheyClosedIt: 'Completed Grokking System Design + built side project at scale', timeToClose: '3 months' },
      { gap: 'Leadership experience', howTheyClosedIt: 'Proactively mentored juniors and ran weekly technical sync', timeToClose: '6 months' },
      { gap: 'Stakeholder communication', howTheyClosedIt: 'Joined cross-functional planning sessions and wrote architecture decision records', timeToClose: '4 months' }
    ],
    candidateComparison: {
      advantagesOverTwin: ['Enable AI analysis to see your personal advantages'],
      disadvantagesVsTwin: ['Enable AI analysis to see your specific gaps'],
      overallReadiness: 'similar',
      estimatedTimeToTransition: '12-24 months'
    },
    actionPlan: [
      { action: 'Complete a system design course', priority: 'critical', timeline: '0-3 months', resource: 'Grokking System Design on Educative.io' },
      { action: 'Lead one project end-to-end', priority: 'critical', timeline: '1-6 months', resource: 'Internal projects or open-source contributions' },
      { action: 'Mentor a junior team member', priority: 'high', timeline: '3-6 months', resource: 'Internal mentoring program or coding bootcamp mentorship' },
      { action: 'Build a high-visibility side project', priority: 'high', timeline: '3-9 months', resource: 'GitHub portfolio + write technical blog posts' }
    ],
    successProbability: {
      score: 68,
      confidence: 'medium',
      keyFactors: ['Technical foundation', 'Clear target role', 'Enable AI for personalized analysis']
    }
  };
};

module.exports = { analyzeCareerTwin };
