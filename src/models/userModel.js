const User = require('./userSchema');
const bcrypt = require('bcrypt');

// Get all users
const getAll = async () => {
  return await User.find({}, { password_hash: 0 });
};

// Get a user by ID
const getById = async (id) => {
  return await User.findById(id, { password_hash: 0 });
};

// Get a user by username
const getByUsername = async (username) => {
  return await User.findOne({ username });
};

// Get a user by email
const getByEmail = async (email) => {
  return await User.findOne({ email });
};

// Update a user
const update = async (id, userData) => {
  const currentUser = await User.findById(id);
  
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
  const { password_hash, ...userWithoutPassword } = currentUser.toObject();
  return userWithoutPassword;
};

const create = async (userData) => {
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  
  // Create new user
  const newUser = new User({
    username: userData.username,
    email: userData.email,
    password_hash: hashedPassword,
    first_name: userData.firstName,
    last_name: userData.lastName,
  });
  
  await newUser.save();
  
  // Return user without password hash
  const { password_hash, ...userWithoutPassword } = newUser.toObject();
  return userWithoutPassword;
};

// Delete a user
const remove = async (id) => {
  const result = await User.deleteOne({ _id: id });
  return result.deletedCount > 0;
};

module.exports = {
  getAll,
  getById,
  getByUsername,
  getByEmail,
  update,
  remove,
  create
};
