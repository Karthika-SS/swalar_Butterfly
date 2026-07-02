const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// ── Razorpay Webhook ──────────────────────────────────────────
// The raw-body parsing for this route is already handled in server.js
// (app.use('/api/orders/webhook/razorpay', express.raw(...)) runs before
// this router is even reached). So req.body here arrives as a raw Buffer.
router.post(
  '/webhook/razorpay',
  (req, res, next) => {
    // Keep the ORIGINAL raw bytes for signature verification.
    // (Don't overwrite req.body before saving this — Razorpay signs the
    // exact raw bytes, and re-serializing with JSON.stringify later would
    // not reliably match them.)
    req.rawBody = req.body; // Buffer
    try {
      req.body = JSON.parse(req.rawBody.toString('utf8'));
    } catch (e) {
      return res.status(400).json({ message: 'Invalid JSON payload' });
    }
    next();
  },
  orderController.razorpayWebhook
);

// Public routes
router.post('/', orderController.placeOrder);
router.post('/verify-payment', orderController.verifyPayment);   
router.get('/track/:phone', orderController.getOrdersByPhone);
router.get('/number/:orderNumber', orderController.getOrderByNumber);
router.get('/recent-purchases', orderController.getRecentPurchases);
// Admin routes
router.get('/admin/all', authMiddleware, orderController.adminGetAllOrders);
router.get('/admin/dashboard', authMiddleware, orderController.getDashboardStats);
router.put('/admin/:id/status', authMiddleware, orderController.updateOrderStatus);
router.delete('/admin/delete/:id', authMiddleware, orderController.deleteOrder);

module.exports = router;