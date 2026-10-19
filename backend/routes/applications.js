const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect } = require('../middlewares/auth');

// All application tracker endpoints are authenticated
router.use(protect);

// Get all applications
router.get('/', applicationController.getApplications);

// Create application
router.post('/', applicationController.createApplication);

// Get single application
router.get('/:id', applicationController.getApplicationById);

// Update application
router.put('/:id', applicationController.updateApplication);

// Delete application
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
