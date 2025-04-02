const mongoose = require('mongoose');
const User = require('../../src/models/userSchema');
const Cart = require('../../src/models/cartSchema');
const Category = require('../../src/models/categorySchema');
const Product = require('../../src/models/productSchema');
const {
  getByUser,
  create,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart
} = require('../../src/models/cartModel');
const productModel = require('../../src/models/productModel');
const bcrypt = require('bcrypt');

// MongoDB test database connection URI
const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://root:test@localhost:27017/techmarket_test?authSource=admin';

describe('Cart Model', () => {
  let testUser;
  let testUserId;
  let testProduct;
  let testProductId;

  // Connect to the test database before all tests
  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(MONGO_TEST_URI);
    console.log('Connected to test database');

    // Clear collections before starting tests
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Cart.deleteMany({});

    // Create a test user
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: hashedPassword,
      first_name: 'Test',
      last_name: 'User'
    });
    testUserId = testUser._id;

    // Create a test category
    const category = await Category.create({
      name: 'Test Category',
      description: 'Test Category Description'
    });

    // Create a test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test description',
      price: 99.99,
      category: category._id,
      brand: 'Test Brand',
      imageUrl: 'http://example.com/image.jpg',
      stockCount: 10,
      isAvailable: true
    });
    testProductId = testProduct._id;
  });

  afterAll(async () => {
    // Clean up
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Cart.deleteMany({});
    await mongoose.disconnect();
    console.log('Disconnected from test database');
  });

  afterEach(async () => {
    // Clean up carts after each test
    await Cart.deleteMany({});
  });

  test('should create a cart with valid user data', async () => {
    const cart = await create(testUserId);

    expect(cart).toBeDefined();
    expect(cart._id).toBeDefined();
    expect(cart.user.toString()).toBe(testUserId.toString());
    expect(cart.items.length).toBe(0);
    expect(cart.total).toBe(0);
  });

  test('should add items to cart and correctly calculate total', async () => {
    const cart = await addItem(testUserId, testProductId, 2);

    expect(cart).toBeDefined();
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].product._id.toString()).toBe(testProductId.toString());
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.total).toBe(testProduct.price * 2);
  });

  test('should update item quantity and recalculate total', async () => {
    await addItem(testUserId, testProductId, 1);
    const updatedCart = await updateItemQuantity(testUserId, testProductId, 3);

    expect(updatedCart.items[0].quantity).toBe(3);
    expect(updatedCart.total).toBe(testProduct.price * 3);
  });

  test('should remove items from cart', async () => {
    await addItem(testUserId, testProductId, 2);
    const updatedCart = await removeItem(testUserId, testProductId);

    expect(updatedCart.items.length).toBe(0);
    expect(updatedCart.total).toBe(0);
  });

  test('should clear the cart', async () => {
    await addItem(testUserId, testProductId, 2);
    const clearedCart = await clearCart(testUserId);

    expect(clearedCart.items.length).toBe(0);
    expect(clearedCart.total).toBe(0);
  });
});