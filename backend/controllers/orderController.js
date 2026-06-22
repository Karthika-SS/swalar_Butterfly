const {pool} = require('../config/db');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// ─────────────────────────────────────────────────────────────
// PUBLIC - Place Order (ONLINE only)
// ─────────────────────────────────────────────────────────────
exports.placeOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { customer_name, customer_phone, customer_address, items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    let total_amount = 0;
    const orderItems = [];

    for (const item of items) {
      const [products] = await conn.query(
        'SELECT * FROM products WHERE id = ? AND is_active = TRUE',
        [item.product_id]
      );
      if (products.length === 0) {
        await conn.rollback();
        return res.status(400).json({ message: `Product not found: ${item.product_id}` });
      }
      const product = products[0];

      if (item.size) {
        const [sizeStockRows] = await conn.query(
          'SELECT stock FROM product_size_stock WHERE product_id = ? AND size = ?',
          [item.product_id, item.size]
        );
        if (sizeStockRows.length === 0) {
          await conn.rollback();
          return res.status(400).json({ message: `Size ${item.size} not available for ${product.name}` });
        }
        if (sizeStockRows[0].stock < item.quantity) {
          await conn.rollback();
          return res.status(400).json({ message: `Insufficient stock for ${product.name} size ${item.size}` });
        }
      } else {
        if (product.stock < item.quantity) {
          await conn.rollback();
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

    const order_number = generateOrderNumber();

    const [orderResult] = await conn.query(
      `INSERT INTO orders
         (order_number, customer_name, customer_phone, customer_address,
          payment_method, total_amount, notes, status)
       VALUES (?, ?, ?, ?, 'ONLINE', ?, ?, 'Pending')`,
      [order_number, customer_name, customer_phone, customer_address, total_amount, notes || null]
    );

    const order_id = orderResult.insertId;

    for (const item of orderItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, size)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [order_id, item.product_id, item.product_name, item.product_image, item.price, item.quantity, item.size]
      );
    }

    await conn.commit();

    // ── Create Razorpay order ──────────────────────────────────
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(total_amount * 100),
      currency: 'INR',
      receipt: order_number,
      notes: { order_id: String(order_id), order_number, customer_phone },
    });

    await pool.query('UPDATE orders SET razorpay_order_id = ? WHERE id = ?', [rpOrder.id, order_id]);

    // ── Build WhatsApp confirmation link ───────────────────────
    // After checkout, frontend should open this URL in a new tab
    // so the customer can send a confirmation message to the shop.
    const shopWhatsApp = process.env.SHOP_WHATSAPP || '';
    const waText = encodeURIComponent(
      `Hi! I just placed an order at your shop.\nOrder No: ${order_number}\nTotal: Rs.${parseFloat(total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}\nPlease confirm my order. 🙏`
    );
    const whatsapp_url = shopWhatsApp
      ? `https://wa.me/${shopWhatsApp}?text=${waText}`
      : null;

    return res.status(201).json({
      message: 'Order created. Complete payment.',
      order_number,
      order_id,
      total_amount,
      payment_method: 'ONLINE',
      whatsapp_url,           // ← frontend opens this after successful payment
      razorpay: {
        key_id: process.env.RAZORPAY_KEY_ID,
        order_id: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: process.env.SHOP_NAME || "Salwar Butterfly",
        description: `Order ${order_number}`,
        prefill: { name: customer_name, contact: customer_phone },
        theme: { color: '#e91e8c' },
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error('placeOrder error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

// ─────────────────────────────────────────────────────────────
// PUBLIC - Verify Payment & deduct size-based stock
// ─────────────────────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body).digest('hex');

    if (expectedSig !== razorpay_signature) {
      await pool.query(
        `UPDATE orders SET status = 'Payment Failed', razorpay_payment_id = ?, razorpay_signature = ? WHERE id = ?`,
        [razorpay_payment_id, razorpay_signature, order_id]
      );
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Order not found' });

    const order = rows[0];
    if (order.status === 'Confirmed') {
      return res.json({ message: 'Payment already verified', order_number: order.order_number });
    }

    await pool.query(
      `UPDATE orders SET status = 'Confirmed', razorpay_payment_id = ?, razorpay_signature = ? WHERE id = ?`,
      [razorpay_payment_id, razorpay_signature, order_id]
    );

    // ── Deduct stock (size-based if size exists) ───────────────
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order_id]);
    for (const item of items) {
      if (item.size) {
        await pool.query(
          'UPDATE product_size_stock SET stock = stock - ? WHERE product_id = ? AND size = ? AND stock >= ?',
          [item.quantity, item.product_id, item.size, item.quantity]
        );
        await pool.query(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [item.quantity, item.product_id, item.quantity]
        );
      } else {
        await pool.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    // ── Build WhatsApp confirmation link for response ──────────
    const shopWhatsApp = process.env.SHOP_WHATSAPP || '';
    const waText = encodeURIComponent(
      `Hi! My payment is confirmed for order ${order.order_number}.\nTotal: Rs.${parseFloat(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}\nPlease process my order. 🙏`
    );
    const whatsapp_url = shopWhatsApp
      ? `https://wa.me/${shopWhatsApp}?text=${waText}`
      : null;

    return res.json({
      message: 'Payment verified. Order confirmed!',
      order_number: order.order_number,
      total_amount: order.total_amount,
      whatsapp_url,           // ← frontend can open this on the success page
    });
  } catch (err) {
    console.error('verifyPayment error:', err);
    res.status(500).json({ message: 'Server error during payment verification' });
  }
};


// Paste this function anywhere in your existing orderController.js
 
exports.getRecentPurchases = async (req, res) => {
  try {
    // Fetch last 20 order items from orders placed in the last 7 days
    // Only needs: product_name, product_image, customer_address, created_at
    const [rows] = await pool.query(
  `SELECT 
      o.customer_name ,
     oi.product_name,
     oi.product_image,
     o.customer_address,
     o.created_at
   FROM order_items oi
   JOIN orders o ON oi.order_id = o.id
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
// PUBLIC - Razorpay Webhook
// ─────────────────────────────────────────────────────────────
exports.razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'];
      const digest = crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(req.body)).digest('hex');
      if (digest !== signature) return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payment = req.body.payload?.payment?.entity;
    const rpOrderId = payment?.order_id;
    if (!rpOrderId) return res.status(200).json({ message: 'No order_id in payload, ignored' });

    const [rows] = await pool.query('SELECT * FROM orders WHERE razorpay_order_id = ?', [rpOrderId]);
    if (rows.length === 0) return res.status(200).json({ message: 'Order not found, ignored' });

    const order = rows[0];

    if (event === 'payment.captured') {
      if (order.status === 'Confirmed') return res.status(200).json({ message: 'Already confirmed' });

      await pool.query(
        `UPDATE orders SET status = 'Confirmed', razorpay_payment_id = ?, razorpay_signature = 'webhook' WHERE id = ?`,
        [payment.id, order.id]
      );

      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      for (const item of items) {
        if (item.size) {
          await pool.query(
            'UPDATE product_size_stock SET stock = stock - ? WHERE product_id = ? AND size = ? AND stock >= ?',
            [item.quantity, item.product_id, item.size, item.quantity]
          );
          await pool.query(
            'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
            [item.quantity, item.product_id, item.quantity]
          );
        } else {
          await pool.query(
            'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
            [item.quantity, item.product_id, item.quantity]
          );
        }
      }
      console.log(`[Webhook] Order ${order.order_number} CONFIRMED`);
    }

    if (event === 'payment.failed') {
      if (!['Confirmed', 'Payment Failed'].includes(order.status)) {
        await pool.query("UPDATE orders SET status = 'Payment Failed' WHERE id = ?", [order.id]);
        console.log(`[Webhook] Order ${order.order_number} FAILED`);
      }
    }

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(200).json({ message: 'Webhook error, logged' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUBLIC - Track order by phone
// ─────────────────────────────────────────────────────────────
exports.getOrdersByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE customer_phone = ? ORDER BY created_at DESC', [phone]
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
    const [orders] = await pool.query('SELECT * FROM orders WHERE order_number = ?', [req.params.orderNumber]);
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orders[0].id]);
    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────
exports.adminGetAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM orders';
    const params = [];
    if (status) { query += ' WHERE status = ?'; params.push(status); }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [orders] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM orders${status ? ' WHERE status = ?' : ''}`,
      status ? [status] : []
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

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Payment Failed', 'Cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    const [updated] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) as total_orders FROM orders');
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) as total_products FROM products WHERE is_active = TRUE');
    const [[{ total_revenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status IN ('Confirmed','Shipped','Delivered')"
    );
    const [[{ pending_orders }]] = await pool.query("SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'Pending'");
    const [recent_orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');
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