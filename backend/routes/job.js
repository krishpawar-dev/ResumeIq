const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  analyzeJob,
  matchJob,
  getJobMatches,
  getJobMatchById,
  getJobById,
  deleteJobMatch
} = require('../controllers/jobController');
const { runXRay, detectGhost } = require('../controllers/intelligenceController');

const { aiRateLimiter, aiBurstLimiter } = require('../middlewares/rateLimiters');
const { validateObjectIdParam } = require('../utils/querySanitizer');

// All job routes are protected by JWT authentication
router.use(protect);

router.post('/analyze', aiBurstLimiter, aiRateLimiter, analyzeJob);
router.post('/match', aiBurstLimiter, aiRateLimiter, matchJob);
router.get('/matches', getJobMatches);
router.get('/matches/:id', validateObjectIdParam('id'), getJobMatchById);
router.delete('/matches/:id', validateObjectIdParam('id'), deleteJobMatch);

// Phase 7: Job Intelligence Features
router.post('/xray', aiBurstLimiter, aiRateLimiter, runXRay);
router.post('/ghost-detect', aiBurstLimiter, aiRateLimiter, detectGhost);

router.get('/:id', validateObjectIdParam('id'), getJobById);

module.exports = router;
