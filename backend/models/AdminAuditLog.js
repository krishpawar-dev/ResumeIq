const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    adminName: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      required: true,
      // e.g. 'user.deleted', 'user.role_changed', 'question.created', 'subscription.cancelled'
      index: true
    },
    resourceType: {
      type: String,
      required: true,
      enum: ['user', 'question', 'category', 'template', 'skill', 'subscription', 'report', 'job_category', 'setting']
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

adminAuditLogSchema.index({ createdAt: -1 });

const AdminAuditLog = mongoose.model('AdminAuditLog', adminAuditLogSchema);

module.exports = AdminAuditLog;
