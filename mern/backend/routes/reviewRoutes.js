const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController.js');
const { authenticate } = require('../middleware/auth.js');

// Add a review
router.post('/product/:productId/review', authenticate, reviewController.addReview);

// Get product reviews
router.get('/product/:productId/reviews', reviewController.getProductReviews);

module.exports = router;
