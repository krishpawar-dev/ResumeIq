const mongoose = require('mongoose');

const jobCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Job category name is required'],
      unique: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      default: '',
      maxlength: 400
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobCategory',
      default: null
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

const JobCategory = mongoose.model('JobCategory', jobCategorySchema);

module.exports = JobCategory;
