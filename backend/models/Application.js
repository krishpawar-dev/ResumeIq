const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  jobUrl: {
    type: String,
    trim: true,
    default: ''
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  },
  status: {
    type: String,
    enum: ['Applied', 'Screening', 'Interview', 'Technical', 'HR', 'Offer', 'Rejected'],
    default: 'Applied',
    index: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  nextActionDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  salaryRange: {
    type: String,
    trim: true,
    default: ''
  },
  contactName: {
    type: String,
    trim: true,
    default: ''
  },
  contactEmail: {
    type: String,
    trim: true,
    default: ''
  },
  source: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
