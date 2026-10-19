const Report = require('../../models/Report');
const Subscription = require('../../models/Subscription');
const User = require('../../models/User');
const { recordAuditLog } = require('../../services/auditLogService');
const mongoose = require('mongoose');

// ==============================
// REPORTS
// ==============================

const getReports = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const statusFilter = req.query.status;
    const typeFilter = req.query.type;
    const priorityFilter = req.query.priority;

    const query = {};
    if (search) query.subject = { $regex: search, $options: 'i' };
    const validStatuses = ['open', 'investigating', 'resolved', 'rejected'];
    if (statusFilter && validStatuses.includes(statusFilter)) query.status = statusFilter;
    const validTypes = ['bug', 'ai_output', 'content', 'account', 'other'];
    if (typeFilter && validTypes.includes(typeFilter)) query.type = typeFilter;
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (priorityFilter && validPriorities.includes(priorityFilter)) query.priority = priorityFilter;

    const [reports, total] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .populate('resolvedBy', 'name email')
        .lean(),
      Report.countDocuments(query)
    ]);

    return res.status(200).json({
      status: 'success',
      data: reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to list reports.' });
  }
};

const getReportById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    const report = await Report.findById(req.params.id)
      .populate('userId', 'name email role createdAt')
      .populate('resolvedBy', 'name email')
      .lean();
    if (!report) return res.status(404).json({ status: 'error', message: 'Report not found.' });
    return res.status(200).json({ status: 'success', data: report });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to get report.' });
  }
};

const updateReport = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    const updates = {};
    const validStatuses = ['open', 'investigating', 'resolved', 'rejected'];
    const validPriorities = ['low', 'medium', 'high', 'critical'];

    if (req.body.status && validStatuses.includes(req.body.status)) {
      updates.status = req.body.status;
      if (req.body.status === 'resolved' || req.body.status === 'rejected') {
        updates.resolvedAt = new Date();
        updates.resolvedBy = req.user._id;
      }
    }
    if (req.body.priority && validPriorities.includes(req.body.priority)) updates.priority = req.body.priority;
    if (req.body.adminNotes !== undefined) updates.adminNotes = req.body.adminNotes.trim().slice(0, 2000);

    const report = await Report.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true })
      .populate('userId', 'name email')
      .populate('resolvedBy', 'name email');
    if (!report) return res.status(404).json({ status: 'error', message: 'Report not found.' });

    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'report.updated', resourceType: 'report', resourceId: report._id, metadata: updates, ipAddress: req.ip });

    return res.status(200).json({ status: 'success', data: report });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to update report.' });
  }
};

const deleteReport = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ status: 'error', message: 'Report not found.' });
    await Report.deleteOne({ _id: report._id });
    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'report.deleted', resourceType: 'report', resourceId: report._id, metadata: { subject: report.subject }, ipAddress: req.ip });
    return res.status(200).json({ status: 'success', message: 'Report deleted.' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to delete report.' });
  }
};

// ==============================
// SUBSCRIPTIONS
// ==============================

const getSubscriptions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const statusFilter = req.query.status;
    const planFilter = req.query.plan;

    // Build user query first if searching
    let userIds;
    if (search) {
      const matchedUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id').lean();
      userIds = matchedUsers.map((u) => u._id);
    }

    const query = {};
    if (userIds) query.userId = { $in: userIds };
    const validStatuses = ['active', 'trialing', 'past_due', 'cancelled', 'expired'];
    if (statusFilter && validStatuses.includes(statusFilter)) query.status = statusFilter;
    const validPlans = ['free', 'pro', 'enterprise'];
    if (planFilter && validPlans.includes(planFilter)) query.plan = planFilter;

    const [subs, total] = await Promise.all([
      Subscription.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email role')
        .lean(),
      Subscription.countDocuments(query)
    ]);

    return res.status(200).json({
      status: 'success',
      data: subs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to list subscriptions.' });
  }
};

const getSubscriptionById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    const sub = await Subscription.findById(req.params.id).populate('userId', 'name email role createdAt').lean();
    if (!sub) return res.status(404).json({ status: 'error', message: 'Subscription not found.' });
    return res.status(200).json({ status: 'success', data: sub });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to get subscription.' });
  }
};

const updateSubscription = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    const updates = {};
    const validStatuses = ['active', 'trialing', 'past_due', 'cancelled', 'expired'];
    const validPlans = ['free', 'pro', 'enterprise'];

    if (req.body.status && validStatuses.includes(req.body.status)) {
      updates.status = req.body.status;
      if (req.body.status === 'cancelled') updates.cancelledAt = new Date();
    }
    if (req.body.plan && validPlans.includes(req.body.plan)) updates.plan = req.body.plan;
    if (req.body.expiresAt) updates.expiresAt = new Date(req.body.expiresAt);
    if (req.body.adminNotes !== undefined) updates.adminNotes = req.body.adminNotes.trim().slice(0, 500);

    const sub = await Subscription.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).populate('userId', 'name email');
    if (!sub) return res.status(404).json({ status: 'error', message: 'Subscription not found.' });

    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'subscription.updated', resourceType: 'subscription', resourceId: sub._id, metadata: updates, ipAddress: req.ip });

    return res.status(200).json({ status: 'success', data: sub });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to update subscription.' });
  }
};

module.exports = {
  getReports, getReportById, updateReport, deleteReport,
  getSubscriptions, getSubscriptionById, updateSubscription
};
