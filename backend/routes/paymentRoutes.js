const express = require('express');
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  getPayment,
  getAllPayments,
  paymentCallback
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/initialize', initializePayment);
router.get('/verify/:reference', verifyPayment);
router.get('/:reference', getPayment);
router.get('/callback', paymentCallback);

// Admin routes (protected)
router.get('/admin/all', protect, getAllPayments);

module.exports = router;