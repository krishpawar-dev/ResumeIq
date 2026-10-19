const User = require('../../models/User');
const Resume = require('../../models/Resume');
const MockInterview = require('../../models/MockInterview');
const AIUsage = require('../../models/AIUsage');
const Subscription = require('../../models/Subscription');
const AdminAuditLog = require('../../models/AdminAuditLog');

/**
 * @desc    Get admin dashboard metrics
 * @route   GET /api/admin/dashboard
 * @access  Admin only
 */
const getDashboardMetrics = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      totalResumes,
      totalAIAnalyses,
      totalMockInterviews,
      completedMockInterviews,
      activeUsers,
      totalSubscriptions,
      activeSubscriptions,
      recentAuditLogs
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: weekStart } }),
      User.countDocuments({ createdAt: { $gte: monthStart } }),
      Resume.countDocuments(),
      AIUsage.countDocuments({ status: 'success' }),
      MockInterview.countDocuments(),
      MockInterview.countDocuments({ status: 'completed' }),
      User.countDocuments({ lastActiveAt: { $gte: thirtyDaysAgo } }),
      Subscription.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      AdminAuditLog.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('adminId', 'name email')
        .lean()
    ]);

    // AI usage breakdown by feature
    const aiUsageByFeature = await AIUsage.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: '$feature', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return res.status(200).json({
      status: 'success',
      metrics: {
        users: {
          total: totalUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
          active30d: activeUsers
        },
        resumes: {
          total: totalResumes
        },
        aiAnalyses: {
          total: totalAIAnalyses,
          byFeature: aiUsageByFeature.map((f) => ({ feature: f._id, count: f.count }))
        },
        interviews: {
          total: totalMockInterviews,
          completed: completedMockInterviews,
          active: totalMockInterviews - completedMockInterviews
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions
        }
      },
      recentActivity: recentAuditLogs.map((log) => ({
        _id: log._id,
        action: log.action,
        resourceType: log.resourceType,
        adminName: log.adminId?.name || log.adminName || 'Admin',
        metadata: log.metadata,
        createdAt: log.createdAt
      }))
    });
  } catch (error) {
    console.error('[Admin Dashboard Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to load dashboard metrics.' });
  }
};

/**
 * @desc    Get growth chart data
 * @route   GET /api/admin/dashboard/growth?range=30d
 * @access  Admin only
 */
const getGrowthData = async (req, res) => {
  try {
    const range = req.query.range || '30d';
    let daysBack = 30;
    if (range === '7d') daysBack = 7;
    else if (range === '30d') daysBack = 30;
    else if (range === '90d') daysBack = 90;
    else if (range === '1y') daysBack = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);

    // Group users created by date
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const resumeGrowth = await Resume.aggregate([
      { $match: { uploadedAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$uploadedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const interviewGrowth = await MockInterview.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Build a complete date series
    const buildSeries = (data, days) => {
      const map = {};
      data.forEach((d) => { map[d._id] = d.count; });
      const series = [];
      for (let i = days; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        series.push({ date: key, count: map[key] || 0 });
      }
      return series;
    };

    return res.status(200).json({
      status: 'success',
      range,
      growth: {
        users: buildSeries(userGrowth, daysBack),
        resumes: buildSeries(resumeGrowth, daysBack),
        interviews: buildSeries(interviewGrowth, daysBack)
      }
    });
  } catch (error) {
    console.error('[Admin Growth Data Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to load growth data.' });
  }
};

module.exports = { getDashboardMetrics, getGrowthData };
