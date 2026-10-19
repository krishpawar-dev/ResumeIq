const OpenAI = require('openai');

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const getQuestionCountForDuration = (duration) => {
  if (Number(duration) === 60) return 8;
  if (Number(duration) === 45) return 6;
  return 4;
};

const TECH_DICTIONARY = [
  'react', 'react.js', 'node.js', 'node', 'express', 'javascript', 'typescript', 'python', 'java',
  'go', 'c++', 'c#', 'next.js', 'vue', 'angular', 'redux', 'html', 'css', 'tailwind', 'sql',
  'postgresql', 'mysql', 'mongodb', 'redis', 'graphql', 'rest api', 'aws', 'azure', 'gcp',
  'docker', 'kubernetes', 'git', 'github', 'ci/cd', 'jenkins', 'terraform', 'kafka', 'microservices',
  'system design', 'linux', 'jest', 'cypress', 'playwright'
];

const hasSkill = (text, skill) => {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9+#.])${escaped}(?:$|[^a-z0-9+#.])`, 'i').test(text || '');
};

const extractResumeHighlights = (parsedText) => {
  const text = parsedText || '';
  const technologies = TECH_DICTIONARY.filter((tech) => hasSkill(text, tech));
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 20);
  const projects = [];

  for (const line of lines) {
    if (/project|platform|system|application|dashboard|engine|portal|website|api/i.test(line) && !line.includes('@')) {
      const clean = line.replace(/^[•\-*]\s*/, '').slice(0, 160);
      if (!projects.includes(clean)) projects.push(clean);
      if (projects.length >= 4) break;
    }
  }

  const summary = lines.slice(0, 5).join(' ').slice(0, 700);
  return { technologies, projects, summary };
};

const normalizeFocus = (focus) => ({ fullstack: 'full-stack', frontend: 'frontend', backend: 'backend', data: 'data/cloud' }[focus] || 'software');

const difficultyGuidance = {
  entry: 'FOUNDATIONAL: ask definitions, core concepts, straightforward implementation, basic debugging, simple project understanding. Do not ask staff-level architecture or advanced distributed-systems questions.',
  mid: 'PRACTICAL: ask implementation decisions, debugging, API/database design, testing, performance, trade-offs and real project execution. Avoid staff-level organizational leadership questions.',
  senior: 'ADVANCED: ask system design, scale, reliability, security, architecture trade-offs, migration strategy, technical leadership and ambiguous production scenarios. Do not reduce the interview to basic definitions.'
};

const typeGuidance = {
  technical: 'Every question must test technical knowledge or engineering problem solving.',
  behavioral: 'Every question must ask for a real past experience and encourage a Situation/Task/Action/Result answer.',
  hr: 'Every question must focus on career motivation, communication, collaboration, goals, ownership, values, and role expectations. Do not ask deep algorithm/system-design questions.',
  mixed: 'Mix technical, project and behavioral questions, but ensure each question has a distinct purpose.'
};

const focusTopics = {
  fullstack: ['frontend-backend integration', 'API design', 'data flow', 'authentication', 'performance', 'testing', 'deployment'],
  frontend: ['component architecture', 'state management', 'rendering performance', 'accessibility', 'browser behavior', 'testing', 'UI architecture'],
  backend: ['API design', 'authentication', 'database design', 'caching', 'security', 'observability', 'scalability'],
  data: ['SQL', 'data modeling', 'pipelines', 'analytics', 'data quality', 'cloud infrastructure', 'performance']
};

const focusTechnicalTemplates = {
  entry: {
    fullstack: [
      'Walk through the basic request flow from a browser action to a backend response in a full-stack application.',
      'What is the purpose of separating frontend, backend and database responsibilities?',
      'How would you debug a data flow problem where the UI shows the wrong value?',
      'Explain one API integration you have actually built and how you tested it.'
    ],
    frontend: [
      'How do you organize reusable UI components in the frontend technologies listed on your resume?',
      'What is the difference between local component state and data passed into a component?',
      'How would you debug a UI feature that works on one screen but breaks on another?',
      'How do you make a frontend page accessible and usable across different screen sizes?'
    ],
    backend: [
      'What makes an API endpoint well structured and easy for another developer to consume?',
      'How would you validate input before storing it in a database?',
      'What is the difference between authentication and authorization?',
      'How would you debug a backend request that returns an unexpected result?'
    ],
    data: [
      'What is the purpose of a database index and when would you use one?',
      'Explain the difference between a table row and a database relationship.',
      'How would you validate that imported data is complete and consistent?',
      'How would you investigate a slow database query?'
    ]
  },
  mid: {
    fullstack: [
      'How would you design data flow between a frontend, API layer and database so failures are handled cleanly?',
      'A full-stack feature becomes slow as usage grows. Which layer would you measure first and why?',
      'How would you design authentication and error handling across a frontend and backend?',
      'How do you decide whether a performance issue belongs in the UI, API or database layer?'
    ],
    frontend: [
      'How would you prevent unnecessary rendering and keep a growing frontend application responsive?',
      'How would you structure state management when several screens depend on the same server data?',
      'How would you test a complex UI feature at unit, integration and end-to-end levels?',
      'How would you design a reusable component system without creating excessive coupling?'
    ],
    backend: [
      'How would you design a production API with validation, authentication, consistent errors and observability?',
      'An endpoint becomes slow under higher traffic. How would you isolate whether the bottleneck is code, database or infrastructure?',
      'How would you choose indexes and query patterns for a growing database?',
      'How would you introduce caching without creating stale or inconsistent data?'
    ],
    data: [
      'How would you design a data model for a growing application while keeping common queries efficient?',
      'How would you investigate a slow SQL query using evidence rather than guessing?',
      'How would you design a reliable data pipeline with validation and retry handling?',
      'How would you detect and handle duplicate or inconsistent data in an analytics workflow?'
    ]
  },
  senior: {
    fullstack: [
      'Design a scalable full-stack architecture for a rapidly growing product and explain the main trade-offs and failure modes.',
      'How would you plan a migration of a full-stack application without interrupting existing users?',
      'A critical user journey has intermittent failures across the UI, API and database. How would you lead the investigation?',
      'How would you choose architecture boundaries when a full-stack codebase has become difficult to change safely?'
    ],
    frontend: [
      'Design a frontend architecture for a large product with many teams. Explain boundaries, shared components, performance and accessibility trade-offs.',
      'How would you migrate a large frontend from an aging architecture while keeping feature delivery moving?',
      'A major rendering regression appears after a release. How would you isolate the cause and decide between rollback and forward-fix?',
      'How would you establish frontend reliability standards across multiple engineering teams?'
    ],
    backend: [
      'Design a backend architecture for rapid growth. Explain scaling boundaries, failure isolation, data consistency and observability.',
      'How would you migrate a critical backend service while maintaining availability and a safe rollback path?',
      'A latency regression appears after a deployment. How would you lead root-cause analysis across application, database and infrastructure layers?',
      'How would you decide when to split a backend system into services and when to keep a modular monolith?'
    ],
    data: [
      'Design a reliable data platform for rapidly growing analytical workloads. Explain storage, processing, data quality and cost trade-offs.',
      'How would you migrate a critical data pipeline without losing or duplicating production data?',
      'A dashboard suddenly shows inconsistent business numbers. How would you lead the investigation from source data to presentation?',
      'How would you balance data freshness, correctness, cost and operational complexity in a large analytics system?'
    ]
  }
};

const deterministicTemplates = {
  entry: {
    technical: [
      'Explain the basic purpose of {tech} and describe one feature you have actually used with it.',
      'How would you debug a feature that works locally but fails in the browser or development environment?',
      'What is the difference between an API request and a database query, and where would each be used in your application?',
      'Walk through how data moves from a user action to the backend and back to the UI in one of your projects.'
    ],
    behavioral: [
      'Tell me about a project where you had to learn a technology quickly. What did you do first?',
      'Describe a time you received critical feedback on your work. How did you respond?',
      'Tell me about a bug you struggled with and how you eventually found the cause.',
      'Describe a time you had to complete a project with a deadline. How did you organize the work?'
    ],
    hr: [
      'Why are you interested in this {role} role, and what are you currently trying to improve?',
      'Which type of engineering work do you enjoy most and why?',
      'What are your main career goals for the next few years?',
      'How do you communicate when you do not understand a task or requirement?'
    ]
  },
  mid: {
    technical: [
      'In a {focus} application, how would you design {tech} usage so the code remains maintainable as the feature set grows?',
      'A production endpoint becomes slow after traffic increases. Walk through the measurements and debugging steps you would take before changing the architecture.',
      'How would you design validation, error handling and authentication for a production API?',
      'How would you decide between improving an existing implementation and introducing a new library or architectural pattern?'
    ],
    behavioral: [
      'Tell me about a technical decision you disagreed with. How did you use evidence to reach a decision with the team?',
      'Describe a project where requirements changed after implementation started. How did you adapt?',
      'Tell me about a production issue or difficult bug you owned. What did you change afterward to prevent recurrence?',
      'Describe a time you had to balance delivery speed with code quality. What trade-off did you make?'
    ],
    hr: [
      'What type of team environment helps you perform your best as a {role}?',
      'How do you prioritize competing requests from product, engineering and users?',
      'Tell me about a professional goal you set and how you measured progress toward it.',
      'What would you expect from your manager and teammates in a mid-level engineering role?'
    ]
  },
  senior: {
    technical: [
      'Design a scalable {focus} architecture for a rapidly growing product. Explain the key trade-offs, failure modes and observability strategy.',
      'You inherit a critical service with reliability problems and limited tests. What is your first 30-day technical plan?',
      'How would you plan a migration from a legacy architecture to a new design while keeping the existing system available?',
      'A major latency regression appears after a deployment. Explain how you would isolate the root cause and decide whether to roll back, mitigate, or continue forward.'
    ],
    behavioral: [
      'Tell me about an architecture or engineering decision where you had to influence people without direct authority. What evidence changed the outcome?',
      'Describe a high-impact incident where you were responsible for coordinating the technical response. What did you learn?',
      'Tell me about a time you reduced technical debt without stopping product delivery. How did you choose what to address?',
      'Describe a time you mentored engineers through a difficult technical problem. How did you measure whether the team improved?'
    ],
    hr: [
      'What does technical leadership mean to you when you are not the direct manager?',
      'How do you handle disagreement between product priorities and long-term engineering health?',
      'What kind of organizational problem would you want to own in your next {role} position?',
      'How do you decide when to push for architectural change versus accepting an existing constraint?'
    ]
  }
};

const buildDeterministicQuestions = ({ targetRole, interviewType, difficulty, duration, focus, resumeText, recentQuestions = [] }) => {
  const count = getQuestionCountForDuration(duration);
  const highlights = extractResumeHighlights(resumeText);
  const tech = highlights.technologies[0] || (focus === 'frontend' ? 'the frontend stack' : focus === 'backend' ? 'the backend stack' : 'the technologies in your resume');
  const pool = deterministicTemplates[difficulty] || deterministicTemplates.mid;
  const types = interviewType === 'mixed' ? ['technical', 'behavioral', 'project', 'technical', 'behavioral', 'technical', 'project', 'behavioral'] : [interviewType];
  const recentSet = new Set((recentQuestions || []).map((q) => String(q).trim().toLowerCase()));
  const questions = [];

  const projectQuestion = (index) => {
    const project = highlights.projects[index % Math.max(1, highlights.projects.length)] || 'one of your resume projects';
    if (difficulty === 'entry') return `Walk me through your contribution to ${project}. What did you build yourself and what did you learn?`;
    if (difficulty === 'mid') return `For ${project}, what was the main technical challenge, how did you solve it, and what would you improve now?`;
    return `For ${project}, explain the most important architectural trade-off you made, its constraints, and how you would redesign it at significantly larger scale.`;
  };

  let seed = 0;
  while (questions.length < count && seed < 50) {
    const type = types[seed % types.length];
    let questionText;
    if (type === 'project') {
      questionText = projectQuestion(seed);
    } else {
      const templateList = type === 'technical'
        ? (focusTechnicalTemplates[difficulty]?.[focus] || pool.technical)
        : (pool[type] || pool.technical);
      const template = templateList[seed % templateList.length];
      questionText = template
        .replaceAll('{role}', targetRole)
        .replaceAll('{tech}', tech)
        .replaceAll('{focus}', normalizeFocus(focus));
    }

    const normalized = questionText.toLowerCase();
    if (!recentSet.has(normalized) && !questions.some((q) => q.questionText.toLowerCase() === normalized)) {
      questions.push({
        questionText,
        questionType: type === 'project' ? 'project' : type,
        difficulty,
        focus,
        targetRole,
        expectedTopics: type === 'project' ? ['Project ownership', 'Technical decisions', difficulty === 'senior' ? 'Architecture trade-offs' : 'Problem solving'] : focusTopics[focus] || [],
        order: questions.length + 1
      });
    }
    seed++;
  }

  return questions.slice(0, count);
};

const generateOpenAIQuestions = async ({ targetRole, interviewType, difficulty, duration, focus, resumeText, recentQuestions = [] }) => {
  const count = getQuestionCountForDuration(duration);
  const highlights = extractResumeHighlights(resumeText);
  const prompt = `You are ResumeIQ's adaptive interview generation engine.
Generate EXACTLY ${count} questions for a ${difficulty} ${targetRole} mock interview.

INTERVIEW TYPE: ${interviewType}
DOMAIN FOCUS: ${focus}
FOCUS DESCRIPTION: ${normalizeFocus(focus)}
DIFFICULTY RULE: ${difficultyGuidance[difficulty]}
TYPE RULE: ${typeGuidance[interviewType]}

CRITICAL RULES:
1. Difficulty must materially change the cognitive level. Entry = fundamentals; Mid = practical implementation/trade-offs; Senior = architecture/scale/leadership.
2. Interview type must materially change the question style.
3. Domain focus must materially change the technical topics.
4. Ground technical/project questions ONLY in technologies/projects actually present in the resume. Never assume React, Node.js, AWS, etc. if they are absent.
5. Do not repeat or paraphrase any recent question below.
6. Every question must have a distinct purpose. Avoid generic duplicates.
7. Behavioral questions must ask about real experiences; HR questions should not become system-design questions.
8. If the resume lacks enough technical evidence, ask questions about verified projects/skills and general role fundamentals instead of inventing technologies.

VERIFIED RESUME TECHNOLOGIES: ${JSON.stringify(highlights.technologies)}
RESUME PROJECT/EXPERIENCE HIGHLIGHTS: ${JSON.stringify(highlights.projects)}
RESUME EXCERPT:
"""
${(resumeText || '').slice(0, 6000)}
"""

RECENT QUESTIONS TO AVOID:
${JSON.stringify(recentQuestions.slice(0, 25))}

Return JSON only:
{
  "questions": [
    {
      "questionText": "string",
      "questionType": "technical | behavioral | hr | situational | project | mixed",
      "difficulty": "${difficulty}",
      "focus": "${focus}",
      "targetRole": "${targetRole}",
      "expectedTopics": ["topic1", "topic2"],
      "order": 1
    }
  ]
}`;

  const completion = await openaiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are ResumeIQ adaptive interview engine. Return valid JSON only.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.65
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('AI returned empty response for interview generation');
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed.questions) || parsed.questions.length < count) throw new Error('AI returned too few interview questions');

  const recentSet = new Set(recentQuestions.map((q) => String(q).trim().toLowerCase()));
  return parsed.questions.slice(0, count).map((q, idx) => ({
    questionText: String(q.questionText || '').trim(),
    questionType: ['technical', 'behavioral', 'hr', 'situational', 'project', 'mixed'].includes(q.questionType) ? q.questionType : 'technical',
    difficulty,
    focus,
    targetRole,
    expectedTopics: Array.isArray(q.expectedTopics) ? q.expectedTopics.map(String).slice(0, 6) : [],
    order: idx + 1
  })).filter((q) => q.questionText && !recentSet.has(q.questionText.toLowerCase())).slice(0, count);
};

const generateInterviewQuestions = async (params) => {
  const { targetRole, interviewType = 'mixed', difficulty = 'mid', duration = 30, focus = 'fullstack', resumeText = '', recentQuestions = [] } = params;

  if (openaiClient && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-api-key')) {
    try {
      const questions = await generateOpenAIQuestions(params);
      if (questions.length === getQuestionCountForDuration(duration)) return questions;
    } catch (err) {
      console.warn('[Interview Generation AI fallback]:', err.message);
    }
  }

  return buildDeterministicQuestions({ targetRole, interviewType, difficulty, duration, focus, resumeText, recentQuestions });
};

module.exports = {
  generateInterviewQuestions,
  extractResumeHighlights
};
