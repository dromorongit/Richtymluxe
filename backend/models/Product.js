const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  longDescription: {
    type: String,
    trim: true
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  salesPrice: {
    type: Number,
    min: [0, 'Sales price cannot be negative']
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Stock quantity cannot be negative']
  },
  category: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  additionalImages: [{
    type: String
  }],
  colors: [{
    type: String,
    trim: true
  }],
  isNew: {
    type: Boolean,
    default: false
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  productType: {
    type: String,
    required: [true, 'Product type is required'],
    enum: ['boutique', 'mobile'],
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate discount percentage virtual
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.salesPrice && this.originalPrice > this.salesPrice) {
    return Math.round(((this.originalPrice - this.salesPrice) / this.originalPrice) * 100);
  }
  return 0;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Index for search
productSchema.index({ productName: 'text', shortDescription: 'text' });

module.exports = mongoose.model('Product', productSchema);
