const mongoose = require('mongoose');

const roadmapItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skill: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  description: { type: String, default: '' },
  estimatedEffort: { type: String, default: '1-2 weeks' },
  resources: [{ type: String }],
  projectIdea: { type: String, default: '' },
  completed: { type: Boolean, default: false }
}, { _id: true });

const learningRoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  careerPathId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerPath',
    required: true,
    index: true
  },
  targetRole: { type: String, required: true },
  items: [roadmapItemSchema],
  overallProgress: { type: Number, default: 0, min: 0, max: 100 }
}, {
  timestamps: true
});

learningRoadmapSchema.index({ userId: 1, createdAt: -1 });

// Helper to calculate progress
learningRoadmapSchema.methods.recalculateProgress = function() {
  if (!this.items || this.items.length === 0) {
    this.overallProgress = 0;
    return;
  }
  const completedCount = this.items.filter(item => item.completed).length;
  this.overallProgress = Math.round((completedCount / this.items.length) * 100);
};

module.exports = mongoose.model('LearningRoadmap', learningRoadmapSchema);
