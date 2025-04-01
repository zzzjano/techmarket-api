const { Review } = require('./index');
const User = require('./userSchema');
const Product = require('./productSchema');
const mongoose = require('mongoose');

// Get all reviews with pagination
const getAll = async (skip = 0, limit = 10) => {
  return await Review.find()
    .populate('userId', 'username')
    .populate('productId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Get the total count of reviews
const getTotalCount = async () => {
  return await Review.countDocuments();
};

// Get a single review by ID
const getById = async (id) => {
  return await Review.findById(id)
    .populate('userId', 'username')
    .populate('productId', 'name');
};

// Get all reviews for a specific product with pagination and sorting
const getByProductId = async (productId, skip = 0, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') => {
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return await Review.find({ productId })
    .populate('userId', 'username')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Get count of reviews for a product
const getProductReviewsCount = async (productId) => {
  return await Review.countDocuments({ productId });
};

// Get all reviews by a specific user
const getByUserId = async (userId, skip = 0, limit = 10) => {
  return await Review.find({ userId })
    .populate('productId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Create a new review
const create = async (review) => {
  const newReview = new Review({
    productId: review.productId,
    userId: review.userId,
    rating: review.rating,
    title: review.title || '',
    content: review.content || review.comment || '', // Support both content and legacy comment field
    pros: review.pros || [],
    cons: review.cons || [],
    verifiedPurchase: review.verifiedPurchase || false,
    helpfulVotes: review.helpfulVotes || 0
  });
  
  return await newReview.save();
};

// Update a review
const update = async (id, reviewData) => {
  const review = await Review.findById(id);
  
  if (!review) {
    throw new Error('Review not found');
  }
  
  // Update fields if provided
  if (reviewData.rating !== undefined) {
    review.rating = reviewData.rating;
  }
  
  if (reviewData.title !== undefined) {
    review.title = reviewData.title;
  }
  
  if (reviewData.content !== undefined) {
    review.content = reviewData.content;
  } else if (reviewData.comment !== undefined) {
    // Support legacy comment field
    review.content = reviewData.comment;
  }
  
  if (reviewData.pros !== undefined) {
    review.pros = reviewData.pros;
  }
  
  if (reviewData.cons !== undefined) {
    review.cons = reviewData.cons;
  }
  
  if (reviewData.verifiedPurchase !== undefined) {
    review.verifiedPurchase = reviewData.verifiedPurchase;
  }
  
  if (reviewData.helpfulVotes !== undefined) {
    review.helpfulVotes = reviewData.helpfulVotes;
  }
  
  // Update timestamp
  review.updatedAt = Date.now();
  
  await review.save();
  
  return review;
};

// Delete a review
const remove = async (id) => {
  const result = await Review.deleteOne({ _id: id });
  return result.deletedCount > 0;
};

// Get product average rating
const getProductAverageRating = async (productId) => {
  const result = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    { 
      $group: {
        _id: '$productId',
        average_rating: { $avg: '$rating' },
        total_reviews: { $sum: 1 }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      average_rating: '0.0',
      total_reviews: 0
    };
  }
  
  return {
    average_rating: result[0].average_rating.toFixed(1),
    total_reviews: result[0].total_reviews
  };
};

// Get product rating distribution
const getProductRatingDistribution = async (productId) => {
  const distribution = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);
  
  // Transform into a complete 5-star distribution
  const result = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };
  
  distribution.forEach(item => {
    result[item._id] = item.count;
  });
  
  return result;
};

// Vote a review as helpful
const voteHelpful = async (id) => {
  const review = await Review.findById(id);
  
  if (!review) {
    return null;
  }
  
  review.helpfulVotes += 1;
  await review.save();
  
  return review;
};

// Advanced search for reviews with multiple filters
const searchReviews = async (options = {}) => {
  // Build the filter object
  const filter = {};
  
  // Product filter
  if (options.productId) {
    filter.productId = options.productId;
  }
  
  // User filter
  if (options.userId) {
    filter.userId = options.userId;
  }
  
  // Text search in title and content
  if (options.searchText && options.searchText.trim() !== '') {
    const searchPattern = new RegExp(options.searchText.trim(), 'i');
    filter.$or = [
      { title: searchPattern },
      { content: searchPattern }
    ];
  }
  
  // Rating range filter
  if (options.minRating !== undefined || options.maxRating !== undefined) {
    filter.rating = {};
    
    if (options.minRating !== undefined) {
      filter.rating.$gte = Number(options.minRating);
    }
    
    if (options.maxRating !== undefined) {
      filter.rating.$lte = Number(options.maxRating);
    }
  }
  
  // Verified purchase filter
  if (options.verifiedPurchase !== undefined) {
    filter.verifiedPurchase = options.verifiedPurchase === 'true' || options.verifiedPurchase === true;
  }
  
  // Handle pagination
  const page = options.page ? Number(options.page) : 1;
  const limit = options.limit ? Number(options.limit) : 10;
  const skip = (page - 1) * limit;
  
  // Build sort options
  let sortOption = { createdAt: -1 }; // Default sort by newest
  
  if (options.sortBy) {
    switch (options.sortBy) {
      case 'rating-high':
        sortOption = { rating: -1 };
        break;
      case 'rating-low':
        sortOption = { rating: 1 };
        break;
      case 'date-new':
        sortOption = { createdAt: -1 };
        break;
      case 'date-old':
        sortOption = { createdAt: 1 };
        break;
      case 'helpful':
        sortOption = { helpfulVotes: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
  }
  
  // Execute query with all filters and pagination
  const reviews = await Review.find(filter)
    .populate('userId', 'username')
    .populate('productId', 'name')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const totalReviews = await Review.countDocuments(filter);
  
  return {
    reviews,
    totalReviews,
    page,
    totalPages: Math.ceil(totalReviews / limit),
    limit
  };
};

module.exports = {
  getAll,
  getTotalCount,
  getById,
  getByProductId,
  getProductReviewsCount,
  getByUserId,
  create,
  update,
  remove,
  getProductAverageRating,
  getProductRatingDistribution,
  voteHelpful,
  searchReviews
};
