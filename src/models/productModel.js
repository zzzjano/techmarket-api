const Product = require('./productSchema');
const Category = require('./categorySchema');

// Get all products with category information
const getAll = async () => {
  return await Product.find().populate('category');
};

// Get a single product by ID with category information
const getById = async (id) => {
  return await Product.findById(id).populate('category');
};

// Create a new product
const create = async (product) => {
  // Create new product
  const newProduct = await Product.create({
    name: product.name,
    category: product.category,
    description: product.description,
    price: product.price,
    stockCount: product.stockCount,
    brand: product.brand,
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
  });
  
  return await getById(newProduct._id);
};

// Update a product
const update = async (id, productData) => {
  const product = await Product.findById(id);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Update product fields directly from provided data
  Object.keys(productData).forEach(key => {
    if (productData[key] !== undefined) {
      product[key] = productData[key];
    }
  });
  
  await product.save();
  
  return await getById(id);
};

// Delete a product
const remove = async (id) => {
  const result = await Product.deleteOne({ _id: id });
  return result.deletedCount > 0;
};

const searchProducts = async (options = {}) => {
  // Build filter conditions
  const filter = {};
  
  // Apply filters if provided
  if (options.available !== undefined) {
    filter.isAvailable = options.available;
  }
  
  if (options.category) {
    filter.category = options.category;
  }
  
  if (options.brand) {
    filter.brand = options.brand;
  }
  
  // Apply price range filters
  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    filter.price = {};
    
    if (options.minPrice !== undefined) {
      filter.price.$gte = options.minPrice;
    }
    
    if (options.maxPrice !== undefined) {
      filter.price.$lte = options.maxPrice;
    }
  }
  
  let sortOption = { _id: 1 };
  
  if (options.sortBy) {
    const sortField = options.sortBy.toLowerCase();
    const sortDirection = options.sortOrder?.toLowerCase() === 'desc' ? -1 : 1;
    
    switch(sortField) {
      case 'price':
        sortOption = { price: sortDirection };
        break;
      case 'name':
        sortOption = { name: sortDirection };
        break;
      case 'brand':
        sortOption = { brand: sortDirection };
        break;
    }
  }
  
  return await Product.find(filter).sort(sortOption).populate('category');
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  searchProducts
};