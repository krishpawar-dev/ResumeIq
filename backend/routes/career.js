const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { protect } = require('../middlewares/auth');
const { getCareerTwin } = require('../controllers/phase7Controller');

const { aiRateLimiter, aiBurstLimiter } = require('../middlewares/rateLimiters');

// All career endpoints are authenticated
router.use(protect);

// AI Career Path & Roadmap Analysis
router.post('/analyze', aiBurstLimiter, aiRateLimiter, careerController.analyze);

// Retrieve active career path
router.get('/path', careerController.getPath);

// Retrieve active learning roadmap
router.get('/roadmap', careerController.getRoadmap);

// Update/toggle roadmap item completion
router.put('/roadmap/:itemId', careerController.updateRoadmapItem);

// Phase 7: Career Twin Analysis
router.post('/twin', aiBurstLimiter, aiRateLimiter, getCareerTwin);

module.exports = router;
