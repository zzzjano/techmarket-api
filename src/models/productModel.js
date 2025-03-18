const db = require('../config/db');

// Get all products with category information
const getAll = async () => {
  return await db.query(`
    SELECT p.*, c.name as category_name, c.description as category_description 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `);
};

// Get a single product by ID with category information
const getById = async (id) => {
  const products = await db.query(`
    SELECT p.*, c.name as category_name, c.description as category_description 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `, [id]);
  return products[0];
};

// Create a new product
const create = async (product) => {
  // If category provided by name, find its ID
  let categoryId = product.category_id;
  
  if (product.category_name && !categoryId) {
    const categories = await db.query('SELECT id FROM categories WHERE name = ?', [product.category_name]);
    if (categories.length > 0) {
      categoryId = categories[0].id;
    }
  }
  
  const result = await db.query(
    'INSERT INTO products (name, category_id, description, price, stockCount, brand, imageUrl, isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [product.name, categoryId, product.description, product.price, 
     product.stockCount, product.brand, product.imageUrl, product.isAvailable]
  );
  
  // Fetch the newly created product with category information
  return await getById(result.insertId);
};

// Update a product
const update = async (id, product) => {
  // If category provided by name, find its ID
  let categoryId = product.category_id;
  
  if (product.category_name && !categoryId) {
    const categories = await db.query('SELECT id FROM categories WHERE name = ?', [product.category_name]);
    if (categories.length > 0) {
      categoryId = categories[0].id;
    }
  }
  
  await db.query(
    'UPDATE products SET name = ?, category_id = ?, description = ?, price = ?, stockCount = ?, brand = ?, imageUrl = ?, isAvailable = ? WHERE id = ?',
    [product.name, categoryId, product.description, product.price, 
     product.stockCount, product.brand, product.imageUrl, product.isAvailable, id]
  );
  
  // Return the updated product with category information
  return await getById(id);
};

// Delete a product
const remove = async (id) => {
  const result = await db.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// Search products with filters and sorting - enhanced with category info
const searchProducts = async (options = {}) => {
  let query = `
    SELECT p.*, c.name as category_name, c.description as category_description 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  let params = [];

  // Filter by availability
  if (options.available !== undefined) {
    query += ' AND p.isAvailable = ?';
    params.push(options.available);
  }

  // Filter by category ID
  if (options.category_id) {
    query += ' AND p.category_id = ?';
    params.push(options.category_id);
  }
  
  // Filter by category name
  if (options.category_name) {
    query += ' AND c.name = ?';
    params.push(options.category_name);
  }

  // Filter by brand
  if (options.brand) {
    query += ' AND p.brand = ?';
    params.push(options.brand);
  }

  // Filter by price range
  if (options.minPrice !== undefined) {
    query += ' AND p.price >= ?';
    params.push(options.minPrice);
  }
  
  if (options.maxPrice !== undefined) {
    query += ' AND p.price <= ?';
    params.push(options.maxPrice);
  }

  // Sort options
  if (options.sortBy) {
    let orderBy;
    
    switch(options.sortBy.toLowerCase()) {
      case 'price':
        orderBy = 'p.price';
        break;
      case 'name':
        orderBy = 'p.name';
        break;
      case 'brand':
        orderBy = 'p.brand';
        break;
      case 'category':
        orderBy = 'c.name';
        break;
      default:
        orderBy = 'p.id';
    }
    
    query += ` ORDER BY ${orderBy}`;
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