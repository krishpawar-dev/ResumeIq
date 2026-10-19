const CommunityQuestionSet = require('../models/CommunityQuestionSet');
const { generateInterviewQuestions } = require('./interviewGenerationService');

const getCount = (duration = 15) => Math.max(3, Math.min(6, Math.round(Number(duration) / 3)));

const withPracticePrompt = async ({ sessionType, targetRole, resumeText, difficulty = 'mid', duration = 15, category = 'technical', companyName = '', recentQuestions = [], focus = 'fullstack' }) => {
  let interviewType = 'mixed';
  let count = 3;

  if (sessionType === 'category') {
    interviewType = category === 'project' ? 'mixed' : category;
    count = 4;
  } else if (sessionType === 'timed') {
    count = getCount(duration);
    interviewType = 'mixed';
  } else if (sessionType === 'flashcard') {
    count = 3;
    interviewType = 'mixed';
  } else if (sessionType === 'company') {
    count = 4;
    interviewType = 'mixed';
  }

  const questions = await generateInterviewQuestions({
    targetRole: sessionType === 'company' && companyName ? `${targetRole} at ${companyName}` : targetRole,
    interviewType,
    difficulty,
    duration: count === 3 ? 30 : count === 4 ? 30 : count === 5 ? 45 : 60,
    focus,
    resumeText,
    recentQuestions
  });

  return questions.slice(0, count).map((q, index) => ({
    ...q,
    order: index + 1,
    expectedTopics: q.expectedTopics?.length ? q.expectedTopics : ['Problem solving', 'Communication']
  }));
};

const generateFlashcardQuestions = (params) => withPracticePrompt({ ...params, sessionType: 'flashcard' });
const generateTimedQuestions = (params) => withPracticePrompt({ ...params, sessionType: 'timed' });
const generateCategoryQuestions = (params) => withPracticePrompt({ ...params, sessionType: 'category' });
const generateCompanyQuestions = (params) => withPracticePrompt({ ...params, sessionType: 'company' });

const loadCommunityQuestions = async (questionSetId) => {
  const set = await CommunityQuestionSet.findById(questionSetId);
  if (!set || !set.questions || set.questions.length === 0) {
    throw new Error('Community question set not found or contains no questions.');
  }

  set.practiceCount = (set.practiceCount || 0) + 1;
  await set.save();

  return set.questions.map((q, idx) => ({
    questionText: q.questionText,
    questionType: q.category || 'technical',
    difficulty: q.difficulty || 'mid',
    focus,
    targetRole: set.title,
    expectedTopics: q.expectedTopics || ['Community question expectations'],
    order: idx + 1
  }));
};

module.exports = {
  generateFlashcardQuestions,
  generateTimedQuestions,
  generateCategoryQuestions,
  generateCompanyQuestions,
  loadCommunityQuestions
};
