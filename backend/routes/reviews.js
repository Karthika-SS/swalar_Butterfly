const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// ── Public routes ──────────────────────────────────────────────

// Get all reviews for a specific product (shown on ProductDetails page)
router.get('/product/:productId', reviewController.getProductReviews);

// Get recent reviews across all products (shown on Home page carousel)
router.get('/recent', reviewController.getRecentReviews);

// Check if a phone number can review a product
// Usage: GET /api/reviews/check?phone=9876543210&productId=5
router.get('/check', reviewController.checkCanReview);

// Submit a new review
router.post('/', reviewController.submitReview);

// ── Admin routes ───────────────────────────────────────────────

// Get all reviews (for admin panel)
router.get('/admin/all', authMiddleware, reviewController.adminGetAllReviews);

// Delete a review
router.delete('/admin/:id', authMiddleware, reviewController.adminDeleteReview);

module.exports = router;