// config/cloudinary.js
// Add uploadCategory alongside your existing uploadProduct and uploadQR

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Products ──────────────────────────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shop/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});
const uploadProduct = multer({ storage: productStorage });

// ── QR / Logo ─────────────────────────────────────────────────
const qrStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shop/settings',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
  },
});
const uploadQR = multer({ storage: qrStorage });

// ── Categories ────────────────────────────────────────────────
const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shop/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});
const uploadCategory = multer({ storage: categoryStorage });

module.exports = { cloudinary, uploadProduct, uploadQR, uploadCategory };