const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  uploadResume,
  analyzeResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  improveSection,
  saveResumeVersion,
  getResumeVersions
} = require('../controllers/resumeController');
const { runResumeTruthDetector } = require('../controllers/phase7Controller');

const { aiRateLimiter, aiBurstLimiter } = require('../middlewares/rateLimiters');
const { validateObjectIdParam } = require('../utils/querySanitizer');

// All resume routes are protected by JWT authentication
router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.post('/analyze', aiBurstLimiter, aiRateLimiter, analyzeResume);
router.post('/:id/analyze', validateObjectIdParam('id'), aiBurstLimiter, aiRateLimiter, analyzeResume);
router.post('/:id/improve', validateObjectIdParam('id'), aiBurstLimiter, aiRateLimiter, improveSection);
router.post('/:id/versions', validateObjectIdParam('id'), saveResumeVersion);
router.get('/:id/versions', validateObjectIdParam('id'), getResumeVersions);

// Phase 7: Resume Truth Detector
router.post('/:id/truth-detector', validateObjectIdParam('id'), aiBurstLimiter, aiRateLimiter, runResumeTruthDetector);

router.get('/', getResumes);
router.get('/:id', validateObjectIdParam('id'), getResumeById);
router.put('/:id', validateObjectIdParam('id'), updateResume);
router.delete('/:id', validateObjectIdParam('id'), deleteResume);

module.exports = router;
