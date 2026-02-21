const Product = require('../models/Product');

// @desc    Get all boutique products (public)
// @route   GET /api/products/boutique
// @access  Public
const getBoutiqueProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      productType: 'boutique',
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all mobile phone products (public)
// @route   GET /api/products/mobile
// @access  Public
const getMobileProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      productType: 'mobile',
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID (public)
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (!product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products for admin
// @route   GET /api/products/admin/all
// @access  Private/Admin
const getAllProductsAdmin = async (req, res) => {
  try {
    const { productType, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (productType) {
      query.productType = productType;
    }
    
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalProducts: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      productName,
      shortDescription,
      longDescription,
      originalPrice,
      salesPrice,
      stockQuantity,
      category,
      coverImage,
      additionalImages,
      isNew,
      isBestseller,
      productType
    } = req.body;

    // Check for duplicate product name
    const existingProduct = await Product.findOne({ productName });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }

    const product = new Product({
      productName,
      shortDescription,
      longDescription,
      originalPrice,
      salesPrice,
      stockQuantity,
      category,
      coverImage,
      additionalImages: additionalImages || [],
      isNew: isNew || false,
      isBestseller: isBestseller || false,
      productType
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const {
      productName,
      shortDescription,
      longDescription,
      originalPrice,
      salesPrice,
      stockQuantity,
      category,
      coverImage,
      additionalImages,
      isNew,
      isBestseller,
      productType,
      isActive
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check for duplicate name (excluding current product)
    if (productName && productName !== product.productName) {
      const duplicate = await Product.findOne({ productName });
      if (duplicate) {
        return res.status(400).json({ message: 'Product with this name already exists' });
      }
    }

    product.productName = productName || product.productName;
    product.shortDescription = shortDescription || product.shortDescription;
    product.longDescription = longDescription || product.longDescription;
    product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
    product.salesPrice = salesPrice !== undefined ? salesPrice : product.salesPrice;
    product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
    product.category = category || product.category;
    product.coverImage = coverImage || product.coverImage;
    product.additionalImages = additionalImages || product.additionalImages;
    product.isNew = isNew !== undefined ? isNew : product.isNew;
    product.isBestseller = isBestseller !== undefined ? isBestseller : product.isBestseller;
    product.productType = productType || product.productType;
    product.isActive = isActive !== undefined ? isActive : product.isActive;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBoutiqueProducts,
  getMobileProducts,
  getProductById,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct
};
