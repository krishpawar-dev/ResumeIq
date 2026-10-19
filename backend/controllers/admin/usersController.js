const User = require('../../models/User');
const Resume = require('../../models/Resume');
const Subscription = require('../../models/Subscription');
const { recordAuditLog } = require('../../services/auditLogService');
const mongoose = require('mongoose');

// Safe user projection — never expose password
const SAFE_USER_FIELDS = 'name email role createdAt lastActiveAt updatedAt';

/**
 * @desc    List users with search, filter, pagination
 * @route   GET /api/admin/users
 */
const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const roleFilter = req.query.role;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (roleFilter && ['user', 'admin'].includes(roleFilter)) {
      query.role = roleFilter;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select(SAFE_USER_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    // Attach subscription info to each user
    const userIds = users.map((u) => u._id);
    const subscriptions = await Subscription.find({ userId: { $in: userIds } })
      .select('userId plan status expiresAt')
      .lean();
    const subMap = {};
    subscriptions.forEach((s) => { subMap[s.userId.toString()] = s; });

    const enrichedUsers = users.map((u) => ({
      ...u,
      subscription: subMap[u._id.toString()] || null
    }));

    return res.status(200).json({
      status: 'success',
      data: enrichedUsers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('[Admin Users List Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to list users.' });
  }
};

/**
 * @desc    Get single user detail
 * @route   GET /api/admin/users/:id
 */
const getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid user ID.' });
    }

    const user = await User.findById(req.params.id).select(SAFE_USER_FIELDS).lean();
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

    const [resumeCount, subscription] = await Promise.all([
      Resume.countDocuments({ userId: user._id }),
      Subscription.findOne({ userId: user._id }).select('plan status startedAt expiresAt').lean()
    ]);

    return res.status(200).json({
      status: 'success',
      data: { ...user, resumeCount, subscription }
    });
  } catch (error) {
    console.error('[Admin Get User Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to get user details.' });
  }
};

/**
 * @desc    Update user (name, role)
 * @route   PUT /api/admin/users/:id
 */
const updateUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid user ID.' });
    }

    // Prevent self-demotion
    if (req.params.id === req.user._id.toString() && req.body.role && req.body.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You cannot change your own admin role.'
      });
    }

    const allowedFields = {};
    if (req.body.name && typeof req.body.name === 'string') {
      allowedFields.name = req.body.name.trim().slice(0, 100);
    }
    if (req.body.role && ['user', 'admin'].includes(req.body.role)) {
      allowedFields.role = req.body.role;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: allowedFields },
      { new: true, runValidators: true }
    ).select(SAFE_USER_FIELDS);

    if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

    await recordAuditLog({
      adminId: req.user._id,
      adminName: req.user.name,
      action: allowedFields.role ? 'user.role_changed' : 'user.updated',
      resourceType: 'user',
      resourceId: user._id,
      metadata: allowedFields,
      ipAddress: req.ip
    });

    return res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    console.error('[Admin Update User Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update user.' });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid user ID.' });
    }

    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You cannot delete your own admin account.'
      });
    }

    const user = await User.findById(req.params.id).select('name email role');
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

    await User.deleteOne({ _id: user._id });

    await recordAuditLog({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'user.deleted',
      resourceType: 'user',
      resourceId: user._id,
      metadata: { deletedName: user.name, deletedEmail: user.email },
      ipAddress: req.ip
    });

    return res.status(200).json({ status: 'success', message: 'User deleted successfully.' });
  } catch (error) {
    console.error('[Admin Delete User Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to delete user.' });
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
