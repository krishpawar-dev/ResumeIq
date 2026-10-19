const mongoose = require('mongoose');

const extractedSkillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['technical', 'soft', 'tool', 'domain', 'methodology', 'other'],
      default: 'technical'
    },
    importance: {
      type: Number,
      min: 0,
      max: 1.0,
      default: 0.8
    },
    requiredOrPreferred: {
      type: String,
      enum: ['required', 'preferred'],
      default: 'required'
    },
    context: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null
    },
    title: {
      type: String,
      default: 'Target Role',
      trim: true
    },
    company: {
      type: String,
      default: '',
      trim: true
    },
    jobDescriptionText: {
      type: String,
      required: [true, 'Job description text is required']
    },
    extractedSkills: [extractedSkillSchema],
    experienceRequired: {
      minYears: { type: Number, default: 0 },
      level: { type: String, default: 'Mid-Senior' },
      summary: { type: String, default: '' }
    },
    educationRequired: {
      type: String,
      default: ''
    },
    keyResponsibilities: [
      {
        type: String
      }
    ],
    metadata: {
      wordCount: { type: Number, default: 0 },
      analyzedAt: { type: Date, default: Date.now }
    }
  },
  {
    timestamps: true
  }
);

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
