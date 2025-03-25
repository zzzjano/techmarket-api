const { Product, Category } = require('./index');
const { Op } = require('sequelize');

// Get all products with category information
const getAll = async () => {
  return await Product.findAll({
    include: [{
      model: Category,
      attributes: ['name', 'description']
    }]
  });
};

// Get a single product by ID with category information
const getById = async (id) => {
  return await Product.findByPk(id, {
    include: [{
      model: Category,
      attributes: ['name', 'description']
    }]
  });
};

// Create a new product
const create = async (product) => {
  // Create new product with category_id
  const newProduct = await Product.create({
    name: product.name,
    category_id: product.category_id,
    description: product.description,
    price: product.price,
    stockCount: product.stockCount,
    brand: product.brand,
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
  });
  
  return await getById(newProduct.id);
};

// Update a product
const update = async (id, productData) => {
  const product = await Product.findByPk(id);
  
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
  const rowsDeleted = await Product.destroy({
    where: { id }
  });
  
  return rowsDeleted > 0;
};

const searchProducts = async (options = {}) => {
  // Build where conditions
  const whereConditions = {};
  
  const includeOptions = [{
    model: Category,
    attributes: ['name', 'description']
  }];
  
  // Apply filters if provided
  if (options.available !== undefined) {
    whereConditions.isAvailable = options.available;
  }
  
  if (options.category_id) {
    whereConditions.category_id = options.category_id;
  }
  
  if (options.brand) {
    whereConditions.brand = options.brand;
  }
  
  // Apply price range filters
  if (options.minPrice !== undefined) {
    whereConditions.price = whereConditions.price || {};
    whereConditions.price[Op.gte] = options.minPrice;
  }
  
  if (options.maxPrice !== undefined) {
    whereConditions.price = whereConditions.price || {};
    whereConditions.price[Op.lte] = options.maxPrice;
  }
  
  let order = [['id', 'ASC']];
  
  if (options.sortBy) {
    const sortField = options.sortBy.toLowerCase();
    const sortDirection = options.sortOrder?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    
    switch(sortField) {
      case 'price':
        order = [['price', sortDirection]];
        break;
      case 'name':
        order = [['name', sortDirection]];
        break;
      case 'brand':
        order = [['brand', sortDirection]];
        break;
    }
  }
  
  return await Product.findAll({
    where: whereConditions,
    include: includeOptions,
    order: order
  });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  searchProducts
};