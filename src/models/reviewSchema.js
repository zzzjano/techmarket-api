const mongoose = require('mongoose');
const { Schema } = mongoose;
const Joi = require('joi');

// Mongoose schema for MongoDB
const reviewSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId, 
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
    trim: true,
    minlength: [10, 'Content must be at least 10 characters'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  pros: {
    type: [String],
  },
  cons: {
    type: [String],
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0,
    min: [0, 'Helpful votes cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can only review a product once
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });


const Review = mongoose.model('Review', reviewSchema);

module.exports = {
  Review
};
