const express = require('express');
const cors = require('cors');

const { initDB } = require('./config/db'); // ← adjust path if your db.js is elsewhere
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://swalar-butterfly.vercel.app',
    'https://www.salwarbutterfly.in'
  ],
  credentials: true,
}));

// ⚠️ Webhook needs the RAW request body for signature verification.
// This must be registered BEFORE express.json(), otherwise express.json()
// consumes the request stream first and the webhook breaks.
app.use(
  '/api/orders/webhook/razorpay',
  express.raw({ type: 'application/json' })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// ── Boot: init DB first, then start listening ─────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Failed to initialise DB:', err.message);
    process.exit(1);
  });