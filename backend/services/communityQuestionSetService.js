const CommunityQuestionSet = require('../models/CommunityQuestionSet');
const mongoose = require('mongoose');

const STARTER_SETS = [
  {
    title: 'Frontend System Design & Web Performance',
    description: 'High-frequency frontend interview questions covering state architectures, critical rendering paths, and asset bundle optimization.',
    category: 'technical',
    isPublic: true,
    questions: [
      {
        questionText: 'Walk through how you design an infinite-scrolling feed with 10,000+ items, ensuring 60fps scrolling and minimal DOM nodes.',
        category: 'technical',
        difficulty: 'senior',
        expectedTopics: ['Virtualization / Windowing', 'Recycling DOM nodes', 'IntersectionObserver', 'Memory cleanup']
      },
      {
        questionText: 'How would you diagnose and fix a sudden Core Web Vitals regression in Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)?',
        category: 'technical',
        difficulty: 'mid',
        expectedTopics: ['Critical rendering path', 'Resource hints (preload)', 'Font loading', 'Image dimension reservations']
      },
      {
        questionText: 'Explain the architectural trade-offs between Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG).',
        category: 'technical',
        difficulty: 'mid',
        expectedTopics: ['Time-to-first-byte (TTFB)', 'Time-to-interactive (TTI)', 'SEO optimization', 'Server infrastructure cost']
      }
    ]
  },
  {
    title: 'Behavioral & STAR Leadership Masterclass',
    description: 'Executive behavioral questions designed to evaluate leadership maturity, high-stakes stakeholder influence, and crisis management.',
    category: 'behavioral',
    isPublic: true,
    questions: [
      {
        questionText: 'Tell me about a time you had to deliver bad news to leadership regarding an unforeseen roadmap delay or architecture failure.',
        category: 'behavioral',
        difficulty: 'senior',
        expectedTopics: ['Transparency', 'Root cause ownership', 'Corrective action plan', 'STAR framework']
      },
      {
        questionText: 'Describe an instance where cross-team dependencies threatened your project timeline. How did you negotiate alignment across teams?',
        category: 'behavioral',
        difficulty: 'mid',
        expectedTopics: ['Cross-functional influence', 'Dependency mapping', 'Risk mitigation']
      },
      {
        questionText: 'Tell me about a time you received constructive or difficult critical feedback on your engineering approach. What did you learn and apply?',
        category: 'behavioral',
        difficulty: 'mid',
        expectedTopics: ['Growth mindset', 'Receptiveness', 'Measurable adaptation']
      }
    ]
  },
  {
    title: 'Distributed Systems & Cloud Reliability',
    description: 'Practical cloud infrastructure questions covering high availability, distributed caching, partition tolerance, and message brokers.',
    category: 'technical',
    isPublic: true,
    questions: [
      {
        questionText: 'Explain how you guarantee idempotent transaction processing in an asynchronous microservices system using Kafka or RabbitMQ.',
        category: 'technical',
        difficulty: 'senior',
        expectedTopics: ['Idempotency keys', 'Outbox pattern', 'At-least-once delivery', 'Distributed deduplication']
      },
      {
        questionText: 'How do you design a multi-region active-active database architecture while managing data consistency trade-offs (CAP theorem)?',
        category: 'technical',
        difficulty: 'senior',
        expectedTopics: ['Eventual consistency', 'CRDTs', 'Conflict resolution', 'Replication latency']
      }
    ]
  }
];

/**
 * Seed default community sets if none exist
 */
const seedStarterSetsIfEmpty = async (systemUserId) => {
  const count = await CommunityQuestionSet.countDocuments({ isPublic: true });
  if (count === 0 && systemUserId) {
    for (const set of STARTER_SETS) {
      await CommunityQuestionSet.create({
        ownerId: systemUserId,
        ...set
      });
    }
  }
};

/**
 * Get question sets accessible to user (their own + public sets)
 */
const getAccessibleSets = async (userId) => {
  await seedStarterSetsIfEmpty(userId);

  const [mySets, publicSets] = await Promise.all([
    CommunityQuestionSet.find({ ownerId: userId }).sort({ updatedAt: -1 }),
    CommunityQuestionSet.find({ isPublic: true, ownerId: { $ne: userId } }).sort({ practiceCount: -1, createdAt: -1 })
  ]);

  return { mySets, publicSets };
};

/**
 * Create a new user-owned question set
 */
const createQuestionSet = async (userId, data) => {
  const { title, description, category, isPublic, questions } = data;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('Title is required for question set.');
  }

  const set = await CommunityQuestionSet.create({
    ownerId: userId,
    title: title.trim(),
    description: (description || '').trim(),
    category: category || 'mixed',
    isPublic: Boolean(isPublic),
    questions: Array.isArray(questions) ? questions : []
  });

  return set;
};

/**
 * Update an existing user-owned question set
 */
const updateQuestionSet = async (userId, setId, data) => {
  const set = await CommunityQuestionSet.findOne({ _id: setId, ownerId: userId });
  if (!set) {
    throw new Error('Question set not found or you do not have permission to edit it.');
  }

  if (data.title) set.title = data.title.trim();
  if (data.description !== undefined) set.description = data.description.trim();
  if (data.category) set.category = data.category;
  if (data.isPublic !== undefined) set.isPublic = Boolean(data.isPublic);
  if (Array.isArray(data.questions)) set.questions = data.questions;

  await set.save();
  return set;
};

/**
 * Delete a user-owned question set
 */
const deleteQuestionSet = async (userId, setId) => {
  const set = await CommunityQuestionSet.findOne({ _id: setId, ownerId: userId });
  if (!set) {
    throw new Error('Question set not found or you do not have permission to delete it.');
  }

  await CommunityQuestionSet.deleteOne({ _id: set._id });
  return true;
};

module.exports = {
  getAccessibleSets,
  createQuestionSet,
  updateQuestionSet,
  deleteQuestionSet,
  seedStarterSetsIfEmpty
};
