const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const authMiddleware = require('../middleware/auth');
const { uploadTestimonial } = require('../config/cloudinary');

// Public — homepage row
router.get('/', testimonialController.getTestimonials);

// Admin
router.get('/admin/all',    authMiddleware, testimonialController.adminGetAllTestimonials);
router.post('/admin',       authMiddleware, uploadTestimonial.single('image'), testimonialController.createTestimonial);
router.put('/admin/:id',    authMiddleware, testimonialController.updateTestimonial);
router.delete('/admin/:id', authMiddleware, testimonialController.deleteTestimonial);

module.exports = router;