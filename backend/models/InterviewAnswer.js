const mongoose = require('mongoose');

const interviewAnswerSchema = new mongoose.Schema(
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
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewQuestion',
      required: true,
      index: true
    },
    answerText: {
      type: String,
      required: [true, 'answerText is required'],
      trim: true
    },
    // Future voice interview extension point
    inputType: {
      type: String,
      enum: ['text', 'voice'],
      default: 'text'
    },
    audioUrl: {
      type: String,
      default: null
    },
    transcript: {
      type: String,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    timeSpentSeconds: {
      type: Number,
      default: 0
    },
    questionOrder: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

const InterviewAnswer = mongoose.model('InterviewAnswer', interviewAnswerSchema);

module.exports = InterviewAnswer;
