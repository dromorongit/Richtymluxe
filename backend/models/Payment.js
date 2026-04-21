const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: [true, 'Payment reference is required'],
    unique: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'GHS'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentType: {
    type: String,
    required: [true, 'Payment type is required'],
    enum: ['product', 'service']
  },
  customerDetails: {
    name: {
      type: String,
      required: [true, 'Customer name is required']
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required']
    },
    email: {
      type: String
    },
    address: {
      type: String
    }
  },
  // For product payments
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: {
      type: String
    },
    quantity: {
      type: Number,
      default: 1
    },
    price: {
      type: Number
    }
  }],
  // For service payments
  serviceDetails: {
    service: {
      type: String
    },
    date: {
      type: String
    },
    time: {
      type: String
    },
    notes: {
      type: String
    }
  },
  paystackData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ reference: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentType: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);