const OpenAI = require('openai');

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Fixed evaluation criteria weights (Sum = 1.00 / 100%)
const EVALUATION_WEIGHTS = {
  relevance: 0.30,
  clarity: 0.20,
  star: 0.20,
  technicalAccuracy: 0.15,
  completeness: 0.15
};

const COMMON_FILLER_WORDS = [
  'um', 'uh', 'like', 'basically', 'actually', 'you know', 'sort of', 'kind of', 'literally'
];

/**
 * Perform context-aware filler word analysis on an answer text
 */
const analyzeFillerWords = (text) => {
  if (!text || typeof text !== 'string') {
    return { totalCount: 0, occurrences: [] };
  }

  const lower = text.toLowerCase();
  const occurrences = [];
  let totalCount = 0;

  for (const filler of COMMON_FILLER_WORDS) {
    // Regex matching word boundary
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      // For 'like', discount if used grammatically as comparison ("such as" or "acting like")
      let count = matches.length;
      if (filler === 'like' && /feel like|looks like|act like|sounds like|something like/i.test(lower)) {
        count = Math.max(1, count - 1);
      }
      occurrences.push({ word: filler, count });
      totalCount += count;
    }
  }

  // Sort by highest count
  occurrences.sort((a, b) => b.count - a.count);

  return { totalCount, occurrences };
};

/**
 * Extract relevant keywords used and missing from answer based on question and target role
 */
const analyzeKeywords = (text, questionText, targetRole) => {
  const lower = (text || '').toLowerCase();
  const combinedContext = `${questionText} ${targetRole}`.toLowerCase();

  const domainDictionary = [
    'react', 'node', 'typescript', 'javascript', 'python', 'architecture', 'scalability',
    'latency', 'database', 'microservices', 'caching', 'redis', 'postgresql', 'docker',
    'kubernetes', 'ci/cd', 'aws', 'rest api', 'graphql', 'testing', 'tdd', 'debugging',
    'throughput', 'concurrency', 'state management', 'optimization', 'monitoring', 'incident'
  ];

  const relevantKeywords = domainDictionary.filter((kw) => combinedContext.includes(kw));
  // If few matched from context, use common engineering terms
  const searchPool = relevantKeywords.length >= 3 ? relevantKeywords : domainDictionary.slice(0, 8);

  const used = [];
  const missing = [];

  for (const kw of searchPool) {
    if (lower.includes(kw)) {
      used.push(kw);
    } else {
      missing.push(kw);
    }
  }

  return {
    used: used.slice(0, 6),
    missing: missing.slice(0, 5)
  };
};

/**
 * Deterministic rule-based answer evaluation engine when OpenAI is unavailable
 */
const runDeterministicEvaluation = ({
  question,
  answerText,
  targetRole,
  resumeContext
}) => {
  const text = (answerText || '').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const isBehavioral = question.questionType === 'behavioral' || question.questionType === 'situational';

  // 1. Relevance Score (30%)
  // Check if answer addresses expected topics or key question words
  let relevanceScore = 75;
  const lowerAns = text.toLowerCase();
  const expected = question.expectedTopics || [];
  let topicMatches = 0;
  for (const topic of expected) {
    const words = topic.toLowerCase().split(/\s+/);
    if (words.some((w) => lowerAns.includes(w))) {
      topicMatches++;
    }
  }
  if (topicMatches >= 2) relevanceScore += 15;
  if (wordCount < 25) relevanceScore = Math.max(35, relevanceScore - 30);
  relevanceScore = Math.min(100, Math.max(25, relevanceScore));

  // 2. Clarity Score (20%)
  let clarityScore = 80;
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  if (sentences.length >= 3) clarityScore += 10;
  if (wordCount > 350) clarityScore -= 15;
  if (wordCount < 30) clarityScore -= 20;
  clarityScore = Math.min(100, Math.max(30, clarityScore));

  // 3. STAR Framework Score (20%)
  let starScore = 75;
  const hasSituation = /when|at my previous|during|in a project|we were building|faced with/i.test(text);
  const hasTask = /needed to|responsible for|goal was|tasked with|challenge was|objective/i.test(text);
  const hasAction = /i designed|i engineered|i implemented|i investigated|i collaborated|i decoupled|i migrated/i.test(text);
  const hasResult = /resulted in|improved by|achieved|delivered|reduced|increased|success|outcome/i.test(text);

  let starSignals = 0;
  if (hasSituation) starSignals++;
  if (hasTask) starSignals++;
  if (hasAction) starSignals++;
  if (hasResult) starSignals++;

  if (isBehavioral) {
    starScore = Math.min(100, Math.max(35, starSignals * 24));
  } else {
    // For technical questions, STAR is not strictly required; give baseline credit for structured problem/solution
    starScore = hasAction && (hasResult || hasTask) ? 88 : 78;
  }

  // 4. Technical Accuracy Score (15%)
  let techScore = 80;
  const techTerms = ['api', 'state', 'component', 'service', 'database', 'async', 'promise', 'latency', 'cache', 'thread', 'pipeline'];
  const foundTech = techTerms.filter((t) => lowerAns.includes(t));
  if (foundTech.length >= 3) techScore += 12;
  if (wordCount < 30) techScore -= 20;
  techScore = Math.min(100, Math.max(40, techScore));

  // 5. Completeness Score (15%)
  let completeScore = 78;
  if (wordCount >= 70 && wordCount <= 250) completeScore += 14;
  if (wordCount < 40) completeScore -= 25;
  completeScore = Math.min(100, Math.max(30, completeScore));

  // Calculate Weighted Score (Total 0–100)
  const weightedTotal =
    (relevanceScore * EVALUATION_WEIGHTS.relevance) +
    (clarityScore * EVALUATION_WEIGHTS.clarity) +
    (starScore * EVALUATION_WEIGHTS.star) +
    (techScore * EVALUATION_WEIGHTS.technicalAccuracy) +
    (completeScore * EVALUATION_WEIGHTS.completeness);

  // Convert to 0–10 score
  const overallScore = Math.round((weightedTotal / 10) * 10) / 10;

  // Strengths
  const strengths = [];
  if (relevanceScore >= 80) strengths.push('Directly addressed the core themes asked by the interviewer.');
  if (hasAction) strengths.push('Used decisive first-person action statements ("I designed", "I implemented") indicating clear ownership.');
  if (clarityScore >= 80) strengths.push('Structured thoughts into a readable, sequential progression.');
  if (techScore >= 80) strengths.push('Demonstrated authentic familiarity with relevant technical domain concepts.');
  if (strengths.length === 0) strengths.push('Provided a solid foundational answer with relatable context.');

  // Weaknesses
  const weaknesses = [];
  if (!hasResult) weaknesses.push('Answer lacked a definitive, measurable outcome or conclusion.');
  if (wordCount < 50) weaknesses.push('Response was relatively brief; missed an opportunity to elaborate on technical depth.');
  if (isBehavioral && starSignals < 3) weaknesses.push('Behavioral answer did not fully follow the STAR structure (Situation, Task, Action, Result).');
  if (weaknesses.length === 0) weaknesses.push('Could further quantify the business impact or scale metrics.');

  // Missing Points
  const missingPoints = [];
  if (!hasResult) missingPoints.push('Mention how you measured success or the post-launch impact of your solution.');
  if (!hasTask) missingPoints.push('Clearly define what your specific responsibility was versus the broader team.');
  missingPoints.push('Include any production tradeoffs or alternative solutions you evaluated before deciding.');

  // Improved Model Answer
  let improvedModelAnswer = text;
  if (!hasResult) {
    improvedModelAnswer += ' By following this approach, we resolved the core issue with zero production downtime [Add your verified performance improvement or team outcome here].';
  }
  if (!hasSituation && isBehavioral) {
    improvedModelAnswer = `In a recent production initiative for my team, ${improvedModelAnswer}`;
  }

  // Keywords and Fillers
  const keywords = analyzeKeywords(text, question.questionText, targetRole);
  const fillerWords = analyzeFillerWords(text);

  return {
    relevanceScore: Math.round(relevanceScore),
    clarityScore: Math.round(clarityScore),
    starScore: Math.round(starScore),
    technicalAccuracyScore: Math.round(techScore),
    completenessScore: Math.round(completeScore),
    overallScore,
    strengths,
    weaknesses,
    missingPoints,
    improvedModelAnswer,
    keywords,
    fillerWords
  };
};

/**
 * OpenAI-powered Answer Evaluation Engine
 */
const runOpenAIEvaluation = async ({
  question,
  answerText,
  targetRole,
  resumeContext
}) => {
  const isBehavioral = question.questionType === 'behavioral' || question.questionType === 'situational';

  const prompt = `You are the lead Interview Evaluator and Executive Hiring Coach at ResumeIQ.
Evaluate the candidate's submitted mock interview answer against the interview question and target role.

TARGET ROLE: ${targetRole}
QUESTION: "${question.questionText}"
QUESTION TYPE: ${question.questionType}
EXPECTED TOPICS: ${JSON.stringify(question.expectedTopics || [])}

CANDIDATE ANSWER:
"""
${answerText}
"""

${resumeContext ? `CANDIDATE RESUME CONTEXT (for grounding):\n"""\n${resumeContext.slice(0, 1500)}\n"""` : ''}

EVALUATION RULES (CRITICAL):
1. Score each criterion independently from 0 to 100 based on standard hiring benchmarks:
   - relevanceScore: Did the answer actually address what was asked?
   - clarityScore: Organization, conciseness, communication quality.
   - starScore: Evaluation of Situation, Task, Action, Result. (${isBehavioral ? 'Crucial for this question type.' : 'STAR is optional here; do not penalize technical explanation if structured logically.'})
   - technicalAccuracyScore: Correctness of claims, terminology, and technical concepts.
   - completenessScore: Did they cover problem, investigation, solution, and outcome?
2. STRENGTHS: Provide 2–3 specific, grounded strengths (not generic phrases).
3. WEAKNESSES: Provide 1–3 specific, constructive weaknesses.
4. MISSING POINTS: Specific elements they should have mentioned.
5. IMPROVED MODEL ANSWER: Return an example of a stronger response grounded strictly in the candidate's actual answer and resume.
   - DO NOT fabricate accomplishments or metrics.
   - Use placeholders like "[Add your verified metric or scale here]" if numbers were absent.
6. KEYWORDS: Return relevant domain keywords used, and important keywords missing.

Respond ONLY with a JSON object in this exact schema:
{
  "relevanceScore": number,
  "clarityScore": number,
  "starScore": number,
  "technicalAccuracyScore": number,
  "completenessScore": number,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingPoints": ["string"],
  "improvedModelAnswer": "string",
  "keywords": {
    "used": ["string"],
    "missing": ["string"]
  }
}`;

  const completion = await openaiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are ResumeIQ Interview Evaluation Engine. Return only valid JSON adhering strictly to the schema.'
      },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('AI returned empty response for interview answer evaluation');

  const parsed = JSON.parse(content);

  // Validate criteria scores
  const relevance = Math.min(100, Math.max(0, Math.round(parsed.relevanceScore || 70)));
  const clarity = Math.min(100, Math.max(0, Math.round(parsed.clarityScore || 70)));
  const star = Math.min(100, Math.max(0, Math.round(parsed.starScore || 70)));
  const technicalAccuracy = Math.min(100, Math.max(0, Math.round(parsed.technicalAccuracyScore || 70)));
  const completeness = Math.min(100, Math.max(0, Math.round(parsed.completenessScore || 70)));

  // Backend strictly OWNS the weighted calculation formula:
  const weightedTotal =
    (relevance * EVALUATION_WEIGHTS.relevance) +
    (clarity * EVALUATION_WEIGHTS.clarity) +
    (star * EVALUATION_WEIGHTS.star) +
    (technicalAccuracy * EVALUATION_WEIGHTS.technicalAccuracy) +
    (completeness * EVALUATION_WEIGHTS.completeness);

  const overallScore = Math.round((weightedTotal / 10) * 10) / 10;

  // Local context-aware filler word analysis
  const fillerWords = analyzeFillerWords(answerText);

  return {
    relevanceScore: relevance,
    clarityScore: clarity,
    starScore: star,
    technicalAccuracyScore: technicalAccuracy,
    completenessScore: completeness,
    overallScore,
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Clearly structured response.'],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : ['Could add more quantifiable outcomes.'],
    missingPoints: Array.isArray(parsed.missingPoints) ? parsed.missingPoints : ['Consider discussing architectural trade-offs.'],
    improvedModelAnswer: String(parsed.improvedModelAnswer || answerText).trim(),
    keywords: {
      used: Array.isArray(parsed.keywords?.used) ? parsed.keywords.used : [],
      missing: Array.isArray(parsed.keywords?.missing) ? parsed.keywords.missing : []
    },
    fillerWords
  };
};

/**
 * Main service entry point for answer evaluation
 */
const evaluateInterviewAnswer = async (params) => {
  if (openaiClient && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-api-key')) {
    try {
      return await runOpenAIEvaluation(params);
    } catch (err) {
      console.warn('[OpenAI Evaluation Warning - falling back to deterministic evaluator]:', err.message);
      return runDeterministicEvaluation(params);
    }
  }

  return runDeterministicEvaluation(params);
};

module.exports = {
  evaluateInterviewAnswer,
  analyzeFillerWords,
  analyzeKeywords,
  EVALUATION_WEIGHTS
};
