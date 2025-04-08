const mongoose = require('mongoose');
const { Review } = require('../models/reviewSchema');
const ProductView = require('../models/productViewSchema');
const Product = require('../models/productSchema');

/**
 * Get review statistics by rating for a specific product
 * Returns percentage distribution and average rating
 */
const getReviewStatsByRating = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    // Get total reviews count for percentage calculation
    const totalReviews = await Review.countDocuments({ 
      productId: new mongoose.Types.ObjectId(productId) 
    });
    
    if (totalReviews === 0) {
      return res.json({
        success: true,
        productId,
        totalReviews: 0,
        averageRating: 0,
        distribution: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        },
        percentageDistribution: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
      });
    }
    
    // Aggregate to get the count by rating
    const ratingDistribution = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { 
          _id: '$rating', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: -1 } }
    ]);
    
    // Get average rating
    const averageRating = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { 
          _id: null, 
          average: { $avg: '$rating' } 
        } 
      }
    ]);
    
    // Transform to a complete distribution with percentages
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const percentageDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    ratingDistribution.forEach(item => {
      distribution[item._id] = item.count;
      percentageDistribution[item._id] = parseFloat(((item.count / totalReviews) * 100).toFixed(2));
    });
    
    res.json({
      success: true,
      productId,
      totalReviews,
      averageRating: averageRating.length > 0 ? parseFloat(averageRating[0].average.toFixed(2)) : 0,
      distribution,
      percentageDistribution
    });
    
  } catch (error) {
    console.error('Error getting review statistics by rating:', error.message);
    next(error);
  }
};

/**
 * Get review trend over time for a product or all products
 * Returns number of reviews and average rating per day
 */
const getReviewTrend = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate, interval = 'day' } = req.query;
    
    // Validate dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days by default
    const end = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    // Build match stage based on parameters
    const match = { 
      createdAt: { $gte: start, $lte: end } 
    };
    
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      match.productId = new mongoose.Types.ObjectId(productId);
    }
    
    // Determine grouping format based on interval
    let dateFormat;
    let dateGroup;
    
    switch (interval.toLowerCase()) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00';
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'week':
        dateFormat = 'Week %U, %Y';
        dateGroup = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        dateFormat = '%Y-%m';
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      case 'day':
      default:
        dateFormat = '%Y-%m-%d';
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }
    
    // Aggregate to get reviews over time
    const reviewTrend = await Review.aggregate([
      { $match: match },
      {
        $group: {
          _id: dateGroup,
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          date: { $first: '$createdAt' }
        }
      },
      {
        $project: {
          _id: 0,
          date: 1,
          count: 1,
          averageRating: { $round: ['$averageRating', 2] }
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    res.json({
      success: true,
      startDate: start,
      endDate: end,
      interval,
      trend: reviewTrend
    });
    
  } catch (error) {
    console.error('Error getting review trend:', error.message);
    next(error);
  }
};

/**
 * Get product view statistics
 * Returns total views, unique users, and average view duration
 */
const getProductViewStats = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    // Validate dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days by default
    const end = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    // Match stage
    const match = {
      productId: new mongoose.Types.ObjectId(productId),
      viewDate: { $gte: start, $lte: end }
    };
    
    // Get total views
    const totalViews = await ProductView.countDocuments(match);
    
    // Get unique users
    const uniqueUsers = await ProductView.aggregate([
      { $match: { ...match, userId: { $ne: null } } },
      { $group: { _id: '$userId' } },
      { $count: 'count' }
    ]);
    
    // Get average view duration
    const avgDuration = await ProductView.aggregate([
      { $match: match },
      { $group: { 
          _id: null, 
          averageDuration: { $avg: '$duration' } 
        } 
      }
    ]);
    
    // Get source breakdown
    const sourceBreakdown = await ProductView.aggregate([
      { $match: match },
      { $group: { 
          _id: '$source', 
          count: { $sum: 1 } 
        } 
      },
      { $project: {
          _id: 0,
          source: '$_id',
          count: 1
        }
      }
    ]);
    
    // Transform source breakdown into an object
    const sources = {};
    sourceBreakdown.forEach(src => {
      sources[src.source] = src.count;
    });
    
    // Get product details
    const product = await Product.findById(productId);
    
    res.json({
      success: true,
      productId,
      productName: product ? product.name : 'Unknown Product',
      startDate: start,
      endDate: end,
      totalViews,
      uniqueUsers: uniqueUsers.length > 0 ? uniqueUsers[0].count : 0,
      anonymousViews: totalViews - (uniqueUsers.length > 0 ? uniqueUsers[0].count : 0),
      averageDuration: avgDuration.length > 0 ? parseFloat(avgDuration[0].averageDuration.toFixed(2)) : 0,
      sourceBreakdown: sources
    });
    
  } catch (error) {
    console.error('Error getting product view statistics:', error.message);
    next(error);
  }
};

/**
 * Get product view trend over time
 * Returns views per day/hour/week/month
 */
const getViewTrend = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate, interval = 'day' } = req.query;
    
    // Validate dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days by default
    const end = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    // Build match stage based on parameters
    const match = { 
      viewDate: { $gte: start, $lte: end } 
    };
    
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      match.productId = new mongoose.Types.ObjectId(productId);
    }
    
    // Determine grouping format based on interval
    let dateFormat;
    let dateGroup;
    
    switch (interval.toLowerCase()) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00';
        dateGroup = {
          year: { $year: '$viewDate' },
          month: { $month: '$viewDate' },
          day: { $dayOfMonth: '$viewDate' },
          hour: { $hour: '$viewDate' }
        };
        break;
      case 'week':
        dateFormat = 'Week %U, %Y';
        dateGroup = {
          year: { $year: '$viewDate' },
          week: { $week: '$viewDate' }
        };
        break;
      case 'month':
        dateFormat = '%Y-%m';
        dateGroup = {
          year: { $year: '$viewDate' },
          month: { $month: '$viewDate' }
        };
        break;
      case 'day':
      default:
        dateFormat = '%Y-%m-%d';
        dateGroup = {
          year: { $year: '$viewDate' },
          month: { $month: '$viewDate' },
          day: { $dayOfMonth: '$viewDate' }
        };
    }
    
    // Aggregate to get views over time
    const viewTrend = await ProductView.aggregate([
      { $match: match },
      {
        $group: {
          _id: dateGroup,
          totalViews: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          averageDuration: { $avg: '$duration' },
          date: { $first: '$viewDate' }
        }
      },
      {
        $project: {
          _id: 0,
          date: 1,
          totalViews: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          averageDuration: { $round: ['$averageDuration', 2] }
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    res.json({
      success: true,
      startDate: start,
      endDate: end,
      interval,
      trend: viewTrend
    });
    
  } catch (error) {
    console.error('Error getting view trend:', error.message);
    next(error);
  }
};

/**
 * Get product recommendations based on:
 * 1. User's browsing history
 * 2. Similarity coefficient between users
 * 3. Products viewed by similar users
 */
const getProductRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // 1. Get user's browsing history (last 30 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
      const userViewHistory = await ProductView.find({
      userId: new mongoose.Types.ObjectId(userId)
    }).select('productId');
    
    // Handle edge case: user has no browsing history
    if (userViewHistory.length === 0) {
      // Fallback to popular products
      const popularProducts = await ProductView.aggregate([
        {
          $group: {
            _id: '$productId',
            viewCount: { $sum: 1 }
          }
        },
        { $sort: { viewCount: -1 } },
        { $limit: 5 }
      ]);
      
      const productIds = popularProducts.map(item => item._id);
      const products = await Product.find({ _id: { $in: productIds } });
      
      return res.json({
        success: true,
        recommendations: products
      });
    }
    
    // Extract viewed product IDs
    const viewedProductIds = userViewHistory.map(view => view.productId);    // 2. Calculate similarity coefficient between users
    const similarUsers = await ProductView.aggregate([      {
        $match: {
          productId: { $in: viewedProductIds },
          userId: { 
            $nin: [new mongoose.Types.ObjectId(userId), null]  // Wykluczamy aktualnego użytkownika i gości
          }
        }
      },
      {
        $group: {
          _id: '$userId',
          commonProducts: { $addToSet: '$productId' },
          commonCount: { $sum: 1 }
        }
      },
      {
        $addFields: {
          // Calculate similarity as the count of common products divided by user's history length
          similarity: { $divide: ['$commonCount', viewedProductIds.length] }
        }
      },
      { $sort: { similarity: -1 } },
      { $limit: 5 } // Top 5 similar users
    ]);
    
    // Handle edge case: no similar users found
    if (similarUsers.length === 0) {
      // Fallback to popular products
      const popularProducts = await ProductView.aggregate([
        {
          $group: {
            _id: '$productId',
            viewCount: { $sum: 1 }
          }
        },
        { $sort: { viewCount: -1 } },
        { $limit: 5 }
      ]);
      
      const productIds = popularProducts.map(item => item._id);
      const products = await Product.find({ _id: { $in: productIds } });
      
      return res.json({
        success: true,
        recommendations: products
      });
    }
    
    // 3. Find products viewed by similar users that the current user hasn't seen
    const similarUserIds = similarUsers.map(user => user._id);
    
    const recommendedProducts = await ProductView.aggregate([
      {
        $match: {
          userId: { $in: similarUserIds },
          productId: { $nin: viewedProductIds } // Exclude products already viewed by user
        }
      },
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 } // Simple count of views
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Get product details
    const productIds = recommendedProducts.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } });
    
    res.json({
      success: true,
      recommendations: products,
      similarUsers: similarUsers
    });
    
  } catch (error) {
    console.error('Error generating product recommendations:', error.message);
    next(error);
  }
};

module.exports = {
  getReviewStatsByRating,
  getReviewTrend,
  getProductViewStats,
  getViewTrend,
  getProductRecommendations
};
