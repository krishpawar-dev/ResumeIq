const OpenAI = require('openai');

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Weak action verb indicators
const WEAK_VERBS = [
  'worked on', 'worked with', 'helped with', 'helped to', 'responsible for',
  'handled', 'assisted with', 'assisted in', 'did', 'made', 'participated in',
  'involved in', 'supported', 'contributed to', 'tasked with', 'managed to'
];

// Strong action verbs replacement dictionary
const STRONG_ACTION_REPLACEMENTS = {
  'worked on': 'Developed and deployed',
  'worked with': 'Collaborated cross-functionally with',
  'helped with': 'Accelerated and streamlined',
  'helped to': 'Facilitated and engineered',
  'responsible for': 'Spearheaded and executed',
  'handled': 'Orchestrated and managed',
  'assisted with': 'Partnered to deliver',
  'assisted in': 'Contributed directly to engineering',
  'did': 'Executed',
  'made': 'Engineered and produced',
  'participated in': 'Collaborated on',
  'involved in': 'Engineered critical components of',
  'supported': 'Maintained and strengthened',
  'contributed to': 'Accelerated delivery of',
  'tasked with': 'Accountable for delivering'
};

/**
 * Deterministic rule-based improvement engine when OpenAI is unavailable or rate-limited.
 * Strictly adheres to Truthful Improvement Principles:
 * - Never invents employers, numbers, or technologies
 * - Replaces passive phrasing with active, executive verbs
 * - Pinpoints precise, explainable weaknesses
 */
const runDeterministicImprovement = (originalText, sectionType = 'experience') => {
  const text = (originalText || '').trim();
  const lower = text.toLowerCase();
  const reasons = [];

  // 1. Check for weak action verbs or responsibility-focused openings
  let foundWeakVerb = null;
  for (const weak of WEAK_VERBS) {
    if (lower.startsWith(weak) || lower.includes(` ${weak} `)) {
      foundWeakVerb = weak;
      break;
    }
  }

  if (foundWeakVerb) {
    if (foundWeakVerb === 'responsible for' || foundWeakVerb === 'tasked with') {
      reasons.push('Responsibility-focused rather than impact-focused');
    } else {
      reasons.push('Weak action verb');
    }
  } else if (!/^[A-Z][a-z]+ed\b|^[A-Z][a-z]+s\b/.test(text)) {
    reasons.push('Weak action verb');
  }

  // 2. Check for quantifiable results
  const hasNumbers = /(\d+(\.\d+)?%|\$\d+|\b\d+\b)/.test(text);
  if (!hasNumbers) {
    reasons.push('No measurable result');
  }

  // 3. Check for technology/tools
  const techKeywords = [
    'react', 'node', 'javascript', 'typescript', 'python', 'java', 'aws', 'docker',
    'kubernetes', 'sql', 'mongodb', 'graphql', 'html', 'css', 'git', 'ci/cd', 'rest', 'api',
    'cloud', 'database', 'microservices', 'c++', 'go', 'c#', 'vue', 'angular', 'next.js'
  ];
  const hasTech = techKeywords.some((tech) => lower.includes(tech));
  if (!hasTech && (sectionType === 'experience' || sectionType === 'projects')) {
    reasons.push('No technology/tool named');
  }

  // 4. Check length & vagueness
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 8) {
    reasons.push('Too vague');
    reasons.push('Missing context');
  } else if (words.length > 35) {
    reasons.push('Excessive length');
  }

  // Fallback reason if none triggered
  if (reasons.length === 0) {
    reasons.push('Weak ATS keyword alignment');
  }

  // Build improved text truthfully
  let improved = text;

  // Substitute weak verbs
  if (foundWeakVerb && STRONG_ACTION_REPLACEMENTS[foundWeakVerb]) {
    const regex = new RegExp(`^${foundWeakVerb}\\s*`, 'i');
    if (regex.test(improved)) {
      improved = improved.replace(regex, `${STRONG_ACTION_REPLACEMENTS[foundWeakVerb]} `);
    } else {
      const midRegex = new RegExp(`\\b${foundWeakVerb}\\b`, 'i');
      improved = improved.replace(midRegex, STRONG_ACTION_REPLACEMENTS[foundWeakVerb]);
    }
  } else if (reasons.includes('Weak action verb') && !foundWeakVerb) {
    // Lead with strong verb if started passively
    if (/^(i\s+|we\s+|was\s+)/i.test(improved)) {
      improved = improved.replace(/^(i\s+was\s+|we\s+were\s+|was\s+|i\s+|we\s+)/i, '');
      improved = `Spearheaded ${improved.charAt(0).toLowerCase() + improved.slice(1)}`;
    }
  }

  // Capitalize first letter
  improved = improved.charAt(0).toUpperCase() + improved.slice(1);

  // If missing measurable result, truthfully suggest adding one without fabricating
  if (!hasNumbers && (sectionType === 'experience' || sectionType === 'projects')) {
    if (!improved.endsWith('.')) improved += '.';
    improved += ' [Add measurable outcome here, such as % growth, time saved, or users impacted, if verifiable]';
  } else if (!improved.endsWith('.')) {
    improved += '.';
  }

  const explanation = reasons.length > 0
    ? `Identified ${reasons.length} specific weaknesses: ${reasons.join(', ')}. Strengthened leading action verb and formatted for ATS impact while preserving your verified responsibilities.`
    : 'Optimized sentence structure, removed passive phrasing, and enhanced ATS scanability.';

  return {
    originalText: text,
    suggestedText: improved,
    reasons,
    explanation
  };
};

/**
 * OpenAI-powered Truthful Resume Improvement
 */
const runOpenAIImprovement = async (originalText, sectionType = 'experience', resumeContext = '') => {
  const prompt = `You are the lead Executive Resume Strategist & ATS Optimizer for ResumeIQ.
You are tasked with improving a specific section or bullet point from a candidate's resume.

CRITICAL PRODUCT RULES (FAILURE TO ADHERE IS UNACCEPTABLE):
1. TRUTHFUL RESUME IMPROVEMENT: Ground all suggestions strictly in the candidate's original text.
2. NEVER invent, fabricate, or hallucinate:
   - Employers, companies, or clients
   - Job titles or roles
   - Technologies, languages, or tools not mentioned or implied by the candidate
   - Numbers, percentages, dollar amounts, team sizes, or metrics
   - Certifications, degrees, or years of experience
3. If the candidate's original text lacks a measurable metric, DO NOT invent a fake percentage (e.g. DO NOT say "increased sales by 45%").
   Instead, explicitly prompt the user with advice like:
   "[Add measurable outcome here, such as % increase, hours saved, or volume handled, if verifiable]"
4. Identify 1 to 4 concrete weaknesses from this EXACT list if applicable:
   - "Weak action verb"
   - "No measurable result"
   - "No technology/tool named"
   - "Too vague"
   - "Responsibility-focused rather than impact-focused"
   - "Missing context"
   - "Repetitive wording"
   - "Poor clarity"
   - "Weak ATS keyword alignment"
   - "Excessive length"
5. Explain concisely and specifically WHY this section was weak. Do NOT say generic phrases like "Make it more professional".

Section Type: ${sectionType}
Original Content:
"""
${originalText}
"""
${resumeContext ? `Surrounding Resume Context (for grounding):\n"""\n${resumeContext.slice(0, 1500)}\n"""` : ''}

Respond ONLY with a JSON object in this exact schema:
{
  "originalText": string,
  "suggestedText": string,
  "reasons": string[],
  "explanation": string
}`;

  const completion = await openaiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are ResumeIQ truthful AI resume assistant. Output strictly valid JSON without conversational wrapper.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('AI returned empty response for section improvement');

  const parsed = JSON.parse(content);

  // Validate output structure
  if (!parsed.suggestedText || !Array.isArray(parsed.reasons) || parsed.reasons.length === 0) {
    throw new Error('AI response did not adhere to required schema');
  }

  return {
    originalText: originalText.trim(),
    suggestedText: String(parsed.suggestedText).trim(),
    reasons: parsed.reasons.map((r) => String(r).trim()),
    explanation: String(parsed.explanation || 'Refined for ATS impact and decisive executive phrasing.').trim()
  };
};

/**
 * Main service method to improve a section or bullet
 */
const improveResumeSection = async ({ originalText, sectionType = 'experience', resumeContext = '' }) => {
  if (!originalText || typeof originalText !== 'string' || originalText.trim().length === 0) {
    throw new Error('Original text is required for improvement');
  }

  const cleanOriginal = originalText.trim();

  if (openaiClient && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-api-key')) {
    try {
      return await runOpenAIImprovement(cleanOriginal, sectionType, resumeContext);
    } catch (err) {
      console.warn('[OpenAI Section Improvement Warning - falling back to deterministic engine]:', err.message);
      return runDeterministicImprovement(cleanOriginal, sectionType);
    }
  }

  return runDeterministicImprovement(cleanOriginal, sectionType);
};

module.exports = {
  improveResumeSection,
  runDeterministicImprovement,
  WEAK_VERBS
};
