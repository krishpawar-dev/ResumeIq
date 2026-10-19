const mongoose = require('mongoose');

const aiUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    feature: {
      type: String,
      required: true,
      enum: [
        'resume_analysis',
        'job_analysis',
        'job_match',
        'resume_improvement',
        'interview_generation',
        'interview_evaluation',
        'job_xray',
        'truth_detector',
        'tailored_resume',
        'ghost_job_check',
        'skill_battle',
        'career_analysis',
        'career_twin',
        'reverse_interview',
        'resume_builder'
      ],
      index: true
    },
    operation: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'partial'],
      default: 'success'
    },
    tokensUsed: {
      type: Number,
      default: 0
    },
    model: {
      type: String,
      default: 'gpt-4o-mini'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

aiUsageSchema.index({ createdAt: -1 });
aiUsageSchema.index({ feature: 1, createdAt: -1 });

const AIUsage = mongoose.model('AIUsage', aiUsageSchema);

module.exports = AIUsage;
