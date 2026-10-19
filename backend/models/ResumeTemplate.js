const mongoose = require('mongoose');

const resumeTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      unique: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      default: '',
      maxlength: 500
    },
    previewImageUrl: {
      type: String,
      default: ''
    },
    layout: {
      type: String,
      enum: ['single_column', 'two_column', 'timeline', 'modern', 'minimal', 'executive'],
      default: 'single_column'
    },
    sections: {
      type: [String],
      default: ['summary', 'experience', 'education', 'skills', 'projects']
    },
    style: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        primaryColor: '#0ea5e9',
        fontFamily: 'Inter',
        fontSize: 'medium'
      }
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    usageCount: {
      type: Number,
      default: 0
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const ResumeTemplate = mongoose.model('ResumeTemplate', resumeTemplateSchema);

module.exports = ResumeTemplate;
