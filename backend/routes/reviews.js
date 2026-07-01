const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// Public
router.post('/', reviewController.submitReview);
router.get('/recent', reviewController.getRecentReviews);
router.get('/can-review', reviewController.checkCanReview);
router.get('/product/:productId', reviewController.getProductReviews);

// Admin (moderation)
router.get('/admin/all', authMiddleware, reviewController.adminGetAllReviews);
router.delete('/admin/:id', authMiddleware, reviewController.adminDeleteReview);

module.exports = router;