const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const reviewValidatorMiddleware = require('../middleware/reviewValidatorMiddleware');

// Get all reviews
router.get('/', reviewController.getAllReviews);

// Get review by ID
router.get('/:id', reviewController.getReviewById);

// Create a new review
router.post('/', reviewValidatorMiddleware, reviewController.createReview);

// Update a review
router.put('/:id', reviewValidatorMiddleware, reviewController.updateReview);

// Delete a review
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
