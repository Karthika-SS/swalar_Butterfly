const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const { uploadProduct, uploadCategory } = require('../config/cloudinary');

// ── Public routes ──────────────────────────────────────────────
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);

// ── Admin product routes ───────────────────────────────────────
router.get('/admin/all', authMiddleware, productController.adminGetAllProducts);

router.post(
  '/admin/create',
  authMiddleware,
  (req, res, next) => {
    uploadProduct.single('image')(req, res, function (err) {
      if (err) {
        console.error('UPLOAD ERROR:', err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  productController.createProduct
);

router.put(
  '/admin/:id',
  authMiddleware,
  (req, res, next) => {
    uploadProduct.single('image')(req, res, function (err) {
      if (err) {
        console.error('UPLOAD ERROR:', err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  productController.updateProduct
);

router.delete('/admin/:id', authMiddleware, productController.deleteProduct);

// ── Admin category routes ──────────────────────────────────────
router.post(
  '/admin/categories',
  authMiddleware,
  (req, res, next) => {
    uploadCategory.single('image')(req, res, function (err) {
      if (err) {
        console.error('CATEGORY UPLOAD ERROR:', err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  productController.createCategory
);

router.put(
  '/admin/categories/:id',
  authMiddleware,
  (req, res, next) => {
    uploadCategory.single('image')(req, res, function (err) {
      if (err) {
        console.error('CATEGORY UPLOAD ERROR:', err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  productController.updateCategory
);

router.delete('/admin/categories/:id', authMiddleware, productController.deleteCategory);

module.exports = router;