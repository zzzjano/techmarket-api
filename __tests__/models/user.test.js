const mongoose = require('mongoose');
const User = require('../../src/models/userSchema');
const userModel = require('../../src/models/userModel');
const bcrypt = require('bcrypt');

// MongoDB test database connection URI
const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://root:test@localhost:27017/techmarket_test?authSource=admin';

describe('User Model', () => {

  beforeAll(async () => {

    await mongoose.connect(MONGO_TEST_URI);
    console.log('Connected to test database');
    
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
    console.log('Disconnected from test database');
  });
  
  afterEach(async () => {
    await User.deleteMany({});
  });

  test('should create a user with valid data', async () => {
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password_hash: hashedPassword,
      first_name: 'Test',
      last_name: 'User'
    };
    
    const user = await User.create(userData);
    
    expect(user).toBeDefined();
    expect(user._id).toBeDefined();
    expect(user.username).toBe('testuser');
    expect(user.email).toBe('test@example.com');
    expect(user.password_hash).toBe(hashedPassword);
    expect(user.first_name).toBe('Test');
    expect(user.last_name).toBe('User');
    expect(user.createdAt).toBeDefined();
  });

  test('should not allow creating a user without required fields', async () => {
    // Missing username
    const invalidUser = {
      email: 'invalid@example.com',
      password_hash: 'somehash'
    };
    
    // Direct validation using mongoose model
    const newUser = new User(invalidUser);
    await expect(newUser.validate()).rejects.toThrow();
  });

  test('should get a user by ID', async () => {
    // Create a user first
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password_hash: hashedPassword,
      first_name: 'Test',
      last_name: 'User'
    };
    
    const createdUser = await User.create(userData);
    const foundUser = await userModel.getById(createdUser._id);
    
    expect(foundUser).toBeDefined();
    expect(foundUser._id.toString()).toBe(createdUser._id.toString());
    expect(foundUser.username).toBe('testuser');
    expect(foundUser.email).toBe('test@example.com');
    
    // Password should not be included in the result
    expect(foundUser.password_hash).toBeUndefined();
  });

  test('should get a user by username', async () => {
    // Create a user first
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const userData = {
      username: 'findbyusername',
      email: 'username@example.com',
      password_hash: hashedPassword,
      first_name: 'Find',
      last_name: 'ByUsername'
    };
    
    await User.create(userData);
    const foundUser = await userModel.getByUsername('findbyusername');
    
    expect(foundUser).toBeDefined();
    expect(foundUser.username).toBe('findbyusername');
    expect(foundUser.email).toBe('username@example.com');
    expect(foundUser.password_hash).toBeDefined();
  });

  test('should get a user by email', async () => {
    // Create a user first
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const userData = {
      username: 'findbyemail',
      email: 'find@byemail.com',
      password_hash: hashedPassword,
      first_name: 'Find',
      last_name: 'ByEmail'
    };
    
    await User.create(userData);
    const foundUser = await userModel.getByEmail('find@byemail.com');
    
    expect(foundUser).toBeDefined();
    expect(foundUser.username).toBe('findbyemail');
    expect(foundUser.email).toBe('find@byemail.com');
    
    // Password should be included when getting by email (for auth)
    expect(foundUser.password_hash).toBeDefined();
  });

  test('should update a user', async () => {
    // Create a user first
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const userData = {
      username: 'updateuser',
      email: 'update@example.com',
      password_hash: hashedPassword,
      first_name: 'Before',
      last_name: 'Update'
    };
    
    const createdUser = await User.create(userData);
    
    // Update the user
    const updateData = {
      firstName: 'After',
      lastName: 'Updated',
      email: 'updated@example.com'
    };
    
    const updatedUser = await userModel.update(createdUser._id, updateData);
    
    expect(updatedUser).toBeDefined();
    expect(updatedUser._id.toString()).toBe(createdUser._id.toString());
    expect(updatedUser.username).toBe('updateuser'); // Unchanged
    expect(updatedUser.email).toBe('updated@example.com'); // Changed
    expect(updatedUser.first_name).toBe('After'); // Changed
    expect(updatedUser.last_name).toBe('Updated'); // Changed
    
    // Password should not be included in the result
    expect(updatedUser.password_hash).toBeUndefined();
  });

  test('should update a user password', async () => {
    // Create a user first
    const initialPassword = 'testpassword';
    const hashedPassword = await bcrypt.hash(initialPassword, 10);
    const userData = {
      username: 'passwordupdate',
      email: 'password@example.com',
      password_hash: hashedPassword
    };
    
    const createdUser = await User.create(userData);
    
    // Update the user's password
    const newPassword = 'newpassword123';
    const updateData = {
      password: newPassword
    };
    
    await userModel.update(createdUser._id, updateData);
    
    // Get the user directly to check the password hash
    const updatedUser = await User.findById(createdUser._id);
    
    // The password hash should be different now
    expect(updatedUser.password_hash).not.toBe(hashedPassword);
    
    // Verify the new password hash is correct
    const passwordIsValid = await bcrypt.compare(newPassword, updatedUser.password_hash);
    expect(passwordIsValid).toBe(true);
  });

  test('should delete a user', async () => {
    // Create a user first
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const userData = {
      username: 'deleteuser',
      email: 'delete@example.com',
      password_hash: hashedPassword
    };
    
    const createdUser = await User.create(userData);
    
    // Delete the user
    const result = await userModel.remove(createdUser._id);
    expect(result).toBe(true);
    
    // Verify it's gone
    const foundUser = await User.findById(createdUser._id);
    expect(foundUser).toBeNull();
  });

  test('should get all users', async () => {
    // Create multiple users
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    
    const users = [
      {
        username: 'user1',
        email: 'user1@example.com',
        password_hash: hashedPassword,
        first_name: 'User',
        last_name: 'One'
      },
      {
        username: 'user2',
        email: 'user2@example.com',
        password_hash: hashedPassword,
        first_name: 'User',
        last_name: 'Two'
      },
      {
        username: 'user3',
        email: 'user3@example.com',
        password_hash: hashedPassword,
        first_name: 'User',
        last_name: 'Three'
      }
    ];
    
    await User.insertMany(users);
    
    const allUsers = await userModel.getAll();
    
    expect(allUsers).toBeDefined();
    expect(allUsers.length).toBe(3);
    
    // Verify user data
    expect(allUsers[0].username).toBeDefined();
    expect(allUsers[0].email).toBeDefined();
    expect(allUsers[0].first_name).toBeDefined();
    expect(allUsers[0].last_name).toBeDefined();
    
    // Password should not be included in results
    expect(allUsers[0].password_hash).toBeUndefined();
  });
});
