const mongoose = require('mongoose');
const Cart = require('./cartSchema');
const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [255, 'Product name cannot exceed 255 characters']
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    minlength: [10, 'Description must be at least 10 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  stockCount: {
    type: Number,
    required: [true, 'Stock count is required'],
    min: [0, 'Stock count cannot be negative'],
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    minlength: [2, 'Brand must be at least 2 characters'],
    maxlength: [100, 'Brand cannot exceed 100 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  isAvailable: {
    type: Boolean,
    default: true
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

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
