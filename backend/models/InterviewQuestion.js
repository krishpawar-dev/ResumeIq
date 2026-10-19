const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    mockInterviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockInterview',
      default: null,
      index: true
    },
    practiceSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PracticeSession',
      default: null,
      index: true
    },
    questionText: {
      type: String,
      required: [true, 'questionText is required'],
      trim: true
    },
    questionType: {
      type: String,
      enum: ['technical', 'behavioral', 'hr', 'situational', 'project', 'mixed'],
      required: true
    },
    difficulty: {
      type: String,
      enum: ['entry', 'mid', 'senior'],
      required: true
    },
    focus: {
      type: String,
      default: 'fullstack'
    },
    targetRole: {
      type: String,
      default: ''
    },
    expectedTopics: {
      type: [String],
      default: []
    },
    order: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);

module.exports = InterviewQuestion;
