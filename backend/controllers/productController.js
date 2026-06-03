const {pool} = require('../config/db');
const { cloudinary } = require('../config/cloudinary');

// ── PUBLIC ─────────────────────────────────────────────────────

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (category) { query += ' AND p.category_id = ?'; params.push(category); }
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
    else query += ' ORDER BY p.created_at DESC';

    const [products] = await pool.query(query, params);

    // Attach size stock to each product
    const productIds = products.map(p => p.id);
    if (productIds.length > 0) {
      const [sizeStocks] = await pool.query(
        'SELECT * FROM product_size_stock WHERE product_id IN (?)',
        [productIds]
      );
      products.forEach(p => {
        p.size_stock = sizeStocks.filter(s => s.product_id === p.id);
      });
    }

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ? AND p.is_active = TRUE`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });

    const product = rows[0];

    // Attach per-size stock
    const [sizeStock] = await pool.query(
      'SELECT size, stock FROM product_size_stock WHERE product_id = ?',
      [product.id]
    );
    product.size_stock = sizeStock;

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
      GROUP BY c.id ORDER BY c.name
    `);
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── ADMIN PRODUCTS ─────────────────────────────────────────────

exports.adminGetAllProducts = async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC`
    );

    const productIds = products.map(p => p.id);
    if (productIds.length > 0) {
      const [sizeStocks] = await pool.query(
        'SELECT * FROM product_size_stock WHERE product_id IN (?)',
        [productIds]
      );
      products.forEach(p => {
        p.size_stock = sizeStocks.filter(s => s.product_id === p.id);
      });
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createProduct = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { name, description, price, stock, category_id, sizes, size_stock } = req.body;
    const image_url = req.file?.path || null;
    const image_public_id = req.file?.filename || null;

    // sizes is a comma-separated string e.g. "S,M,L,XL"
    const [result] = await conn.query(
      `INSERT INTO products (name, description, price, stock, category_id, image_url, image_public_id, sizes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, stock || 0, category_id || null, image_url, image_public_id, sizes || null]
    );

    const product_id = result.insertId;

    // Insert per-size stock if provided
    // size_stock comes as JSON string: [{"size":"S","stock":10},{"size":"M","stock":5}]
    if (size_stock) {
      let sizeStockArr = [];
      try { sizeStockArr = JSON.parse(size_stock); } catch {}
      for (const entry of sizeStockArr) {
        if (entry.size) {
          await conn.query(
            `INSERT INTO product_size_stock (product_id, size, stock)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE stock = VALUES(stock)`,
            [product_id, entry.size, entry.stock || 0]
          );
        }
      }
    }

    await conn.commit();

    const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [product_id]);
    const [sizeStockResult] = await pool.query('SELECT size, stock FROM product_size_stock WHERE product_id = ?', [product_id]);
    res.status(201).json({ ...product[0], size_stock: sizeStockResult });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

exports.updateProduct = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { name, description, price, stock, category_id, is_active, sizes, size_stock } = req.body;
    const [existing] = await conn.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) { await conn.rollback(); return res.status(404).json({ message: 'Product not found' }); }

    let image_url = existing[0].image_url;
    let image_public_id = existing[0].image_public_id;

    if (req.file) {
      if (image_public_id) await cloudinary.uploader.destroy(image_public_id).catch(console.error);
      image_url = req.file.path;
      image_public_id = req.file.filename;
    }

    const finalSizes = sizes !== undefined ? sizes : existing[0].sizes;

    await conn.query(
      `UPDATE products SET name=?, description=?, price=?, stock=?, category_id=?,
       image_url=?, image_public_id=?, is_active=?, sizes=? WHERE id=?`,
      [
        name, description, price, stock, category_id || null,
        image_url, image_public_id,
        is_active !== undefined ? is_active : existing[0].is_active,
        finalSizes, req.params.id,
      ]
    );

    // Update per-size stock
    if (size_stock) {
      let sizeStockArr = [];
      try { sizeStockArr = JSON.parse(size_stock); } catch {}
      // Delete all existing size stock for this product first
      await conn.query('DELETE FROM product_size_stock WHERE product_id = ?', [req.params.id]);
      for (const entry of sizeStockArr) {
        if (entry.size) {
          await conn.query(
            `INSERT INTO product_size_stock (product_id, size, stock) VALUES (?, ?, ?)`,
            [req.params.id, entry.size, entry.stock || 0]
          );
        }
      }
    }

    await conn.commit();

    const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    const [sizeStockResult] = await pool.query('SELECT size, stock FROM product_size_stock WHERE product_id = ?', [req.params.id]);
    res.json({ ...updated[0], size_stock: sizeStockResult });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Product not found' });
    if (existing[0].image_public_id) await cloudinary.uploader.destroy(existing[0].image_public_id).catch(console.error);
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── ADMIN CATEGORIES ───────────────────────────────────────────

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Category name is required' });

    const [existing] = await pool.query(
  'SELECT id FROM categories WHERE LOWER(name) = LOWER(?)',
  [name.trim()]
);
    if (existing.length > 0) return res.status(400).json({ message: 'A category with this name already exists' });

    const image_url = req.file?.path || null;
    const image_public_id = req.file?.filename || null;

    const [result] = await pool.query(
      'INSERT INTO categories (name, description, image_url, image_public_id) VALUES (?, ?, ?, ?)',
      [name.trim(), description || '', image_url, image_public_id]
    );
    const [category] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(category[0]);
  } catch (err) {
    console.error('createCategory error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Category not found' });

    if (name?.trim()) {
     const [dup] = await pool.query(
  'SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id != ?',
  [name.trim(), id]
);
      if (dup.length > 0) return res.status(400).json({ message: 'A category with this name already exists' });
    }

    let image_url = existing[0].image_url;
    let image_public_id = existing[0].image_public_id;
    if (req.file) {
      if (image_public_id) await cloudinary.uploader.destroy(image_public_id).catch(console.error);
      image_url = req.file.path;
      image_public_id = req.file.filename;
    }

    await pool.query(
      'UPDATE categories SET name=?, description=?, image_url=?, image_public_id=? WHERE id=?',
      [name ? name.trim() : existing[0].name, description !== undefined ? description : existing[0].description, image_url, image_public_id, id]
    );
    const [updated] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('updateCategory error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Category not found' });
    await pool.query('UPDATE products SET category_id = NULL WHERE category_id = ?', [id]);
    if (existing[0].image_public_id) await cloudinary.uploader.destroy(existing[0].image_public_id).catch(console.error);
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};