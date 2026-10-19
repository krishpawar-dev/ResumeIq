const { getUserInterviewAnalytics } = require('../services/interviewAnalyticsService');

/**
 * @desc    Get comprehensive interview and practice analytics for authenticated user
 * @route   GET /api/interview/analytics
 * @access  Private (JWT Protected)
 */
const getAnalytics = async (req, res) => {
  try {
    const analytics = await getUserInterviewAnalytics(req.user._id);
    return res.status(200).json({
      status: 'success',
      analytics
    });
  } catch (error) {
    console.error('[Get Analytics Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve interview analytics.'
    });
  }
};

module.exports = {
  getAnalytics
};
