const OpenAI = require('openai');
const CareerPath = require('../models/CareerPath');
const LearningRoadmap = require('../models/LearningRoadmap');
const Resume = require('../models/Resume');
const JobMatch = require('../models/JobMatch');
const interviewAnalyticsService = require('./interviewAnalyticsService');

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Fallback contextual career analysis generator grounded in user's profile and target role
 */
const generateContextualCareerAnalysis = ({
  targetRole,
  currentRole,
  experience,
  currentSkills,
  goals,
  industryPreference = 'Technology',
  targetIndustry = 'Technology',
  interviewWeakness = null
}) => {
  const roleLower = (targetRole || 'Software Engineer').toLowerCase();

  // Determine typical required target competencies
  let targetCompetencies = [];
  if (roleLower.includes('frontend') || roleLower.includes('ui') || roleLower.includes('web')) {
    targetCompetencies = [
      { skill: 'Advanced React & State Architecture', importance: 'high', targetLevel: 5, reason: 'Essential for leading modern frontend systems and performance optimization.' },
      { skill: 'Frontend System Design & Web Vitals', importance: 'high', targetLevel: 4, reason: 'Key requirement for senior UI evaluations and large scale micro-frontends.' },
      { skill: 'TypeScript & Type Systems', importance: 'medium', targetLevel: 4, reason: 'Standard industry requirement for enterprise code reliability.' },
      { skill: 'End-to-End Testing & CI/CD Pipeline', importance: 'medium', targetLevel: 4, reason: 'Vital for high-velocity deployment confidence.' }
    ];
  } else if (roleLower.includes('backend') || roleLower.includes('api') || roleLower.includes('distributed')) {
    targetCompetencies = [
      { skill: 'Distributed Systems & Microservices', importance: 'high', targetLevel: 5, reason: 'Core architecture foundation for resilient backend services.' },
      { skill: 'Database Optimization & Indexing', importance: 'high', targetLevel: 4, reason: 'Crucial for high-throughput transactional and analytical workloads.' },
      { skill: 'Containerization & Cloud Infrastructure (Docker/AWS)', importance: 'medium', targetLevel: 4, reason: 'Modern standard for deploying scalable services.' },
      { skill: 'Caching Strategies & Message Queues (Redis/Kafka)', importance: 'medium', targetLevel: 4, reason: 'Critical for decoupling microservices and sub-millisecond latency.' }
    ];
  } else if (roleLower.includes('full stack') || roleLower.includes('lead') || roleLower.includes('architect')) {
    targetCompetencies = [
      { skill: 'End-to-End System Design & Cloud Architecture', importance: 'high', targetLevel: 5, reason: 'Required to make high-impact cross-stack engineering decisions.' },
      { skill: 'Production Monitoring & Reliability Engineering', importance: 'high', targetLevel: 4, reason: 'Ensures zero-downtime deployments and fast incident recovery.' },
      { skill: 'Cross-functional Technical Leadership', importance: 'medium', targetLevel: 4, reason: 'Directly evaluated in senior behavioral screens.' },
      { skill: 'API Security & OAuth/JWT Best Practices', importance: 'medium', targetLevel: 4, reason: 'Essential for enterprise-grade applications.' }
    ];
  } else {
    targetCompetencies = [
      { skill: `${targetRole} Core Competencies`, importance: 'high', targetLevel: 5, reason: `Foundational knowledge for ${targetRole}.` },
      { skill: 'System Architecture & Scalability', importance: 'high', targetLevel: 4, reason: 'High-leverage capability expected across modern tech roles.' },
      { skill: 'Engineering Productivity & Automation', importance: 'medium', targetLevel: 4, reason: 'Streamlines operational workflows.' }
    ];
  }

  // Calculate current skill overlap vs gap
  const userSkillSet = new Set((currentSkills || []).map((s) => s.toLowerCase().trim()));
  const skillGap = targetCompetencies.map((comp) => {
    const hasSkill = Array.from(userSkillSet).some((userSkill) =>
      comp.skill.toLowerCase().includes(userSkill) || userSkill.includes(comp.skill.toLowerCase())
    );
    return {
      skill: comp.skill,
      importance: comp.importance,
      currentLevel: hasSkill ? 3 : 2,
      targetLevel: comp.targetLevel,
      reason: comp.reason
    };
  });

  // Career progression steps
  const progression = [
    {
      title: currentRole || 'Associate Engineer',
      requiredSkills: currentSkills.slice(0, 4),
      learningPlan: [
        'Solidify fundamentals and core programming patterns',
        'Learn automated testing workflows and unit test coverage',
        'Contribute to feature branches and team code reviews'
      ],
      suggestedProjects: [
        {
          projectTitle: 'Modular Component Library or REST Utility',
          skillsPracticed: ['Code Quality', 'Unit Testing', 'Documentation'],
          description: 'Build a reusable library demonstrating clean separation of concerns and automated testing.',
          difficulty: 'beginner'
        }
      ],
      interviewPrep: [
        'Core algorithmic problem solving and data structures',
        'STAR format behavioral drills for collaboration and learning from mistakes'
      ]
    },
    {
      title: `${targetRole.replace(/senior|lead|staff/i, '').trim() || 'Mid-Level Specialist'}`,
      requiredSkills: [
        targetCompetencies[0]?.skill || 'System Architecture',
        targetCompetencies[1]?.skill || 'State Management',
        'Code Reviews & Mentorship'
      ],
      learningPlan: [
        'Deep dive into asynchronous execution, performance profiling, and caching',
        'Design resilient APIs with robust validation and security',
        'Drive small-to-medium project initiatives independently'
      ],
      suggestedProjects: [
        {
          projectTitle: 'High-Concurrency Real-Time Analytics Dashboard',
          skillsPracticed: ['State Management', 'WebSockets', 'Performance Profiling'],
          description: 'A production-grade dashboard supporting live updates, optimistic UI, and automated integration tests.',
          difficulty: 'intermediate'
        }
      ],
      interviewPrep: [
        'Technical trade-offs and architectural decision defenses',
        'Situational questions on handling ambiguous technical requirements'
      ]
    },
    {
      title: targetRole,
      requiredSkills: targetCompetencies.map((c) => c.skill),
      learningPlan: [
        'Master large-scale distributed architecture and fault tolerance',
        'Conduct cross-functional system design reviews and establish engineering standards',
        'Lead incident post-mortems and proactive capacity planning'
      ],
      suggestedProjects: [
        {
          projectTitle: 'Enterprise Multi-Tenant SaaS Platform with RBAC',
          skillsPracticed: ['System Design', 'Cloud Architecture', 'Security & Scale'],
          description: 'Full-featured distributed system featuring microservices, distributed caching, and zero-downtime CI/CD.',
          difficulty: 'advanced'
        }
      ],
      interviewPrep: [
        'Senior System Design rounds (scalability, failure modes, trade-offs)',
        interviewWeakness
          ? `Targeted practice for ${interviewWeakness} (identified as key growth opportunity in your analytics)`
          : 'Executive behavioral leadership and cross-functional conflict resolution'
      ]
    }
  ];

  // Learning Roadmap Items
  const roadmapItems = [
    {
      title: `Master ${targetCompetencies[0]?.skill || 'Architecture'} Fundamentals`,
      skill: targetCompetencies[0]?.skill || 'Architecture',
      priority: 'high',
      description: 'Study scalable patterns, memory management, and latency optimizations required for target role interviews.',
      estimatedEffort: '2-3 weeks',
      resources: [
        'Official documentation and engineering architecture blogs (e.g., Netflix Tech Blog, Stripe Engineering)',
        'Open source reference architectures on GitHub'
      ],
      projectIdea: 'Implement a proof-of-concept demonstrating clean caching and error boundaries.',
      completed: false
    },
    {
      title: `Build Hands-On Portfolio Project: Real-Time Scalable System`,
      skill: targetCompetencies[1]?.skill || 'System Design',
      priority: 'high',
      description: 'Create an end-to-end demonstrable application showcasing senior technical decisions and quantitative metrics.',
      estimatedEffort: '3-4 weeks',
      resources: [
        'Production architecture design guides',
        'Load testing frameworks (k6 or Artillery)'
      ],
      projectIdea: 'High-throughput system with documented benchmarks and architectural diagrams.',
      completed: false
    },
    {
      title: `Interview Drills: System Design & Technical Defense`,
      skill: 'Interview Readiness',
      priority: 'medium',
      description: 'Practice articulating technical trade-offs using structured frameworks and defending design decisions.',
      estimatedEffort: '1-2 weeks',
      resources: [
        'ResumeIQ Practice Modes (Category Focus & Timed Practice)',
        'System Design Primer & Architectural Whitepapers'
      ],
      projectIdea: 'Record mock interview answers evaluating clarity, technical accuracy, and STAR structure.',
      completed: false
    },
    {
      title: `Refine Behavioral Leadership & STAR Scenarios`,
      skill: 'Behavioral & Leadership',
      priority: 'medium',
      description: 'Formulate structured responses for challenging situations: technical disagreements, failure recovery, and cross-team alignment.',
      estimatedEffort: '1 week',
      resources: [
        'ResumeIQ Category Focus: Behavioral Mode',
        'STAR Method Framework guidelines'
      ],
      projectIdea: 'Draft 5 detailed STAR story anchors covering your most impactful past projects.',
      completed: false
    }
  ];

  const aiSummary = `AI-generated career guidance based on your current experience as ${currentRole || 'an engineer'} and your goal to advance into ${targetRole} in the ${targetIndustry} industry. Focus on bridging gaps in ${targetCompetencies[0]?.skill} and ${targetCompetencies[1]?.skill} through targeted projects and systematic interview preparation. Note: this is guidance, not a guaranteed career prediction.`;

  return {
    aiSummary,
    skillGap,
    progression,
    roadmapItems
  };
};

/**
 * Main Career Analysis Service
 */
const careerAnalysisService = {
  /**
   * Run comprehensive AI Career Path and Roadmap Analysis
   */
  async analyzeCareerPath(userId, {
    targetRole,
    industryPreference = 'Technology',
    targetIndustry = 'Technology',
    careerGoal = '',
    customSkills = [],
    resumeId = null
  }) {
    if (!targetRole || typeof targetRole !== 'string') {
      throw new Error('Target role is required for career path analysis.');
    }

    // 1. Gather User Context: Resumes, Profile, Job Matches, Analytics
    let currentSkills = customSkills || [];
    let currentRole = '';
    let currentExperience = '';

    try {
      const query = resumeId ? { _id: resumeId, userId } : { userId };
      const resume = await Resume.findOne(query).sort({ createdAt: -1 });
      if (resume) {
        if (resume.jobTitle && !currentRole) currentRole = resume.jobTitle;
        if (resume.experienceYears) currentExperience = `${resume.experienceYears} years`;
        if (resume.skills && resume.skills.length > 0) {
          const extracted = resume.skills.map((s) => (typeof s === 'string' ? s : s.name)).filter(Boolean);
          currentSkills = Array.from(new Set([...currentSkills, ...extracted]));
        }
      }
    } catch (err) {
      console.warn('[Career Analysis] Error fetching resume context:', err.message);
    }

    // Default current role if unspecified
    if (!currentRole) currentRole = 'Software Engineer';
    if (currentSkills.length === 0) {
      currentSkills = ['JavaScript', 'React', 'Node.js', 'Git', 'REST APIs'];
    }

    // 2. Fetch Interview Analytics context if available
    let interviewWeakness = null;
    try {
      const analytics = await interviewAnalyticsService.getAnalytics(userId);
      if (analytics?.weakestCriterion?.criterion) {
        interviewWeakness = analytics.weakestCriterion.criterion;
      }
    } catch (err) {
      console.warn('[Career Analysis] Could not fetch interview analytics:', err.message);
    }

    // 3. AI Generation
    let analysisResult = null;

    if (openaiClient) {
      try {
        const prompt = `You are a Principal Career Architect and Technical Advisor. Analyze this candidate's background and produce a realistic, structured career progression and learning roadmap toward their target role.

Candidate Profile:
- Current Role: ${currentRole}
- Current Experience: ${currentExperience || 'Mid-level'}
- Current Skills: ${currentSkills.join(', ')}
- Target Role: ${targetRole}
- Target Industry: ${targetIndustry || industryPreference}
- Career Goal: ${careerGoal || 'Long-term career advancement and technical leadership'}
${interviewWeakness ? `- Current Interview Weakness to Target: ${interviewWeakness}` : ''}

Respond with ONLY valid JSON (no markdown formatting, no code fences) with the exact structure:
{
  "aiSummary": "String summarizing profile and target role path honestly as AI guidance",
  "skillGap": [
    {
      "skill": "String skill name",
      "importance": "high" | "medium" | "low",
      "currentLevel": Number (1-5),
      "targetLevel": Number (1-5),
      "reason": "String explaining why this skill matters for target role"
    }
  ],
  "progression": [
    {
      "title": "String role title",
      "requiredSkills": ["skill1", "skill2"],
      "learningPlan": ["action1", "action2"],
      "suggestedProjects": [
        {
          "projectTitle": "String title",
          "skillsPracticed": ["skill1", "skill2"],
          "description": "String project summary",
          "difficulty": "beginner" | "intermediate" | "advanced"
        }
      ],
      "interviewPrep": ["prep topic 1", "prep topic 2"]
    }
  ],
  "roadmapItems": [
    {
      "title": "String action item",
      "skill": "String skill",
      "priority": "high" | "medium" | "low",
      "description": "String actionable instructions",
      "estimatedEffort": "e.g. 2-3 weeks",
      "resources": ["Descriptive resource 1", "Descriptive resource 2"],
      "projectIdea": "String project suggestion"
    }
  ]
}`;

        const response = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert career intelligence engine that outputs only valid structured JSON for career progression and skill gaps.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.4
        });

        const rawContent = response.choices[0].message.content.trim();
        const cleaned = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.skillGap && parsed.progression && parsed.roadmapItems) {
          analysisResult = parsed;
        }
      } catch (aiErr) {
        console.warn('[Career Analysis] OpenAI failed, using contextual generator:', aiErr.message);
      }
    }

    if (!analysisResult) {
      analysisResult = generateContextualCareerAnalysis({
        targetRole,
        currentRole,
        experience: currentExperience,
        currentSkills,
        goals: careerGoal,
        industryPreference,
        targetIndustry,
        interviewWeakness
      });
    }

    // 4. Deactivate prior active paths
    await CareerPath.updateMany({ userId, isActive: true }, { isActive: false });

    // 5. Persist CareerPath
    const careerPath = new CareerPath({
      userId,
      currentRole,
      currentExperience,
      currentSkills,
      industryPreference,
      careerGoal,
      targetRole,
      targetIndustry,
      skillGap: analysisResult.skillGap,
      progression: analysisResult.progression,
      aiSummary: analysisResult.aiSummary,
      isActive: true
    });
    await careerPath.save();

    // 6. Persist LearningRoadmap
    const roadmap = new LearningRoadmap({
      userId,
      careerPathId: careerPath._id,
      targetRole,
      items: analysisResult.roadmapItems.map((item) => ({
        ...item,
        completed: false
      })),
      overallProgress: 0
    });
    await roadmap.save();

    return {
      careerPath,
      roadmap
    };
  },

  /**
   * Get current active career path for authenticated user
   */
  async getActiveCareerPath(userId) {
    const careerPath = await CareerPath.findOne({ userId, isActive: true }).sort({ createdAt: -1 });
    return careerPath;
  },

  /**
   * Get active learning roadmap for authenticated user
   */
  async getActiveRoadmap(userId) {
    const roadmap = await LearningRoadmap.findOne({ userId }).sort({ createdAt: -1 });
    return roadmap;
  },

  /**
   * Toggle completion of a roadmap item
   */
  async toggleRoadmapItem(userId, itemId, completed) {
    const roadmap = await LearningRoadmap.findOne({ userId, 'items._id': itemId });
    if (!roadmap) {
      throw new Error('Roadmap item not found or unauthorized.');
    }

    const item = roadmap.items.id(itemId);
    if (!item) {
      throw new Error('Roadmap item not found.');
    }

    item.completed = typeof completed === 'boolean' ? completed : !item.completed;
    roadmap.recalculateProgress();
    await roadmap.save();

    return {
      roadmap,
      updatedItem: item
    };
  }
};

module.exports = careerAnalysisService;
