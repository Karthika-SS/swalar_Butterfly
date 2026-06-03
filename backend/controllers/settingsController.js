const {pool} = require('../config/db');
const { cloudinary } = require('../config/cloudinary');

/* ── helper: upsert a setting ── */
const upsert = (pool, key, value) =>
  pool.query(
    'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
    [key, value, value]
  );

/* PUBLIC - get all settings as key/value map */
exports.getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
    const settings = {};
    rows.forEach(row => { settings[row.setting_key] = row.setting_value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ADMIN - update any text/JSON settings */
exports.updateSettings = async (req, res) => {
  try {
    // Accept any key sent in body (all are safe text/JSON values)
    const allowedKeys = [
      'shop_name', 'shop_phone', 'shop_email', 'shop_tagline', 'upi_id',
      'shop_logo_url',
      'hero_eyebrow', 'hero_title', 'hero_subtitle',
      'featured_section_title',
      'banner_slides',
      'feature1_title', 'feature1_desc',
      'feature2_title', 'feature2_desc',
      'feature3_title', 'feature3_desc',
      'feature4_title', 'feature4_desc',
    ];

    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        await upsert(pool, key, req.body[key]);
      }
    }

    res.json({ message: 'Settings updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ADMIN - upload UPI QR code */
exports.uploadQRCode = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Delete old QR if exists
    const [oldQR] = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'qr_image_public_id'");
    if (oldQR.length > 0 && oldQR[0].setting_value) {
      await cloudinary.uploader.destroy(oldQR[0].setting_value).catch(console.error);
    }

    const qr_url = req.file.path;
    const qr_public_id = req.file.filename;

    await upsert(pool, 'qr_image_url', qr_url);
    await upsert(pool, 'qr_image_public_id', qr_public_id);

    res.json({ message: 'QR code uploaded', qr_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ADMIN - upload shop logo */
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Delete old logo if exists
    const [old] = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'shop_logo_public_id'");
    if (old.length > 0 && old[0].setting_value) {
      await cloudinary.uploader.destroy(old[0].setting_value).catch(console.error);
    }

    const logo_url = req.file.path;
    const logo_public_id = req.file.filename;

    await upsert(pool, 'shop_logo_url', logo_url);
    await upsert(pool, 'shop_logo_public_id', logo_public_id);

    res.json({ message: 'Logo uploaded', logo_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ADMIN - upload a generic image (banner slides etc.) */
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: req.file.path, public_id: req.file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};