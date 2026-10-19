const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ['bug', 'ai_output', 'content', 'account', 'other'],
      index: true
    },
    subject: {
      type: String,
      required: [true, 'Report subject is required'],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
      maxlength: 3000
    },
    resourceType: {
      type: String,
      enum: ['resume', 'job_match', 'interview', 'career_path', 'general', ''],
      default: ''
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'rejected'],
      default: 'open',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true
    },
    adminNotes: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
