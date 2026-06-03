-- ============================================================
-- COMPLETE DATABASE SETUP — Size-based stock, Online payment only
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- ── Tables ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  image_public_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  category_id INT,
  image_url VARCHAR(500),
  image_public_id VARCHAR(255),
  sizes VARCHAR(500) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Per-size stock for each product
CREATE TABLE IF NOT EXISTS product_size_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  size VARCHAR(20) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_product_size (product_id, size),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Online payment only
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(20) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT NOT NULL,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
  razorpay_order_id VARCHAR(100) NULL,
  razorpay_payment_id VARCHAR(100) NULL,
  razorpay_signature VARCHAR(256) NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500),
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  size VARCHAR(20) DEFAULT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── REVIEWS TABLE ─────────────────────────────────────────────
-- customer_phone is used to identify buyer (no login system)
-- order_id links to the delivered order for verification
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  order_id INT NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255) DEFAULT '',
  body TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- One review per phone per product
  UNIQUE KEY uq_review (customer_phone, product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ── Indexes ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_orders_rp_order_id ON orders (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_pss_product ON product_size_stock (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_phone ON reviews (customer_phone);

-- ── Seed data ─────────────────────────────────────────────────

INSERT INTO settings (setting_key, setting_value) VALUES
  ('shop_name', "Women's Choice"),
  ('shop_phone', '7010354442'),
  ('shop_tagline', 'Style that speaks to you'),
  ('upi_id', ''),
  ('qr_image_url', ''),
  ('qr_image_public_id', '')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

ALTER TABLE categories 
ADD UNIQUE INDEX uq_category_name (name);

INSERT INTO admins (email, password) VALUES
  ('admin@shop.com', '$2a$10$kokih.oO2lhA0G0Usb.tVeKEfU0iLYzYRZgYpdWYREEGZXYnQvX8C')
ON DUPLICATE KEY UPDATE email = email;

-- ── Safe migrations for existing databases ────────────────────

ALTER TABLE orders
  MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  MODIFY COLUMN payment_method VARCHAR(20) NOT NULL DEFAULT 'ONLINE';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS razorpay_order_id   VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS razorpay_signature  VARCHAR(256) NULL;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sizes VARCHAR(500) DEFAULT NULL;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS size VARCHAR(20) DEFAULT NULL;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS description     TEXT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS image_url       VARCHAR(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS image_public_id VARCHAR(255) DEFAULT NULL;

CREATE TABLE IF NOT EXISTS product_size_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  size VARCHAR(20) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_product_size (product_id, size),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Migration: add reviews table if not exists (safe to run on existing DB)
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  order_id INT NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
  rating TINYINT NOT NULL,
  title VARCHAR(255) DEFAULT '',
  body TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_review (customer_phone, product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_phone ON reviews (customer_phone);

-- ── Verify ────────────────────────────────────────────────────

DESCRIBE products;
DESCRIBE product_size_stock;
DESCRIBE orders;
DESCRIBE order_items;
DESCRIBE reviews;