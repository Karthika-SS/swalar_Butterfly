const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// ── Razorpay Webhook ──────────────────────────────────────────
// IMPORTANT: This must use express.raw() body parser, NOT express.json()
// because Razorpay signature verification needs the raw body.
// Mount this BEFORE any JSON body-parser middleware on this route.
// In server.js / app.js add:
//   app.use('/api/orders/webhook/razorpay', express.raw({ type: 'application/json' }));
// then require this router.
router.post(
  '/webhook/razorpay',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // Parse raw body back to object for our handler
    if (Buffer.isBuffer(req.body)) {
      req.body = JSON.parse(req.body.toString());
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

