const { pool } = require('../config/db');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────────────────────
// Helper - Generate order number (called AFTER payment, uses DB count of confirmed+ orders)
// ─────────────────────────────────────────────────────────────
const generateOrderNumber = async (customerName, conn) => {
  const prefix = customerName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 5)
    .toUpperCase();

  // Count only real (non-pending) orders so number stays clean
  const [rows] = await (conn || pool).query(
    `SELECT COUNT(*) AS cnt FROM orders WHERE status != 'Pending'`
  );
  const next = (rows[0].cnt + 1).toString().padStart(5, '0');
  return `${prefix}${next}`;
};

// ─────────────────────────────────────────────────────────────
// PUBLIC - Place Order (validate + create Razorpay order only, NO DB insert)
// ─────────────────────────────────────────────────────────────
exports.placeOrder = async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_address, items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // ── Validate stock & build order items in memory ──
    let total_amount = 0;
    const orderItems = [];

    for (const item of items) {
      const [products] = await pool.query(
        'SELECT * FROM products WHERE id = ? AND is_active = TRUE',
        [item.product_id]
      );
      if (products.length === 0) {
        return res.status(400).json({ message: `Product not found: ${item.product_id}` });
      }
      const product = products[0];

      if (item.size) {
        const [sizeStockRows] = await pool.query(
          'SELECT stock FROM product_size_stock WHERE product_id = ? AND size = ?',
          [item.product_id, item.size]
        );
        if (sizeStockRows.length === 0) {
          return res.status(400).json({ message: `Size ${item.size} not available for ${product.name}` });
        }
        if (sizeStockRows[0].stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name} size ${item.size}` });
        }
      } else {
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }
      }

      total_amount += parseFloat(product.price) * item.quantity;
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        price: product.price,
        quantity: item.quantity,
        size: item.size || null,
      });
    }

    // ── Create Razorpay order (no DB insert yet) ──
    // Use a temp receipt = phone + timestamp so Razorpay receipt is unique
    const tempReceipt = `${customer_phone}_${Date.now()}`;

    const rpOrder = await razorpay.orders.create({
      amount: Math.round(total_amount * 100),
      currency: 'INR',
      receipt: tempReceipt,
      notes: {
        customer_name,
        customer_phone,
        customer_address: customer_address || '',
        notes: notes || '',
        // Store serialised items in Razorpay notes so verifyPayment can use them
        // Razorpay notes values must be strings ≤ 256 chars; keep it compact
        items: JSON.stringify(orderItems).substring(0, 256),
      },
    });

    // ── Return Razorpay payload to frontend ──
    return res.status(200).json({
      message: 'Stock validated. Complete payment to confirm order.',
      total_amount,
      payment_method: 'ONLINE',
      // Pass all order data back so frontend can send it with verifyPayment
      pending_order_data: {
        customer_name,
        customer_phone,
        customer_address,
        items: orderItems,
        notes: notes || null,
        total_amount,
      },
      razorpay: {
        key_id: process.env.RAZORPAY_KEY_ID,
        order_id: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: process.env.SHOP_NAME || 'Salwar Butterfly',
        description: 'Order Payment',
        prefill: { name: customer_name, contact: customer_phone },
        theme: { color: '#e91e8c' },
      },
    });
  } catch (err) {
    console.error('placeOrder error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUBLIC - Verify Payment → insert order into DB as Confirmed
// ─────────────────────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // Full order data sent back from frontend
      customer_name,
      customer_phone,
      customer_address,
      items,        // orderItems array from pending_order_data
      notes,
      total_amount,
    } = req.body;

    // ── 1. Verify Razorpay signature ──
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // ── 2. Idempotency: check if this Razorpay order was already saved ──
    const [existing] = await pool.query(
      'SELECT * FROM orders WHERE razorpay_order_id = ?',
      [razorpay_order_id]
    );
    if (existing.length > 0) {
      return res.json({
        message: 'Payment already verified. Order confirmed!',
        order_number: existing[0].order_number,
        total_amount: existing[0].total_amount,
      });
    }

    await conn.beginTransaction();

    // ── 3. Generate order number ──
    const order_number = await generateOrderNumber(customer_name, conn);

    // ── 4. Insert order as Confirmed directly ──
    const [orderResult] = await conn.query(
      `INSERT INTO orders
         (order_number, customer_name, customer_phone, customer_address,
          payment_method, total_amount, notes, status,
          razorpay_order_id, razorpay_payment_id, razorpay_signature)
       VALUES (?, ?, ?, ?, 'ONLINE', ?, ?, 'Confirmed', ?, ?, ?)`,
      [
        order_number, customer_name, customer_phone, customer_address,
        total_amount, notes || null,
        razorpay_order_id, razorpay_payment_id, razorpay_signature,
      ]
    );
    const order_id = orderResult.insertId;

    // ── 5. Insert order items & deduct stock ──
    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items
           (order_id, product_id, product_name, product_image, price, quantity, size)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [order_id, item.product_id, item.product_name, item.product_image,
         item.price, item.quantity, item.size]
      );

      // Deduct stock
      if (item.size) {
        await conn.query(
          'UPDATE product_size_stock SET stock = stock - ? WHERE product_id = ? AND size = ? AND stock >= ?',
          [item.quantity, item.product_id, item.size, item.quantity]
        );
        await conn.query(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [item.quantity, item.product_id, item.quantity]
        );
      } else {
        await conn.query(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [item.quantity, item.product_id, item.quantity]
        );
      }
    }

    await conn.commit();

    // ── 6. WhatsApp confirmation URL ──
    const shopWhatsApp = process.env.SHOP_WHATSAPP || '';
    const waText = encodeURIComponent(
      `Hi! My payment is confirmed for order ${order_number}.\nTotal: Rs.${parseFloat(total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}\nPlease process my order. 🙏`
    );
    const whatsapp_url = shopWhatsApp ? `https://wa.me/${shopWhatsApp}?text=${waText}` : null;

    return res.json({
      message: 'Payment verified. Order confirmed!',
      order_number,
      total_amount,
      whatsapp_url,
    });
  } catch (err) {
    await conn.rollback();
    console.error('verifyPayment error:', err);
    res.status(500).json({ message: 'Server error during payment verification' });
  } finally {
    conn.release();
  }
};

// ─────────────────────────────────────────────────────────────
// PUBLIC - Razorpay Webhook (fallback if browser closes before verifyPayment)
// ─────────────────────────────────────────────────────────────
exports.razorpayWebhook = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'];
      const digest = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      if (digest !== signature) return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payment = req.body.payload?.payment?.entity;
    const rpOrderId = payment?.order_id;
    if (!rpOrderId) return res.status(200).json({ message: 'No order_id in payload, ignored' });

    if (event === 'payment.captured') {
      // Check if order already saved (verifyPayment ran first)
      const [existing] = await pool.query(
        'SELECT * FROM orders WHERE razorpay_order_id = ?', [rpOrderId]
      );

      if (existing.length > 0) {
        // Already confirmed via verifyPayment — nothing to do
        if (existing[0].status === 'Confirmed') {
          return res.status(200).json({ message: 'Already confirmed' });
        }
        // Edge case: row exists but not confirmed — update it
        await pool.query(
          `UPDATE orders SET status = 'Confirmed', razorpay_payment_id = ? WHERE id = ?`,
          [payment.id, existing[0].id]
        );
        return res.status(200).json({ message: 'Order confirmed via webhook' });
      }

      // Order not in DB yet (browser closed before verifyPayment)
      // Fetch order details from Razorpay notes
      const rpOrderDetails = await razorpay.orders.fetch(rpOrderId);
      const n = rpOrderDetails.notes || {};

      const customer_name = n.customer_name || 'Unknown';
      const customer_phone = n.customer_phone || '';
      const customer_address = n.customer_address || '';
      const notes = n.notes || null;
      const total_amount = rpOrderDetails.amount / 100;

      // items were truncated in notes — we can only save a minimal order here
      // Stock deduction won't happen; admin will need to handle manually
      // For full reliability, rely on verifyPayment on the frontend
      await conn.beginTransaction();

      const order_number = await generateOrderNumber(customer_name, conn);

      const [orderResult] = await conn.query(
        `INSERT INTO orders
           (order_number, customer_name, customer_phone, customer_address,
            payment_method, total_amount, notes, status,
            razorpay_order_id, razorpay_payment_id, razorpay_signature)
         VALUES (?, ?, ?, ?, 'ONLINE', ?, ?, 'Confirmed', ?, ?, 'webhook')`,
        [order_number, customer_name, customer_phone, customer_address,
         total_amount, notes, rpOrderId, payment.id]
      );

      await conn.commit();
      console.log(`[Webhook] Order ${order_number} CONFIRMED (webhook fallback)`);
    }

    if (event === 'payment.failed') {
      // Nothing to update since order isn't in DB yet
      console.log(`[Webhook] Payment failed for Razorpay order ${rpOrderId} — no DB record to update`);
    }

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (err) {
    await conn.rollback();
    console.error('Webhook error:', err);
    return res.status(200).json({ message: 'Webhook error, logged' });
  } finally {
    conn.release();
  }
};

// ─────────────────────────────────────────────────────────────
// PUBLIC - Recent Purchases
// ─────────────────────────────────────────────────────────────
exports.getRecentPurchases = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.customer_name, oi.product_id, oi.product_name,
              oi.product_image, o.customer_address, o.created_at
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status IN ('Confirmed', 'Shipped', 'Delivered')
       ORDER BY o.created_at DESC
       LIMIT 20`
    );
    res.json(rows);
  } catch (err) {
    console.error('getRecentPurchases error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUBLIC - Track order by phone
// ─────────────────────────────────────────────────────────────
exports.getOrdersByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE customer_phone = ? AND status != 'Pending'
       ORDER BY created_at DESC`,
      [phone]
    );
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        return { ...order, items };
      })
    );
    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderByNumber = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE order_number = ?',
      [req.params.orderNumber]
    );
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orders[0].id]);
    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN - Get All Orders
// ─────────────────────────────────────────────────────────────
exports.adminGetAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const params = [];
    let whereClause = "WHERE status != 'Pending'"; // never show pending

    if (status && status !== 'Pending') {
      whereClause = 'WHERE status = ?';
      params.push(status);
    }

    const query = `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [orders] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM orders ${whereClause}`,
      status && status !== 'Pending' ? [status] : []
    );

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        return { ...order, items };
      })
    );

    res.json({ orders: ordersWithItems, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN - Update Order Status
// ─────────────────────────────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Confirmed', 'Shipped', 'Delivered', 'Payment Failed', 'Cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    const [updated] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN - Delete Order
// ─────────────────────────────────────────────────────────────
exports.deleteOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { id } = req.params;
    const [orders] = await conn.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }
    await conn.query('DELETE FROM order_items WHERE order_id = ?', [id]);
    await conn.query('DELETE FROM orders WHERE id = ?', [id]);
    await conn.commit();
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('deleteOrder error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN - Dashboard Stats
// ─────────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ total_orders }]] = await pool.query(
      "SELECT COUNT(*) as total_orders FROM orders WHERE status != 'Pending'"
    );
    const [[{ total_products }]] = await pool.query(
      'SELECT COUNT(*) as total_products FROM products WHERE is_active = TRUE'
    );
    const [[{ total_revenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status IN ('Confirmed','Shipped','Delivered')"
    );
    const [[{ pending_orders }]] = await pool.query(
      "SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'Pending'"
    );
    const [recent_orders] = await pool.query(
      "SELECT * FROM orders WHERE status != 'Pending' ORDER BY created_at DESC LIMIT 5"
    );
    const [monthly_revenue] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month,
             SUM(total_amount) as revenue, COUNT(*) as orders
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND status IN ('Confirmed','Shipped','Delivered')
      GROUP BY month ORDER BY month ASC
    `);
    res.json({ total_orders, total_products, total_revenue, pending_orders, recent_orders, monthly_revenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};