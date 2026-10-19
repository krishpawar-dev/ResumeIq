const mongoose = require('mongoose');

const resumeVersionSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sectionId: {
      type: String,
      required: [true, 'sectionId identifier is required'],
      trim: true
    },
    originalText: {
      type: String,
      required: [true, 'originalText is required'],
      trim: true
    },
    aiSuggestion: {
      type: String,
      required: [true, 'aiSuggestion is required'],
      trim: true
    },
    acceptedText: {
      type: String,
      required: [true, 'acceptedText is required'],
      trim: true
    },
    reasons: {
      type: [String],
      default: []
    },
    explanation: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const ResumeVersion = mongoose.model('ResumeVersion', resumeVersionSchema);

module.exports = ResumeVersion;
