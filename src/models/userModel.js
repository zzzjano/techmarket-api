const db = require('../config/db');
const bcrypt = require('bcrypt');

// Get all users
const getAll = async () => {
  return await db.query('SELECT id, username, email, first_name, last_name, createdAt FROM users');
};

// Get a user by ID
const getById = async (id) => {
  const users = await db.query('SELECT id, username, email, first_name, last_name, createdAt FROM users WHERE id = ?', [id]);
  return users[0];
};

// Get a user by username
const getByUsername = async (username) => {
  const users = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  return users[0];
};

// Get a user by email
const getByEmail = async (email) => {
  const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return users[0];
};

// Update a user
const update = async (id, userData) => {
  // First get the current user data
  const currentUser = await getById(id);
  
  if (!currentUser) {
    throw new Error('User not found');
  }
  
  // Merge the current data with the new data, preserving existing values where not specified
  const updatedUser = {
    username: userData.username !== undefined ? userData.username : currentUser.username,
    email: userData.email !== undefined ? userData.email : currentUser.email,
    first_name: userData.firstName !== undefined ? userData.firstName : currentUser.first_name,
    last_name: userData.lastName !== undefined ? userData.lastName : currentUser.last_name
  };
  
  let query = 'UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?';
  let params = [updatedUser.username, updatedUser.email, updatedUser.first_name, updatedUser.last_name];
  
  // If password is provided, hash it and update
  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    query += ', password_hash = ?';
    params.push(hashedPassword);
  }
  
  query += ' WHERE id = ?';
  params.push(id);
  
  await db.query(query, params);
  
  return await getById(id);
};

// Delete a user
const remove = async (id) => {
  const result = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  getByUsername,
  getByEmail,
  update,
  remove,
};
