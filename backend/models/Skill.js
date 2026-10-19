const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
      maxlength: 100
    },
    category: {
      type: String,
      required: true,
      enum: ['programming_language', 'framework', 'database', 'cloud', 'devops', 'tool', 'soft_skill', 'methodology', 'other'],
      index: true
    },
    subCategory: {
      type: String,
      default: '',
      trim: true
    },
    aliases: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      default: '',
      maxlength: 300
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

skillSchema.index({ category: 1, isActive: 1 });

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
