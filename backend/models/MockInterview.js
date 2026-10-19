const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema(
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
    targetRole: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true
    },
    interviewType: {
      type: String,
      enum: ['technical', 'hr', 'behavioral', 'mixed'],
      default: 'mixed'
    },
    difficulty: {
      type: String,
      enum: ['entry', 'mid', 'senior'],
      default: 'mid'
    },
    duration: {
      type: Number,
      enum: [30, 45, 60],
      default: 30
    },
    focus: {
      type: String,
      enum: ['fullstack', 'frontend', 'backend', 'data'],
      default: 'fullstack'
    },
    status: {
      type: String,
      enum: ['created', 'in_progress', 'completed', 'abandoned'],
      default: 'created',
      index: true
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InterviewQuestion'
      }
    ],
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    overallScore: {
      type: Number,
      default: null
    },
    overallStrengths: {
      type: [String],
      default: []
    },
    overallWeaknesses: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);

module.exports = MockInterview;
