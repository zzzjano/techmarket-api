const mongoose = require('mongoose');
const { Schema } = mongoose;
const { cartItemSchema } = require('./cartItemSchema');

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  items: {
    type: [cartItemSchema],
    default: []
  },
  total: {
    type: Number,
    default: 0,
    min: [0, 'Total cannot be negative'],
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

cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Recalculate total based on items
  if (this.items && this.items.length > 0) {
    this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  } else {
    this.total = 0;
  }
  
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
