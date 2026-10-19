const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
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
    answerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewAnswer',
      required: true,
      index: true
    },
    // Weighted scoring criteria (Total = 1.00 / 100%)
    relevanceScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    clarityScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    starScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    technicalAccuracyScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    completenessScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    // Final weighted score / 10
    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    strengths: {
      type: [String],
      default: []
    },
    weaknesses: {
      type: [String],
      default: []
    },
    missingPoints: {
      type: [String],
      default: []
    },
    improvedModelAnswer: {
      type: String,
      required: true
    },
    keywords: {
      used: { type: [String], default: [] },
      missing: { type: [String], default: [] }
    },
    fillerWords: {
      totalCount: { type: Number, default: 0 },
      occurrences: [
        {
          word: { type: String },
          count: { type: Number }
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;
