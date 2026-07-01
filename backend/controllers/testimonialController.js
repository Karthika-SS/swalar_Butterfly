const { pool } = require('../config/db');

// ── PUBLIC: active testimonials for homepage ─────────────────
exports.getTestimonials = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, customer_name, image_url, caption, created_at
       FROM testimonials
       WHERE is_active = TRUE
       ORDER BY display_order ASC, created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('getTestimonials error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── ADMIN: all testimonials ───────────────────────────────────
exports.adminGetAllTestimonials = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM testimonials ORDER BY display_order ASC, created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('adminGetAllTestimonials error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── ADMIN: create — accepts multipart/form-data with "image" file ──
// multer-storage-cloudinary puts the Cloudinary URL in req.file.path
// and the public_id in req.file.filename
exports.createTestimonial = async (req, res) => {
  try {
    const { customer_name, caption, display_order } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ message: 'customer_name is required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'image is required' });
    }

    const image_url       = req.file.path;      // Cloudinary URL
    const image_public_id = req.file.filename;  // Cloudinary public_id

    const [result] = await pool.query(
      `INSERT INTO testimonials (customer_name, image_url, image_public_id, caption, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [
        customer_name.trim(),
        image_url,
        image_public_id || null,
        caption?.trim() || null,
        Number(display_order) || 0,
      ]
    );

    res.status(201).json({ message: 'Testimonial added', id: result.insertId });
  } catch (err) {
    console.error('createTestimonial error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── ADMIN: update ─────────────────────────────────────────────
exports.updateTestimonial = async (req, res) => {
  try {
    const { customer_name, caption, display_order, is_active } = req.body;

    const fields = [];
    const values = [];

    if (customer_name !== undefined) { fields.push('customer_name = ?'); values.push(customer_name.trim()); }
    if (caption !== undefined)       { fields.push('caption = ?');       values.push(caption?.trim() || null); }
    if (display_order !== undefined) { fields.push('display_order = ?'); values.push(Number(display_order) || 0); }
    if (is_active !== undefined)     { fields.push('is_active = ?');     values.push(!!is_active); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(req.params.id);
    const [result] = await pool.query(
      `UPDATE testimonials SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Testimonial not found' });
    res.json({ message: 'Testimonial updated' });
  } catch (err) {
    console.error('updateTestimonial error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── ADMIN: delete ─────────────────────────────────────────────
exports.deleteTestimonial = async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT image_public_id FROM testimonials WHERE id = ?',
      [req.params.id]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'Testimonial not found' });

    await pool.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);

    // Best-effort Cloudinary cleanup
    if (existing[0].image_public_id) {
      const cloudinary = require('../config/cloudinary').cloudinary;
      cloudinary.uploader.destroy(existing[0].image_public_id).catch(() => {});
    }

    res.json({ message: 'Testimonial deleted' });
  } catch (err) {
    console.error('deleteTestimonial error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};