const db = require('../config/db');

// Get all products
const getAll = async () => {
  return await db.query('SELECT * FROM products');
};

// Get a single product by ID
const getById = async (id) => {
  const products = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  return products[0];
};

// Create a new product
const create = async (product) => {
  const result = await db.query(
    'INSERT INTO products (name, category, description, price, stockCount, brand, imageUrl, isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [product.name, product.category, product.description, product.price, 
     product.stockCount, product.brand, product.imageUrl, product.isAvailable]
  );
  
  return { id: result.insertId, ...product, createdAt: new Date().toISOString() };
};

// Update a product
const update = async (id, product) => {
  await db.query(
    'UPDATE products SET name = ?, category = ?, description = ?, price = ?, stockCount = ?, brand = ?, imageUrl = ?, isAvailable = ? WHERE id = ?',
    [product.name, product.category, product.description, product.price, 
     product.stockCount, product.brand, product.imageUrl, product.isAvailable, id]
  );
  
  return { id, ...product };
};

// Delete a product
const remove = async (id) => {
  const result = await db.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// Search products with filters and sorting
const searchProducts = async (options = {}) => {
  let query = 'SELECT * FROM products WHERE 1=1';
  let params = [];

  // Filter by availability
  if (options.available !== undefined) {
    query += ' AND isAvailable = ?';
    params.push(options.available);
  }

  // Filter by category
  if (options.category) {
    query += ' AND category = ?';
    params.push(options.category);
  }

  // Filter by brand
  if (options.brand) {
    query += ' AND brand = ?';
    params.push(options.brand);
  }

  // Filter by price range
  if (options.minPrice !== undefined) {
    query += ' AND price >= ?';
    params.push(options.minPrice);
  }
  
  if (options.maxPrice !== undefined) {
    query += ' AND price <= ?';
    params.push(options.maxPrice);
  }

  // Sort by price
  if (options.sortBy === 'price') {
    query += ' ORDER BY price';
    if (options.sortOrder && options.sortOrder.toLowerCase() === 'desc') {
      query += ' DESC';
    } else {
      query += ' ASC';
    }
  }

  return await db.query(query, params);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  searchProducts
};