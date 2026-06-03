const express = require('express');
const router = express.Router();

const {
  getSettings,
  updateSettings,
  uploadQRCode,
  uploadLogo,
  uploadImage
} = require('../controllers/settingsController');

const authMiddleware = require('../middleware/auth'); // ✅ FIXED
const { uploadQR } = require('../config/cloudinary'); // ✅ FIXED

// PUBLIC
router.get('/', getSettings);

// ADMIN
router.put('/admin/update', authMiddleware, updateSettings);

router.post('/admin/upload-qr', authMiddleware, uploadQR.single('qr'), uploadQRCode);
router.post('/admin/upload-logo', authMiddleware, uploadQR.single('logo'), uploadLogo);
router.post('/admin/upload-image', authMiddleware, uploadQR.single('image'), uploadImage);

module.exports = router;