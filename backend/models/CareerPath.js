const mongoose = require('mongoose');

const skillGapItemSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  importance: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  currentLevel: { type: Number, min: 1, max: 5, default: 2 },
  targetLevel: { type: Number, min: 1, max: 5, default: 4 },
  reason: { type: String, default: '' }
}, { _id: true });

const projectSuggestionSchema = new mongoose.Schema({
  projectTitle: { type: String, required: true },
  skillsPracticed: [{ type: String }],
  description: { type: String, default: '' },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' }
}, { _id: true });

const progressionStepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  requiredSkills: [{ type: String }],
  learningPlan: [{ type: String }],
  suggestedProjects: [projectSuggestionSchema],
  interviewPrep: [{ type: String }]
}, { _id: true });

const careerPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  currentRole: { type: String, default: '' },
  currentExperience: { type: String, default: '' },
  currentSkills: [{ type: String }],
  industryPreference: { type: String, default: 'Technology' },
  careerGoal: { type: String, default: '' },
  targetRole: { type: String, required: true },
  targetIndustry: { type: String, default: 'Technology' },
  skillGap: [skillGapItemSchema],
  progression: [progressionStepSchema],
  aiSummary: { type: String, default: '' },
  isActive: { type: Boolean, default: true, index: true }
}, {
  timestamps: true
});

careerPathSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CareerPath', careerPathSchema);
