const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Get all reviews with pagination
router.get('/', reviewController.getAllReviews);

// Get a specific review by ID
router.get('/:id', reviewController.getReviewById);

// Get reviews for a specific product with pagination
router.get('/product/:productId', reviewController.getReviewsForProduct);

// Get review statistics for a product
router.get('/product/:productId/stats', reviewController.getProductReviewStats);

// Vote a review as helpful
router.post('/:id/vote', reviewController.voteReviewHelpful);

// Create a new review 
router.post('/', reviewController.createReview);

// Update a review 
router.put('/:id', reviewController.updateReview);

// Delete a review 
router.delete('/:id', reviewController.deleteReview);

// Advanced search endpoint for reviews with filtering
router.get('/search', reviewController.searchReviews);

module.exports = router;
