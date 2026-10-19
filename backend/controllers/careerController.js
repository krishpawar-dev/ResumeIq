const careerAnalysisService = require('../services/careerAnalysisService');

const careerController = {
  /**
   * POST /api/career/analyze
   * Run AI Career Path and Roadmap Analysis
   */
  async analyze(req, res, next) {
    try {
      const {
        targetRole,
        industryPreference,
        targetIndustry,
        careerGoal,
        customSkills,
        resumeId
      } = req.body;

      if (!targetRole || typeof targetRole !== 'string' || !targetRole.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Target role is required.'
        });
      }

      const result = await careerAnalysisService.analyzeCareerPath(req.user.id, {
        targetRole: targetRole.trim(),
        industryPreference: industryPreference || 'Technology',
        targetIndustry: targetIndustry || 'Technology',
        careerGoal: careerGoal ? careerGoal.trim() : '',
        customSkills: Array.isArray(customSkills) ? customSkills : [],
        resumeId
      });

      return res.status(200).json({
        status: 'success',
        message: 'Career path analyzed successfully.',
        data: result
      });
    } catch (err) {
      console.error('[Career Controller Analyze Error]', err);
      next(err);
    }
  },

  /**
   * GET /api/career/path
   * Retrieve active CareerPath
   */
  async getPath(req, res, next) {
    try {
      const careerPath = await careerAnalysisService.getActiveCareerPath(req.user.id);
      return res.status(200).json({
        status: 'success',
        data: {
          careerPath: careerPath || null
        }
      });
    } catch (err) {
      console.error('[Career Controller Get Path Error]', err);
      next(err);
    }
  },

  /**
   * GET /api/career/roadmap
   * Retrieve active LearningRoadmap
   */
  async getRoadmap(req, res, next) {
    try {
      const roadmap = await careerAnalysisService.getActiveRoadmap(req.user.id);
      return res.status(200).json({
        status: 'success',
        data: {
          roadmap: roadmap || null
        }
      });
    } catch (err) {
      console.error('[Career Controller Get Roadmap Error]', err);
      next(err);
    }
  },

  /**
   * PUT /api/career/roadmap/:itemId
   * Toggle completion state of a roadmap item
   */
  async updateRoadmapItem(req, res, next) {
    try {
      const { itemId } = req.params;
      const { completed } = req.body;

      const result = await careerAnalysisService.toggleRoadmapItem(req.user.id, itemId, completed);

      return res.status(200).json({
        status: 'success',
        message: 'Roadmap progress updated.',
        data: result
      });
    } catch (err) {
      console.error('[Career Controller Update Roadmap Item Error]', err);
      next(err);
    }
  }
};

module.exports = careerController;
