const mongoose = require('mongoose');

const resumeDraftSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    templateId: {
      type: String,
      enum: ['classic', 'modern', 'executive', 'technical'],
      default: 'classic'
    },
    personalInfo: {
      fullName: { type: String, default: '' },
      title: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' }
    },
    summary: {
      type: String,
      default: ''
    },
    experience: [
      {
        id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
        jobTitle: { type: String, default: '' },
        company: { type: String, default: '' },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' }
      }
    ],
    education: [
      {
        id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
        institution: { type: String, default: '' },
        degree: { type: String, default: '' },
        field: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        details: { type: String, default: '' }
      }
    ],
    skills: {
      technical: { type: [String], default: [] },
      tools: { type: [String], default: [] },
      other: { type: [String], default: [] }
    },
    projects: [
      {
        id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
        projectName: { type: String, default: '' },
        description: { type: String, default: '' },
        technologies: { type: [String], default: [] },
        outcome: { type: String, default: '' }
      }
    ],
    atsScore: {
      type: Number,
      default: null
    },
    scoreBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const ResumeDraft = mongoose.model('ResumeDraft', resumeDraftSchema);

module.exports = ResumeDraft;
