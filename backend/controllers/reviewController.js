const { pool } = require('../config/db');

// ── PUBLIC: Get all reviews for a product ─────────────────────
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const [reviews] = await pool.query(
      `SELECT r.*, 
              LEFT(r.customer_phone, 4) AS phone_hint
       FROM reviews r
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );

    // Hide full phone — only show first 4 digits like "98XX XXXXXX"
    const safeReviews = reviews.map(r => ({
      ...r,
      customer_phone: undefined, // remove raw phone
      phone_hint: r.phone_hint + 'XXXXXX',
    }));

    res.json(safeReviews);
  } catch (err) {
    console.error('getProductReviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PUBLIC: Get recent reviews for homepage carousel ──────────
exports.getRecentReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.title, r.body, r.customer_name,
              r.created_at, p.name AS product_name, p.id AS product_id,
              p.image_url AS product_image,
              LEFT(r.customer_phone, 4) AS phone_hint
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       ORDER BY r.created_at DESC
       LIMIT ?`,
      [limit]
    );

    const safeReviews = reviews.map(r => ({
      ...r,
      phone_hint: r.phone_hint + 'XXXXXX',
    }));

    res.json(safeReviews);
  } catch (err) {
    console.error('getRecentReviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PUBLIC: Check if a phone can review a product ─────────────
// Returns: { canReview, alreadyReviewed, deliveredOrderId }
exports.checkCanReview = async (req, res) => {
  try {
    const { phone, productId } = req.query;
    if (!phone || !productId) {
      return res.status(400).json({ message: 'phone and productId are required' });
    }

    // 1. Find a delivered order from this phone containing this product
    const [orders] = await pool.query(
      `SELECT o.id FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.customer_phone = ?
         AND oi.product_id = ?
         AND o.status = 'Delivered'
       LIMIT 1`,
      [phone.trim(), productId]
    );

    if (orders.length === 0) {
      return res.json({ canReview: false, alreadyReviewed: false, deliveredOrderId: null });
    }

    const deliveredOrderId = orders[0].id;

    // 2. Check if they already reviewed this product
    const [existing] = await pool.query(
      `SELECT id FROM reviews WHERE customer_phone = ? AND product_id = ?`,
      [phone.trim(), productId]
    );

    if (existing.length > 0) {
      return res.json({ canReview: false, alreadyReviewed: true, deliveredOrderId });
    }

    res.json({ canReview: true, alreadyReviewed: false, deliveredOrderId });
  } catch (err) {
    console.error('checkCanReview error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PUBLIC: Submit a review ───────────────────────────────────
exports.submitReview = async (req, res) => {
  try {
    const { product_id, customer_phone, customer_name, rating, title, body } = req.body;

    // Validate required fields
    if (!product_id || !customer_phone || !rating) {
      return res.status(400).json({ message: 'product_id, customer_phone, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // 1. Verify: delivered order exists for this phone + product
    const [orders] = await pool.query(
      `SELECT o.id FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.customer_phone = ?
         AND oi.product_id = ?
         AND o.status = 'Delivered'
       LIMIT 1`,
      [customer_phone.trim(), product_id]
    );

    if (orders.length === 0) {
      return res.status(403).json({
        message: 'You can only review products from delivered orders',
      });
    }

    // 2. Prevent duplicate reviews
    const [existing] = await pool.query(
      `SELECT id FROM reviews WHERE customer_phone = ? AND product_id = ?`,
      [customer_phone.trim(), product_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // 3. Insert review
    const [result] = await pool.query(
      `INSERT INTO reviews (product_id, order_id, customer_phone, customer_name, rating, title, body)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id,
        orders[0].id,
        customer_phone.trim(),
        customer_name?.trim() || 'Anonymous',
        rating,
        title?.trim() || '',
        body?.trim() || '',
      ]
    );

    res.status(201).json({ message: 'Review submitted successfully', id: result.insertId });
  } catch (err) {
    console.error('submitReview error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── ADMIN: Get all reviews ────────────────────────────────────
exports.adminGetAllReviews = async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `SELECT r.*, p.name AS product_name
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       ORDER BY r.created_at DESC`
    );
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── ADMIN: Delete a review ────────────────────────────────────
exports.adminDeleteReview = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM reviews WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Review not found' });
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};