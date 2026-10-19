const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/auth');
const { requireAdmin } = require('../../middlewares/requireAdmin');
const { getDashboardMetrics, getGrowthData } = require('../../controllers/admin/dashboardController');
const { getUsers, getUserById, updateUser, deleteUser } = require('../../controllers/admin/usersController');
const { getQuestions, getQuestionById, createQuestion, updateQuestion, deleteQuestion } = require('../../controllers/admin/questionsController');
const {
  getCategories, createCategory, updateCategory, deleteCategory,
  getSkills, createSkill, updateSkill, deleteSkill,
  getJobCategories, createJobCategory, updateJobCategory, deleteJobCategory,
  getTemplates, createTemplate, updateTemplate, deleteTemplate
} = require('../../controllers/admin/contentController');
const {
  getReports, getReportById, updateReport, deleteReport,
  getSubscriptions, getSubscriptionById, updateSubscription
} = require('../../controllers/admin/reportsController');

// All admin routes: must be authenticated + admin
router.use(protect, requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardMetrics);
router.get('/dashboard/growth', getGrowthData);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Interview Questions
router.get('/questions', getQuestions);
router.get('/questions/:id', getQuestionById);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Interview Categories
router.get('/interview-categories', getCategories);
router.post('/interview-categories', createCategory);
router.put('/interview-categories/:id', updateCategory);
router.delete('/interview-categories/:id', deleteCategory);

// Skills
router.get('/skills', getSkills);
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);

// Job Categories
router.get('/job-categories', getJobCategories);
router.post('/job-categories', createJobCategory);
router.put('/job-categories/:id', updateJobCategory);
router.delete('/job-categories/:id', deleteJobCategory);

// Resume Templates
router.get('/resume-templates', getTemplates);
router.post('/resume-templates', createTemplate);
router.put('/resume-templates/:id', updateTemplate);
router.delete('/resume-templates/:id', deleteTemplate);

// Reports
router.get('/reports', getReports);
router.get('/reports/:id', getReportById);
router.put('/reports/:id', updateReport);
router.delete('/reports/:id', deleteReport);

// Subscriptions
router.get('/subscriptions', getSubscriptions);
router.get('/subscriptions/:id', getSubscriptionById);
router.put('/subscriptions/:id', updateSubscription);

module.exports = router;
