const mongoose = require('mongoose');

const interviewCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: 80
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      maxlength: 500
    },
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'situational', 'project', 'hr', 'mixed'],
      default: 'technical'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    questionCount: {
      type: Number,
      default: 0
    },
    icon: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate slug from name
interviewCategorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

const InterviewCategory = mongoose.model('InterviewCategory', interviewCategorySchema);

module.exports = InterviewCategory;
