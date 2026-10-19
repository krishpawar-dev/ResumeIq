const mongoose = require('mongoose');

const questionItemSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'situational', 'project', 'mixed'],
      default: 'technical'
    },
    difficulty: {
      type: String,
      enum: ['entry', 'mid', 'senior'],
      default: 'mid'
    },
    expectedTopics: {
      type: [String],
      default: []
    }
  },
  { _id: true }
);

const communityQuestionSetSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Question set title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      default: 'mixed'
    },
    questions: {
      type: [questionItemSchema],
      default: []
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true
    },
    practiceCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const CommunityQuestionSet = mongoose.model('CommunityQuestionSet', communityQuestionSetSchema);

module.exports = CommunityQuestionSet;
