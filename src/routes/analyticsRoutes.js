const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Review analytics endpoints
router.get('/reviews/stats/rating/:productId', analyticsController.getReviewStatsByRating);
router.get('/reviews/trend/:productId?', analyticsController.getReviewTrend);

// View analytics endpoints
router.get('/views/stats/:productId', analyticsController.getProductViewStats);
router.get('/views/trend/:productId?', analyticsController.getViewTrend);

// Product recommendation endpoint
router.get('/recommendations/user/:userId', analyticsController.getProductRecommendations);

module.exports = router;
