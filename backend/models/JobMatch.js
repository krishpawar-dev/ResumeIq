const mongoose = require('mongoose');

const matchedSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    importance: { type: Number, default: 0.8 },
    evidence: { type: String, default: '' },
    matchStrength: {
      type: String,
      enum: ['strong', 'moderate', 'partial'],
      default: 'strong'
    },
    requiredOrPreferred: {
      type: String,
      enum: ['required', 'preferred'],
      default: 'required'
    },
    category: { type: String, default: 'technical' }
  },
  { _id: false }
);

const missingSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    importance: { type: Number, default: 0.8 },
    requiredOrPreferred: {
      type: String,
      enum: ['required', 'preferred'],
      default: 'required'
    },
    reason: { type: String, default: 'Not clearly demonstrated in current resume.' },
    category: { type: String, default: 'technical' }
  },
  { _id: false }
);

const tailoringSuggestionSchema = new mongoose.Schema(
  {
    suggestion: { type: String, required: true },
    priority: {
      type: String,
      enum: ['High Priority', 'Recommended', 'Optional'],
      default: 'Recommended'
    },
    reason: { type: String, default: '' },
    section: { type: String, default: 'Experience' }
  },
  { _id: false }
);

const jobMatchSchema = new mongoose.Schema(
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
      required: true,
      index: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },
    matchPercent: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    scoreBreakdown: {
      skillAlignment: { type: Number, default: 0 },
      relevantExperience: { type: Number, default: 0 },
      projectRelevance: { type: Number, default: 0 },
      additionalContext: { type: Number, default: 0 }
    },
    weightsApplied: {
      skillAlignment: { type: Number, default: 0.55 },
      relevantExperience: { type: Number, default: 0.20 },
      projectRelevance: { type: Number, default: 0.15 },
      additionalContext: { type: Number, default: 0.10 }
    },
    matchedSkills: [matchedSkillSchema],
    missingSkills: [missingSkillSchema],
    tailoringSuggestions: [tailoringSuggestionSchema],
    matchSummary: {
      type: String,
      default: ''
    },
    experienceEvaluation: {
      requiredYears: { type: Number, default: 0 },
      demonstratedYears: { type: Number, default: 0 },
      assessment: { type: String, default: '' }
    },
    projectRelevanceEvaluation: {
      score: { type: Number, default: 0 },
      summary: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

const JobMatch = mongoose.model('JobMatch', jobMatchSchema);

module.exports = JobMatch;
