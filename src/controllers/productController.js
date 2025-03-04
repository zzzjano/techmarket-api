const productModel = require('../models/productModel');

const getProducts = async (req, res, next) => {
  try {
    // Parse query parameters
    const options = {};
    
    // Sort by price
    if (req.query.sort === 'price') {
      options.sortBy = 'price';
      options.sortOrder = req.query.order || 'asc'; // Default to ascending
    }
    
    // Filter by availability
    if (req.query.available !== undefined) {
      options.available = req.query.available === 'true';
    }
    
    // Additional filters
    if (req.query.category) {
      options.category = req.query.category;
    }
    
    if (req.query.brand) {
      options.brand = req.query.brand;
    }
    
    // Price range filters
    if (req.query.minPrice) {
      options.minPrice = parseFloat(req.query.minPrice);
    }
    
    if (req.query.maxPrice) {
      options.maxPrice = parseFloat(req.query.maxPrice);
    }

    const products = Object.keys(options).length > 0 
      ? await productModel.searchProducts(options)
      : await productModel.getAll();
      
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productModel.getById(parseInt(req.params.id));
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = req.body;
    
    // Validate required fields
    if(!product.name || !product.category || !product.description || 
       !product.price || !product.stockCount || !product.brand || 
       !product.imageUrl || product.isAvailable === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const newProduct = await productModel.create(product);
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const product = await productModel.getById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const updatedProduct = await productModel.update(id, {
      ...product,
      ...req.body
    });
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await productModel.remove(id);
    
    if (deleted) {
      res.status(200).json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };

