const OpenAI = require('openai');

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Validate raw job description input
 * @param {string} text
 */
const validateJobDescription = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Please provide a job description as text.');
  }

  const trimmed = text.trim();
  if (trimmed.length < 50) {
    throw new Error('Job description is too brief. Please paste at least 50 characters of job text.');
  }

  if (trimmed.length > 25000) {
    throw new Error('Job description exceeds the maximum limit of 25,000 characters.');
  }

  return trimmed;
};

/**
 * Fallback deterministic extraction when OpenAI is not configured
 */
const runDeterministicJobExtraction = (text) => {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  // 1. Detect Job Title
  let title = 'Target Role';
  const titleMatch = text.match(/(?:title|position|role|seeking an?|hiring an?)\s*[:\-]?\s*([A-Za-z0-9\s/]+(?:Engineer|Developer|Architect|Manager|Lead|Designer|Specialist|Scientist|Analyst))/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  } else {
    // Check first line
    const firstLine = text.split('\n')[0].trim();
    if (firstLine.length > 5 && firstLine.length < 60 && !firstLine.includes(':')) {
      title = firstLine;
    }
  }

  // 2. Detect Company
  let company = '';
  const companyMatch = text.match(/(?:at|company|about)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+is|\s+in|\s+team|\.|\n)/);
  if (companyMatch && companyMatch[1]) {
    company = companyMatch[1].trim();
  }

  // 3. Detect Experience Required
  let minYears = 3;
  let expSummary = '3+ years relevant experience';
  const yearsMatch = text.match(/(\d+)\+?\s*years?(?:\s+of)?(?:\s+experience)?/i);
  if (yearsMatch) {
    minYears = parseInt(yearsMatch[1], 10);
    expSummary = `${minYears}+ years experience required`;
  }

  // 4. Catalog of Known Skills and importance assignment
  const skillCatalog = [
    { name: 'React', category: 'technical', defaultImportance: 0.95 },
    { name: 'ReactJS', category: 'technical', defaultImportance: 0.95 },
    { name: 'TypeScript', category: 'technical', defaultImportance: 0.90 },
    { name: 'JavaScript', category: 'technical', defaultImportance: 0.85 },
    { name: 'Node.js', category: 'technical', defaultImportance: 0.90 },
    { name: 'NodeJS', category: 'technical', defaultImportance: 0.90 },
    { name: 'Python', category: 'technical', defaultImportance: 0.85 },
    { name: 'AWS', category: 'tool', defaultImportance: 0.85 },
    { name: 'Docker', category: 'tool', defaultImportance: 0.75 },
    { name: 'Kubernetes', category: 'tool', defaultImportance: 0.75 },
    { name: 'SQL', category: 'technical', defaultImportance: 0.80 },
    { name: 'PostgreSQL', category: 'technical', defaultImportance: 0.80 },
    { name: 'MongoDB', category: 'technical', defaultImportance: 0.75 },
    { name: 'Redis', category: 'technical', defaultImportance: 0.75 },
    { name: 'GraphQL', category: 'technical', defaultImportance: 0.70 },
    { name: 'REST APIs', category: 'technical', defaultImportance: 0.80 },
    { name: 'REST API', category: 'technical', defaultImportance: 0.80 },
    { name: 'Next.js', category: 'technical', defaultImportance: 0.80 },
    { name: 'Tailwind CSS', category: 'technical', defaultImportance: 0.65 },
    { name: 'CI/CD', category: 'methodology', defaultImportance: 0.75 },
    { name: 'Git', category: 'tool', defaultImportance: 0.70 },
    { name: 'System Design', category: 'domain', defaultImportance: 0.85 },
    { name: 'Microservices', category: 'domain', defaultImportance: 0.85 },
    { name: 'Agile', category: 'methodology', defaultImportance: 0.65 },
    { name: 'TDD', category: 'methodology', defaultImportance: 0.70 }
  ];

  const extractedSkills = [];
  for (const s of skillCatalog) {
    const regex = new RegExp(`\\b${s.name.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(text)) {
      // Check if it appears near "preferred" or "nice to have"
      const isPreferred = /(?:preferred|bonus|nice to have|plus|optional)/i.test(
        text.slice(Math.max(0, lower.indexOf(s.name.toLowerCase()) - 80), lower.indexOf(s.name.toLowerCase()) + 80)
      );

      extractedSkills.push({
        name: s.name,
        category: s.category,
        importance: isPreferred ? Math.max(0.4, s.defaultImportance - 0.2) : s.defaultImportance,
        requiredOrPreferred: isPreferred ? 'preferred' : 'required',
        context: `Identified in job requirements as ${isPreferred ? 'preferred qualification' : 'core capability'}.`
      });
    }
  }

  // Key Responsibilities
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('-') || l.startsWith('•') || l.startsWith('*'));
  const keyResponsibilities = lines.slice(0, 5).map((l) => l.replace(/^[-•*]\s*/, ''));

  return {
    title,
    company,
    extractedSkills,
    experienceRequired: {
      minYears,
      level: minYears >= 5 ? 'Senior' : minYears >= 2 ? 'Mid-Level' : 'Junior',
      summary: expSummary
    },
    educationRequired: lower.includes('bachelor') ? "Bachelor's degree in Computer Science or related field" : '',
    keyResponsibilities,
    metadata: {
      wordCount: words.length,
      analyzedAt: new Date()
    }
  };
};

/**
 * Call OpenAI to extract structured job requirements
 */
const runOpenAIJobExtraction = async (text) => {
  const prompt = `You are the lead career intelligence parsing engine for ResumeIQ.
Analyze the following job description and extract structured requirements.

Extract:
1. title: Specific Job Title (e.g. "Senior Full Stack Engineer")
2. company: Company Name if detected, otherwise ""
3. experienceRequired: { minYears: number, level: string, summary: string }
4. educationRequired: string (e.g. "Bachelor's in Computer Science or equivalent practical experience")
5. extractedSkills: array of objects with:
   - name: specific skill/technology name (e.g. "React", "AWS", "System Design")
   - category: 'technical' | 'soft' | 'tool' | 'domain' | 'methodology'
   - importance: number between 0.1 and 1.0 representing importance to this specific role (core must-haves = 0.85-1.0, secondary = 0.6-0.8, bonus = 0.3-0.5)
   - requiredOrPreferred: 'required' | 'preferred'
   - context: brief quote or context from the job description
6. keyResponsibilities: array of top 3-5 core responsibility strings

Job Description:
"""
${text.slice(0, 8000)}
"""

Respond ONLY with valid JSON following this exact structure.`;

  const completion = await openaiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are ResumeIQ job requirements extraction engine. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty response for job description.');

  const parsed = JSON.parse(content);

  // Validate extracted skills
  const skills = Array.isArray(parsed.extractedSkills)
    ? parsed.extractedSkills.map((s) => ({
        name: String(s.name || '').trim(),
        category: ['technical', 'soft', 'tool', 'domain', 'methodology'].includes(s.category)
          ? s.category
          : 'technical',
        importance: typeof s.importance === 'number' ? Math.min(1.0, Math.max(0.1, s.importance)) : 0.8,
        requiredOrPreferred: s.requiredOrPreferred === 'preferred' ? 'preferred' : 'required',
        context: String(s.context || '')
      })).filter((s) => s.name.length > 0)
    : [];

  return {
    title: String(parsed.title || 'Target Role').trim(),
    company: String(parsed.company || '').trim(),
    extractedSkills: skills,
    experienceRequired: {
      minYears: typeof parsed.experienceRequired?.minYears === 'number' ? parsed.experienceRequired.minYears : 0,
      level: String(parsed.experienceRequired?.level || 'Mid-Senior'),
      summary: String(parsed.experienceRequired?.summary || '')
    },
    educationRequired: String(parsed.educationRequired || ''),
    keyResponsibilities: Array.isArray(parsed.keyResponsibilities)
      ? parsed.keyResponsibilities.map(String)
      : [],
    metadata: {
      wordCount: text.split(/\s+/).filter(Boolean).length,
      analyzedAt: new Date()
    }
  };
};

/**
 * Main service method: Analyze and extract job description requirements
 * @param {string} rawText
 * @returns {Promise<object>} Structured job data
 */
const analyzeJobDescription = async (rawText) => {
  const validatedText = validateJobDescription(rawText);

  if (openaiClient && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-api-key')) {
    try {
      const result = await runOpenAIJobExtraction(validatedText);
      return { ...result, jobDescriptionText: validatedText, isAIPowered: true };
    } catch (err) {
      console.warn('[OpenAI Job Analysis Error - falling back to heuristic engine]:', err.message);
      const fallback = runDeterministicJobExtraction(validatedText);
      return { ...fallback, jobDescriptionText: validatedText, isAIPowered: false };
    }
  }

  const fallback = runDeterministicJobExtraction(validatedText);
  return { ...fallback, jobDescriptionText: validatedText, isAIPowered: false };
};

module.exports = {
  validateJobDescription,
  analyzeJobDescription
};
