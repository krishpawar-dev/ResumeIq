const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'cancelled', 'expired'],
      default: 'active',
      index: true
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: null
    },
    trialEndsAt: {
      type: Date,
      default: null
    },
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'manual', 'none'],
      default: 'none'
    },
    providerSubscriptionId: {
      type: String,
      default: null,
      select: false // Never expose payment provider IDs to frontend
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

subscriptionSchema.index({ status: 1, createdAt: -1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
