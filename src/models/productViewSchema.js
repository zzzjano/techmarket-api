const mongoose = require('mongoose');
const { Schema } = mongoose;

const productViewSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // Can be null for anonymous views
    index: true
  },
  viewDate: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  duration: {
    type: Number, // Duration in seconds
    min: 0,
    default: 0
  },
  source: {
    type: String,
    enum: ['search', 'recommendation', 'direct', 'category', 'social', 'email'],
    required: true
  }
});

// Create compound indexes for common queries
productViewSchema.index({ productId: 1, viewDate: 1 });
productViewSchema.index({ userId: 1, viewDate: 1 });

const ProductView = mongoose.model('ProductView', productViewSchema);

module.exports = ProductView;
