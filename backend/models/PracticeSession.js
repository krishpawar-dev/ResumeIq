const mongoose = require('mongoose');

const practiceSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sessionType: {
      type: String,
      enum: ['flashcard', 'timed', 'category', 'company', 'community'],
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['created', 'in_progress', 'completed', 'abandoned'],
      default: 'created',
      index: true
    },
    targetRole: {
      type: String,
      default: ''
    },
    difficulty: {
      type: String,
      enum: ['entry', 'mid', 'senior'],
      default: 'mid'
    },
    focus: {
      type: String,
      enum: ['fullstack', 'frontend', 'backend', 'data'],
      default: 'fullstack'
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null
    },
    companyName: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'situational', 'project', 'mixed'],
      default: 'mixed'
    },
    questionSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityQuestionSet',
      default: null
    },
    duration: {
      type: Number,
      default: 0 // Duration in minutes for timed practice
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
    questionsAnswered: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: null
    },
    strongestArea: {
      type: String,
      default: ''
    },
    areaToImprove: {
      type: String,
      default: ''
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const PracticeSession = mongoose.model('PracticeSession', practiceSessionSchema);

module.exports = PracticeSession;
