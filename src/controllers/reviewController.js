const reviewModel = require('../models/reviewModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');

// Get all reviews
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await reviewModel.getAll();
    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error getting reviews:', error.message);
    const err = new Error('Server error while retrieving reviews');
    err.status = 500;
    next(err);
  }
};

// Get a single review by ID
const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewModel.getById(id);
    
    if (!review) {
      const error = new Error('Review not found');
      error.status = 404;
      throw error;  
    }
    
    res.json({
      success: true,
      review
    });
  } catch (error) {
    next(error);
  }
};

// Create a new review
const createReview = async (req, res, next) => {
  try {
    const { product_id, rating, comment, user_id } = req.body;
    
    // Validate input
    if (!product_id || !user_id) {
      const error = new Error('Product ID and user ID are required');
      error.status = 400;
      throw error;
    }
    
    if (!rating || rating < 1 || rating > 5) {
      const error = new Error('Rating must be between 1 and 5');
      error.status = 400;
      throw error;
    }
    
    // Check if product exists
    const product = await productModel.getById(product_id);
    if (!product) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }
    
    // Check if user exists
    const user = await userModel.getById(user_id);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    
    // Check if user has already reviewed this product
    const existingReviews = await reviewModel.getByProductId(product_id);
    const userReview = existingReviews.find(review => review.user_id === parseInt(user_id));
    
    if (userReview) {
      const error = new Error('User has already reviewed this product');
      error.status = 400;
      throw error;
    }
    
    const review = await reviewModel.create({ 
      product_id, 
      user_id, 
      rating, 
      comment 
    });
    
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Error creating review:', error.message);
    next(error);
  }
};

// Update a review
const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment, user_id } = req.body;
    
    // Validate input
    if (!rating || !user_id) {
      const error = new Error('Rating and user ID are required');
      error.status = 400;
      throw error;
    }
    
    if (rating < 1 || rating > 5) {
      const error = new Error('Rating must be between 1 and 5');
      error.status = 400;
      throw error;
    }
    
    // Check if review exists
    const existingReview = await reviewModel.getById(id);
    if (!existingReview) {
      const error = new Error('Review not found');
      error.status = 404;
      throw error;
    }
    
    // Check if user is the author of the review
    if (existingReview.user_id !== parseInt(user_id)) {
      const error = new Error('Users can only update their own reviews');
      error.status = 403;
      throw error;
    }
    
    const updatedReview = await reviewModel.update(id, { rating, comment });
    res.json({ 
      success: true,
      message: 'Review updated successfully', 
      review: updatedReview 
    });
  } catch (error) {
    console.error('Error updating review:', error.message);
    next(error);
  }
};

// Delete a review
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      const error = new Error('User ID is required');
      error.status = 400;
      throw error;
    }
    
    // Check if review exists
    const existingReview = await reviewModel.getById(id);
    if (!existingReview) {
      const error = new Error('Review not found');
      error.status = 404;
      throw error;
    }
    
    if (existingReview.user_id !== parseInt(user_id)) {
      const error = new Error('Users can only delete their own reviews');
      error.status = 403;
      throw error;
    }
    
    const result = await reviewModel.remove(id);
    if (result) {
      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } else {
      const error = new Error('Failed to delete review');
      error.status = 500;
      throw error;
    }
  } catch (error) {
    console.error('Error deleting review:', error.message);
    next(error);
  }
};

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview
};
