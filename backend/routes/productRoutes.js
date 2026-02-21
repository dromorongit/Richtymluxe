const express = require('express');
const router = express.Router();
const {
  getBoutiqueProducts,
  getMobileProducts,
  getProductById,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/boutique', getBoutiqueProducts);
router.get('/mobile', getMobileProducts);
router.get('/:id', getProductById);

// Admin routes (protected)
router.get('/admin/all', protect, getAllProductsAdmin);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
