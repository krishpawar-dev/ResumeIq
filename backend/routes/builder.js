const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getDraft,
  saveDraft,
  calculateScore,
  improveBullet
} = require('../controllers/builderController');

// All builder routes are protected by JWT authentication
router.use(protect);

router.get('/draft', getDraft);
router.put('/draft', saveDraft);
router.post('/score', calculateScore);
router.post('/improve', improveBullet);

module.exports = router;
