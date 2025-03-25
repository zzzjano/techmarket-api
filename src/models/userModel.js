const { User } = require('./index');
const bcrypt = require('bcrypt');

// Get all users
const getAll = async () => {
  return await User.findAll({
    attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'createdAt']
  });
};

// Get a user by ID
const getById = async (id) => {
  return await User.findByPk(id, {
    attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'createdAt']
  });
};

// Get a user by username
const getByUsername = async (username) => {
  return await User.findOne({
    where: { username }
  });
};

// Get a user by email
const getByEmail = async (email) => {
  return await User.findOne({
    where: { email }
  });
};

// Update a user
const update = async (id, userData) => {
  const currentUser = await User.findByPk(id);
  
  if (!currentUser) {
    throw new Error('User not found');
  }
  
  // Update fields if provided
  if (userData.username !== undefined) {
    currentUser.username = userData.username;
  }
  
  if (userData.email !== undefined) {
    currentUser.email = userData.email;
  }
  
  if (userData.firstName !== undefined) {
    currentUser.first_name = userData.firstName;
  }
  
  if (userData.lastName !== undefined) {
    currentUser.last_name = userData.lastName;
  }
  
  // If password is provided, hash it and update
  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    currentUser.password_hash = hashedPassword;
  }
  
  // Save changes
  await currentUser.save();
  
  // Return user without password hash
  return {
    id: currentUser.id,
    username: currentUser.username,
    email: currentUser.email,
    first_name: currentUser.first_name,
    last_name: currentUser.last_name,
    createdAt: currentUser.createdAt
  };
};

// Delete a user
const remove = async (id) => {
  const rowsDeleted = await User.destroy({
    where: { id }
  });
  
  return rowsDeleted > 0;
};

module.exports = {
  getAll,
  getById,
  getByUsername,
  getByEmail,
  update,
  remove,
};
