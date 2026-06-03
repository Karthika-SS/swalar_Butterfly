const mysql = require('mysql2/promise');
require('dotenv').config();

// ─── Pool ─────────────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,

  ssl: { rejectUnauthorized: false },
});

// ─── Keep-alive (prevents Aiven idle timeout) ─────────────────────────────────
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('DB Keep-Alive Ping ✓');
  } catch (err) {
    console.error('DB Ping Failed:', err.message);
  }
}, 5 * 60 * 1000);

// ─── Schema init ──────────────────────────────────────────────────────────────
async function initDB() {
  const conn = await pool.getConnection();

  try {
    // ── admins ──────────────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        email      VARCHAR(255) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ── categories ──────────────────────────────────────────────────────────
    await conn.query(`
  CREATE TABLE IF NOT EXISTS categories (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(100) NOT NULL UNIQUE,
    description      TEXT         DEFAULT NULL,
    image_url        VARCHAR(500) DEFAULT NULL,
    image_public_id  VARCHAR(255) DEFAULT NULL,
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
  )
`);
    // ── products ────────────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id               INT AUTO_INCREMENT PRIMARY KEY,
        name             VARCHAR(255)  NOT NULL,
        description      TEXT,
        price            DECIMAL(10,2) NOT NULL,
        stock            INT           DEFAULT 0,
        category_id      INT,
        image_url        VARCHAR(500),
        image_public_id  VARCHAR(255),
        sizes            VARCHAR(500)  DEFAULT NULL,
        is_active        BOOLEAN       DEFAULT TRUE,
        created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // ── product_size_stock ──────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_size_stock (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT         NOT NULL,
        size       VARCHAR(20) NOT NULL,
        stock      INT         NOT NULL DEFAULT 0,
        UNIQUE KEY uq_product_size (product_id, size),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // ── orders ──────────────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id                   INT AUTO_INCREMENT PRIMARY KEY,
        order_number         VARCHAR(20)   NOT NULL UNIQUE,
        customer_name        VARCHAR(255)  NOT NULL,
        customer_phone       VARCHAR(20)   NOT NULL,
        customer_address     TEXT          NOT NULL,
        payment_method       VARCHAR(20)   NOT NULL DEFAULT 'ONLINE',
        razorpay_order_id    VARCHAR(100)  NULL,
        razorpay_payment_id  VARCHAR(100)  NULL,
        razorpay_signature   VARCHAR(256)  NULL,
        total_amount         DECIMAL(10,2) NOT NULL,
        status               VARCHAR(50)   NOT NULL DEFAULT 'Pending',
        notes                TEXT,
        created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        updated_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── order_items ─────────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        order_id      INT           NOT NULL,
        product_id    INT,
        product_name  VARCHAR(255)  NOT NULL,
        product_image VARCHAR(500),
        price         DECIMAL(10,2) NOT NULL,
        quantity      INT           NOT NULL,
        size          VARCHAR(20)   DEFAULT NULL,
        FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      )
    `);

    // ── settings ────────────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        setting_key   VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── Indexes (try/catch because CREATE INDEX has no IF NOT EXISTS on older MySQL)
    for (const sql of [
      'CREATE INDEX idx_orders_rp_order_id ON orders (razorpay_order_id)',
      'CREATE INDEX idx_pss_product ON product_size_stock (product_id)',
    ]) {
      try { await conn.query(sql); } catch (_) { /* already exists — skip */ }
    }

    // ── Seed: settings ──────────────────────────────────────────────────────
    // ── Seed: settings ──────────────────────────────────────────────────────
const seedSettings = [
  ['shop_name',          "Women's Choice"],
  ['shop_phone',         '7010354442'],
  ['shop_tagline',       'Style that speaks to you'],
  ['upi_id',             ''],
  ['qr_image_url',       ''],
  ['qr_image_public_id', ''],
];
for (const [key, value] of seedSettings) {
  await conn.query(
    'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_key = setting_key',
    [key, value]
  );
}

    // ── Seed: categories ────────────────────────────────────────────────────
    await conn.query(`
      INSERT INTO categories (name) VALUES
        ('Kurtis'), ('Sarees'), ('Sets'), ('Tops'), ('Bottoms')
      ON DUPLICATE KEY UPDATE name = name
    `);

    // ── Seed: default admin (password: admin123) ─────────────────────────────
    await conn.query(`
      INSERT INTO admins (email, password) VALUES
        ('admin@shop.com', '$2a$10$kokih.oO2lhA0G0Usb.tVeKEfU0iLYzYRZgYpdWYREEGZXYnQvX8C')
      ON DUPLICATE KEY UPDATE email = email
    `);

    console.log('✅ DB initialised');
  } finally {
    conn.release();
  }
}

module.exports = { pool, initDB };