const {
  getUserDraft,
  saveUserDraft,
  calculateBuilderATS
} = require('../services/builderService');
const { improveResumeSection } = require('../services/resumeImprovementService');

/**
 * @desc    Get the current authenticated user's resume draft
 * @route   GET /api/builder/draft
 * @access  Private (JWT Protected)
 */
const getDraft = async (req, res) => {
  try {
    const draft = await getUserDraft(req.user._id);
    return res.status(200).json({
      status: 'success',
      draft
    });
  } catch (error) {
    console.error('[Get Builder Draft Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve resume draft.'
    });
  }
};

/**
 * @desc    Save the user's resume draft and compute ATS score
 * @route   PUT /api/builder/draft
 * @access  Private (JWT Protected)
 */
const saveDraft = async (req, res) => {
  try {
    const { draft, atsResult } = await saveUserDraft(req.user._id, req.body);
    return res.status(200).json({
      status: 'success',
      message: 'Draft saved successfully',
      draft,
      atsResult
    });
  } catch (error) {
    console.error('[Save Builder Draft Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save resume draft.'
    });
  }
};

/**
 * @desc    Debounced live ATS score calculation for builder workspace
 * @route   POST /api/builder/score
 * @access  Private (JWT Protected)
 */
const calculateScore = async (req, res) => {
  try {
    const atsResult = await calculateBuilderATS(req.body);
    return res.status(200).json({
      status: 'success',
      atsScore: atsResult.atsScore,
      scoreBreakdown: atsResult.scoreBreakdown,
      wordCount: atsResult.wordCount
    });
  } catch (error) {
    console.error('[Calculate Builder Score Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to calculate live ATS score.'
    });
  }
};

/**
 * @desc    Inline AI improvement for builder bullet or section
 * @route   POST /api/builder/improve
 * @access  Private (JWT Protected)
 */
const improveBullet = async (req, res) => {
  try {
    const { originalText, sectionType } = req.body;
    if (!originalText || typeof originalText !== 'string' || originalText.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'originalText is required for AI improvement.'
      });
    }

    const improvement = await improveResumeSection({
      originalText,
      sectionType: sectionType || 'experience'
    });

    return res.status(200).json({
      status: 'success',
      originalText: improvement.originalText,
      suggestedText: improvement.suggestedText,
      reasons: improvement.reasons,
      explanation: improvement.explanation
    });
  } catch (error) {
    console.error('[Builder AI Bullet Improvement Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'We could not improve this bullet. Your content is unchanged.'
    });
  }
};

module.exports = {
  getDraft,
  saveDraft,
  calculateScore,
  improveBullet
};
