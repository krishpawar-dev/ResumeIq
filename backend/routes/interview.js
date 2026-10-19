const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  startInterview,
  submitAnswer,
  getInterviewById,
  getInterviewHistory,
  generateQuestions
} = require('../controllers/interviewController');

const {
  startPracticeSession,
  submitPracticeAnswer,
  completePracticeSession,
  getPracticeSessionById,
  getPracticeHistory
} = require('../controllers/practiceController');

const { getAnalytics } = require('../controllers/analyticsController');

const {
  getQuestionSets,
  createSet,
  updateSet,
  deleteSet
} = require('../controllers/communityController');

const { generateReverseInterview } = require('../controllers/phase7Controller');

const { aiRateLimiter, aiBurstLimiter } = require('../middlewares/rateLimiters');
const { validateObjectIdParam } = require('../utils/querySanitizer');

// All interview routes are JWT protected
router.use(protect);

// Analytics
router.get('/analytics', getAnalytics);

// Practice Sessions
router.post('/practice/start', aiBurstLimiter, aiRateLimiter, startPracticeSession);
router.post('/practice/:id/answer', validateObjectIdParam('id'), aiBurstLimiter, aiRateLimiter, submitPracticeAnswer);
router.post('/practice/:id/complete', validateObjectIdParam('id'), completePracticeSession);
router.get('/practice/history', getPracticeHistory);
router.get('/practice/:id', validateObjectIdParam('id'), getPracticeSessionById);

// Community Question Sets
router.get('/community/sets', getQuestionSets);
router.post('/community/sets', createSet);
router.put('/community/sets/:id', validateObjectIdParam('id'), updateSet);
router.delete('/community/sets/:id', validateObjectIdParam('id'), deleteSet);

// Mock Interviews
router.post('/start', aiBurstLimiter, aiRateLimiter, startInterview);
router.post('/answer', aiBurstLimiter, aiRateLimiter, submitAnswer);
router.post('/generate', aiBurstLimiter, aiRateLimiter, generateQuestions);
router.get('/history', getInterviewHistory);

// Phase 7: Reverse Interview
router.post('/:id/reverse-interview', validateObjectIdParam('id'), aiBurstLimiter, aiRateLimiter, generateReverseInterview);

router.get('/:id', validateObjectIdParam('id'), getInterviewById);

module.exports = router;
