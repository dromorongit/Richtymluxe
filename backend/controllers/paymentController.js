const asyncHandler = require('express-async-handler');
const Paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);
const Payment = require('../models/Payment');
const Product = require('../models/Product');

// Initialize payment
const initializePayment = asyncHandler(async (req, res) => {
  const {
    amount,
    email,
    paymentType,
    customerDetails,
    items,
    serviceDetails
  } = req.body;

  // Validate required fields
  if (!amount || !paymentType || !customerDetails) {
    res.status(400);
    throw new Error('Missing required payment information');
  }

  // Convert amount to kobo (Paystack expects amount in kobo)
  const amountInKobo = Math.round(amount * 100);

  // Create payment record
  const payment = new Payment({
    amount,
    currency: 'GHS',
    paymentType,
    customerDetails,
    items: paymentType === 'product' ? items : [],
    serviceDetails: paymentType === 'service' ? serviceDetails : {}
  });

  await payment.save();

  // Initialize Paystack transaction
  const paystackResponse = await Paystack.transaction.initialize({
    amount: amountInKobo,
    email: email || customerDetails.email || `${customerDetails.phone}@temp.com`,
    reference: payment._id.toString(),
    callback_url: `${req.protocol}://${req.get('host')}/payment/callback`,
    metadata: {
      payment_id: payment._id.toString(),
      payment_type: paymentType,
      customer_name: customerDetails.name,
      customer_phone: customerDetails.phone
    }
  });

  // Update payment with Paystack reference
  payment.reference = paystackResponse.data.reference;
  await payment.save();

  res.json({
    success: true,
    payment: payment,
    paystack: paystackResponse.data
  });
});

// Verify payment
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  if (!reference) {
    res.status(400);
    throw new Error('Payment reference is required');
  }

  // Verify with Paystack
  const paystackResponse = await Paystack.transaction.verify(reference);

  if (!paystackResponse.data) {
    res.status(400);
    throw new Error('Payment verification failed');
  }

  // Find and update payment record
  const payment = await Payment.findOne({ reference });

  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  // Update payment status based on Paystack response
  if (paystackResponse.data.status === 'success') {
    payment.status = 'success';
    payment.paystackData = paystackResponse.data;

    // If product payment, update stock quantities
    if (payment.paymentType === 'product' && payment.items.length > 0) {
      for (const item of payment.items) {
        const product = await Product.findById(item.productId);
        if (product && product.stockQuantity >= item.quantity) {
          product.stockQuantity -= item.quantity;
          await product.save();
        }
      }
    }
  } else {
    payment.status = 'failed';
    payment.paystackData = paystackResponse.data;
  }

  await payment.save();

  res.json({
    success: true,
    payment: payment,
    paystack: paystackResponse.data
  });
});

// Get payment by reference
const getPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const payment = await Payment.findOne({ reference });

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  res.json({
    success: true,
    payment
  });
});

// Get all payments (admin only)
const getAllPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status;
  const paymentType = req.query.paymentType;

  const query = {};
  if (status) query.status = status;
  if (paymentType) query.paymentType = paymentType;

  const payments = await Payment.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments(query);

  res.json({
    success: true,
    payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Payment callback handler
const paymentCallback = asyncHandler(async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res.redirect('/?payment=cancelled');
  }

  try {
    // Verify the payment
    const paystackResponse = await Paystack.transaction.verify(reference);
    const payment = await Payment.findOne({ reference });

    if (paystackResponse.data.status === 'success' && payment) {
      payment.status = 'success';
      payment.paystackData = paystackResponse.data;
      await payment.save();

      // Redirect to success page
      return res.redirect('/?payment=success&ref=' + reference);
    } else {
      // Redirect to failure page
      return res.redirect('/?payment=failed&ref=' + reference);
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    return res.redirect('/?payment=error');
  }
});

module.exports = {
  initializePayment,
  verifyPayment,
  getPayment,
  getAllPayments,
  paymentCallback
};