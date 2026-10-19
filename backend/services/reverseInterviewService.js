const OpenAI = require('openai');

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Reverse Interview Generator: Given interview results, generates smart questions
 * the candidate should ask the interviewer to evaluate the company.
 * This flips the script — the candidate interviews the company.
 * @param {object} sessionData - interview session data (role, questions, evaluations)
 * @returns {object} reverse interview questions with context
 */
const generateReverseInterviewQuestions = async (sessionData) => {
  if (!openaiClient) {
    return runDeterministicReverseInterview(sessionData);
  }

  const systemPrompt = `You are a senior career coach and interview strategist.
Your specialty is helping candidates evaluate companies during interviews — the "reverse interview."
You generate thoughtful, strategic questions that help candidates assess cultural fit, growth opportunities,
leadership quality, and potential red flags. Questions should be professional, curious, and signal intelligence.
Always respond with valid JSON matching the exact schema provided.`;

  const role = sessionData?.role || sessionData?.setup?.targetRole || 'Software Engineer';
  const company = sessionData?.setup?.company || 'the company';
  const topics = (sessionData?.questions || []).slice(0, 5).map((q) => q.questionText || q.text || '').join(', ');

  const userPrompt = `Generate strategic reverse interview questions for this candidate.

TARGET ROLE: ${role}
COMPANY: ${company}
TOPICS COVERED IN INTERVIEW: ${topics || 'General technical and behavioral questions'}
INTERVIEW CONTEXT: The candidate just completed a mock interview and performed at a certain level.

Generate reverse interview questions that:
1. Signal the candidate's strategic thinking
2. Evaluate the company's culture and growth potential
3. Reveal potential red flags
4. Show genuine curiosity about the team and mission

Return JSON with exactly this structure:
{
  "categories": [
    {
      "category": "string (e.g. 'Team Culture & Dynamics')",
      "emoji": "string (1 emoji)",
      "questions": [
        {
          "question": "string",
          "whyAsk": "string (what this reveals about the company)",
          "redFlagResponse": "string (what a bad answer looks like)",
          "greenFlagResponse": "string (what a good answer looks like)",
          "power": "high|medium",
          "bestUsedAt": "first_round|final_round|any"
        }
      ]
    }
  ],
  "topPowerQuestions": [
    {
      "question": "string (the most impactful question to ask)",
      "why": "string (strategic reasoning)"
    }
  ],
  "questionsToAvoid": [
    {
      "question": "string",
      "why": "string (why this is a bad question to ask)"
    }
  ],
  "closingStrategy": "string (how to end the interview impressively)"
}`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 2000
    });

    const raw = completion.choices[0]?.message?.content;
    const parsed = JSON.parse(raw);
    return validateReverseInterviewResult(parsed);
  } catch (err) {
    console.error('[Reverse Interview AI Error]', err.message);
    return runDeterministicReverseInterview(sessionData);
  }
};

const validateReverseInterviewResult = (data) => {
  return {
    categories: Array.isArray(data.categories) ? data.categories.slice(0, 5).map((c) => ({
      category: c.category || 'Questions',
      emoji: c.emoji || '💡',
      questions: Array.isArray(c.questions) ? c.questions.slice(0, 4) : []
    })) : [],
    topPowerQuestions: Array.isArray(data.topPowerQuestions) ? data.topPowerQuestions.slice(0, 3) : [],
    questionsToAvoid: Array.isArray(data.questionsToAvoid) ? data.questionsToAvoid.slice(0, 3) : [],
    closingStrategy: data.closingStrategy || 'Thank the interviewer, reiterate your enthusiasm for the role, and ask about next steps.'
  };
};

const runDeterministicReverseInterview = (sessionData) => {
  const role = sessionData?.role || sessionData?.setup?.targetRole || 'Software Engineer';

  return {
    categories: [
      {
        category: 'Team Culture & Dynamics',
        emoji: '👥',
        questions: [
          {
            question: 'Can you walk me through how your team approaches disagreements on technical decisions?',
            whyAsk: 'Reveals psychological safety and how the team handles conflict',
            redFlagResponse: 'Vague answers, "we generally agree", or mentioning senior engineers always decide',
            greenFlagResponse: 'Specific process, RFC documents, healthy debate culture, clear ownership',
            power: 'high',
            bestUsedAt: 'any'
          },
          {
            question: 'What does success look like in this role in the first 90 days?',
            whyAsk: 'Reveals how clearly the team has defined the role and what onboarding looks like',
            redFlagResponse: 'No clear answer, "just get up to speed", vague milestones',
            greenFlagResponse: 'Specific deliverables, clear onboarding plan, defined success criteria',
            power: 'high',
            bestUsedAt: 'first_round'
          }
        ]
      },
      {
        category: 'Engineering Excellence',
        emoji: '⚙️',
        questions: [
          {
            question: `How does the engineering team balance feature velocity with technical debt?`,
            whyAsk: 'Reveals engineering culture maturity and whether tech debt is acknowledged or ignored',
            redFlagResponse: 'Dismissing tech debt, "we always ship on time", no clear process',
            greenFlagResponse: 'Dedicated tech debt sprints, explicit trade-off conversations, refactor budget',
            power: 'high',
            bestUsedAt: 'any'
          },
          {
            question: 'What does your on-call rotation look like and how many incidents do you typically handle per month?',
            whyAsk: 'Reveals operational burden and system reliability maturity',
            redFlagResponse: 'Constant on-call, high incident frequency, no runbooks',
            greenFlagResponse: 'Rotation-based, low-frequency incidents, strong post-mortem culture',
            power: 'medium',
            bestUsedAt: 'final_round'
          }
        ]
      },
      {
        category: 'Growth & Career Development',
        emoji: '📈',
        questions: [
          {
            question: 'How have engineers on this team grown in their careers over the past two years?',
            whyAsk: 'Reveals whether the company invests in and retains engineering talent',
            redFlagResponse: 'High turnover, promotions rarely happen, lateral moves only',
            greenFlagResponse: 'Specific examples of promotions, internal mobility, learning budget',
            power: 'high',
            bestUsedAt: 'final_round'
          },
          {
            question: `What's your engineering learning budget and how is it typically used?`,
            whyAsk: 'Directly reveals investment in professional development',
            redFlagResponse: 'No budget, "we encourage self-directed learning", vague answers',
            greenFlagResponse: 'Defined budget, conference attendance, course reimbursement, dedicated learning time',
            power: 'medium',
            bestUsedAt: 'final_round'
          }
        ]
      },
      {
        category: 'Leadership & Vision',
        emoji: '🧭',
        questions: [
          {
            question: `What's the biggest technical challenge the team is facing right now, and how is leadership approaching it?`,
            whyAsk: 'Reveals technical honesty, leadership quality, and whether problems are visible or hidden',
            redFlagResponse: 'No honest answer, deflecting, "we\'re handling it"',
            greenFlagResponse: 'Candid assessment, clear plan, leadership involvement, realistic timeline',
            power: 'high',
            bestUsedAt: 'any'
          }
        ]
      }
    ],
    topPowerQuestions: [
      {
        question: 'What does success look like in the first 90 days and how will it be measured?',
        why: 'Signals that you think in outcomes, not just activities. Also reveals whether the role is well-defined.'
      },
      {
        question: 'Can you describe a recent moment when a junior or mid-level engineer pushed back on a technical decision and was right?',
        why: 'Reveals psychological safety and whether intellectual humility is valued. A company that struggles to answer this is a red flag.'
      },
      {
        question: 'How has the team\'s strategy or product direction changed in the last year, and what drove that change?',
        why: 'Reveals organizational adaptability, honest communication about pivots, and whether engineering is close to business decisions.'
      }
    ],
    questionsToAvoid: [
      {
        question: 'What is the salary for this position?',
        why: 'Save compensation discussions for offer stage or HR screens — asking in a technical interview signals misaligned priorities'
      },
      {
        question: 'How many vacation days do I get?',
        why: 'Benefits questions in early rounds signal you\'re evaluating perks over impact. Ask about culture and growth instead.'
      },
      {
        question: 'When will I be promoted?',
        why: 'Too early and too transactional. Ask about career development processes instead — this reveals the same information more professionally.'
      }
    ],
    closingStrategy: `End by restating your enthusiasm: "Based on our conversation, I'm genuinely excited about [specific thing discussed]. I'm confident I can [specific contribution]. What are the next steps in your process?" This closes strong, shows genuine interest, and moves the process forward.`
  };
};

module.exports = { generateReverseInterviewQuestions };
