const reviewModel = require('../models/reviewModel');
const productModel = require('../models/productModel');
const mongoose = require('mongoose');

// Get all reviews with pagination
const getAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reviews = await reviewModel.getAll(skip, limit);
    const totalReviews = await reviewModel.getTotalCount();
    
    res.json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalReviews / limit),
      totalReviews,
      reviews
    });
  } catch (error) {
    console.error('Error getting reviews:', error.message);
    const err = new Error('Server error while retrieving reviews');
    err.status = 500;
    next(err);
  }
};

// Get reviews for a specific product with pagination and sorting
const getReviewsForProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    
    const reviews = await reviewModel.getByProductId(productId, skip, limit, sortBy, sortOrder);
    const totalReviews = await reviewModel.getProductReviewsCount(productId);
    
    res.json({
      success: true,
      productId,
      currentPage: page,
      totalPages: Math.ceil(totalReviews / limit),
      totalReviews,
      reviews
    });
  } catch (error) {
    console.error('Error getting product reviews:', error.message);
    next(error);
  }
};

// Get a single review by ID
const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const review = await reviewModel.getById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
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
    const { productId, userId, rating, title, content, pros, cons, verifiedPurchase } = req.body;
  
    
    // Check if product exists
    const product = await productModel.getById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    try {
      const review = await reviewModel.create({ 
        productId, 
        userId, 
        rating, 
        title, 
        content, 
        pros, 
        cons, 
        verifiedPurchase 
      });
      
      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        review
      });
    } catch (error) {
      // Handle duplicate review error (user already reviewed this product)
      if (error.code === 11000) { // MongoDB duplicate key error
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating review:', error.message);
    next(error);
  }
};

// Update a review
const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, content, pros, cons, userId } = req.body;
    
    // Check if review exists
    const existingReview = await reviewModel.getById(id);
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user is the author of the review
    if (existingReview.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Users can only update their own reviews'
      });
    }
    
    const updatedReview = await reviewModel.update(id, { 
      rating, 
      title, 
      content, 
      pros, 
      cons 
    });
    
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
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Check if review exists
    const existingReview = await reviewModel.getById(id);
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user is the author of the review
    if (existingReview.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Users can only delete their own reviews'
      });
    }
    
    const result = await reviewModel.remove(id);
    if (result) {
      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete review'
      });
    }
  } catch (error) {
    console.error('Error deleting review:', error.message);
    next(error);
  }
};

// Get review statistics for a product (average rating, rating distribution)
const getProductReviewStats = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    // Get average rating and total reviews
    const averageStats = await reviewModel.getProductAverageRating(productId);
    
    // Get rating distribution
    const ratingDistribution = await reviewModel.getProductRatingDistribution(productId);
    
    res.json({
      success: true,
      productId,
      averageRating: averageStats.average_rating,
      totalReviews: averageStats.total_reviews,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error getting review statistics:', error.message);
    next(error);
  }
};

// Vote review as helpful
const voteReviewHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const review = await reviewModel.voteHelpful(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Vote recorded successfully',
      helpfulVotes: review.helpfulVotes
    });
  } catch (error) {
    console.error('Error voting review as helpful:', error.message);
    next(error);
  }
};

// Advanced search for reviews with multiple filters
const searchReviews = async (req, res, next) => {
  try {
    const {
      productId,
      userId,
      searchText,
      minRating,
      maxRating,
      verifiedPurchase,
      sortBy,
      page,
      limit
    } = req.query;
    
    // Validate ObjectIds if provided
    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Validate rating range if provided
    if (minRating !== undefined && (isNaN(minRating) || minRating < 1 || minRating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Minimum rating must be between 1 and 5'
      });
    }
    
    if (maxRating !== undefined && (isNaN(maxRating) || maxRating < 1 || maxRating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Maximum rating must be between 1 and 5'
      });
    }
    
    if (minRating !== undefined && maxRating !== undefined && Number(minRating) > Number(maxRating)) {
      return res.status(400).json({
        success: false,
        message: 'Minimum rating cannot be greater than maximum rating'
      });
    }
    
    // Execute the search
    const result = await reviewModel.searchReviews({
      productId,
      userId,
      searchText,
      minRating: minRating !== undefined ? Number(minRating) : undefined,
      maxRating: maxRating !== undefined ? Number(maxRating) : undefined,
      verifiedPurchase,
      sortBy,
      page: page !== undefined ? Number(page) : 1,
      limit: limit !== undefined ? Number(limit) : 10
    });
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('Error searching reviews:', error.message);
    next(error);
  }
};

module.exports = {
  getAllReviews,
  getReviewById,
  getReviewsForProduct,
  createReview,
  updateReview,
  deleteReview,
  getProductReviewStats,
  voteReviewHelpful,
  searchReviews
};
