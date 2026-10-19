const mongoose = require('mongoose');

const factorSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    feedback: {
      type: String,
      required: true
    },
    evidence: {
      type: String,
      default: ''
    },
    suggestion: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fileUrl: {
      type: String,
      required: [true, 'Resume file URL is required']
    },
    cloudinaryPublicId: {
      type: String,
      default: null
    },
    fileName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true
    },
    fileSize: {
      type: Number,
      default: 0
    },
    mimeType: {
      type: String,
      default: ''
    },
    parsedText: {
      type: String,
      required: [true, 'Parsed resume text is required']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    isAIPowered: {
      type: Boolean,
      default: false
    },
    scoreBreakdown: {
      keywordDensity: factorSchema,
      quantifiableResults: factorSchema,
      formatStructure: factorSchema,
      actionVerbUsage: factorSchema,
      contactInformation: factorSchema,
      optimalLength: factorSchema,
      skillsSection: factorSchema
    },
    improvementPlan: {
      overallAssessment: { type: String, default: '' },
      priorityActions: { type: [String], default: [] },
      sectionImprovements: {
        type: [
          {
            _id: false,
            section: { type: String, required: true },
            issue: { type: String, default: '' },
            whyItMatters: { type: String, default: '' },
            currentText: { type: String, default: '' },
            improvedExample: { type: String, default: '' },
            checklist: { type: [String], default: [] }
          }
        ],
        default: []
      }
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'analyzed', 'failed'],
      default: 'uploaded',
      index: true
    },
    analysisError: {
      type: String,
      default: null
    },
    metadata: {
      wordCount: { type: Number, default: 0 },
      characterCount: { type: Number, default: 0 },
      analyzedAt: { type: Date, default: null }
    }
  },
  {
    timestamps: true
  }
);

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
