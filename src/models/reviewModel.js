const db = require('../config/db');

// Get all reviews
const getAll = async () => {
  return await db.query(`
    SELECT r.*, u.username, p.name as product_name 
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN products p ON r.product_id = p.id
    ORDER BY r.createdAt DESC
  `);
};

// Get a single review by ID
const getById = async (id) => {
  const reviews = await db.query(`
    SELECT r.*, u.username, p.name as product_name 
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN products p ON r.product_id = p.id
    WHERE r.id = ?
  `, [id]);
  return reviews[0];
};

// Get all reviews for a specific product
const getByProductId = async (productId) => {
  return await db.query(`
    SELECT r.*, u.username 
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.createdAt DESC
  `, [productId]);
};

// Get all reviews by a specific user
const getByUserId = async (userId) => {
  return await db.query(`
    SELECT r.*, p.name as product_name 
    FROM reviews r
    JOIN products p ON r.product_id = p.id
    WHERE r.user_id = ?
    ORDER BY r.createdAt DESC
  `, [userId]);
};

// Create a new review
const create = async (review) => {
  const result = await db.query(
    'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
    [review.product_id, review.user_id, review.rating, review.comment]
  );
  
  return { 
    id: result.insertId, 
    ...review, 
    createdAt: new Date().toISOString() 
  };
};

// Update a review
const update = async (id, review) => {
  await db.query(
    'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
    [review.rating, review.comment, id]
  );
  
  return { id: parseInt(id), ...review };
};

// Delete a review
const remove = async (id) => {
  const result = await db.query('DELETE FROM reviews WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// Get product average rating
const getProductAverageRating = async (productId) => {
  const results = await db.query(
    'SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews FROM reviews WHERE product_id = ?',
    [productId]
  );
  return {
    average_rating: parseFloat(results[0].average_rating || 0).toFixed(1),
    total_reviews: results[0].total_reviews
  };
};

module.exports = {
  getAll,
  getById,
  getByProductId,
  getByUserId,
  create,
  update,
  remove,
  getProductAverageRating
};
