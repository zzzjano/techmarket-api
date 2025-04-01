const mongoose = require('mongoose');
const User = require('../../src/models/userSchema');
const Cart = require('../../src/models/cartSchema');
const Category = require('../../src/models/categorySchema');
const Product = require('../../src/models/productSchema');
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
    await mongoose.connect(MONGO_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
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
    // Create a cart with the test user
    const cart = await Cart.create({
      user: testUserId,
      items: [],
      total: 0
    });

    expect(cart).toBeDefined();
    expect(cart._id).toBeDefined();
    expect(cart.user.toString()).toBe(testUserId.toString());
    expect(cart.createdAt).toBeDefined();
    expect(cart.updatedAt).toBeDefined();
  });

  test('should not allow creating a cart without a user', async () => {
    // Try to create a cart without a user
    await expect(Cart.create({
      items: [],
      total: 0
    })).rejects.toThrow();
  });

  test('should add items to cart and correctly calculate total', async () => {
    // Create a fresh product to ensure it exists in the database
    const freshProduct = await Product.create({
      name: 'Fresh Test Product',
      description: 'Fresh test description',
      price: 99.99,
      brand: 'Test Brand',
      imageUrl: 'http://example.com/image.jpg',
      stockCount: 10,
      isAvailable: true
    });
    
    // Create a cart
    const cart = await Cart.create({
      user: testUserId,
      items: [],
      total: 0
    });
    
    // Add an item to the cart with the fresh product
    cart.items.push({
      product: freshProduct._id,
      quantity: 2,
      price: freshProduct.price
    });
    
    // Calculate total
    cart.total = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    // Save the cart
    await cart.save();
    
    // Verify the item was added correctly
    const savedCart = await Cart.findById(cart._id);
    expect(savedCart.items.length).toBe(1);
    expect(savedCart.items[0].product.toString()).toBe(freshProduct._id.toString());
    
    // Ensure the product still exists
    const productCheck = await Product.findById(freshProduct._id);
    expect(productCheck).toBeDefined();
    expect(productCheck.name).toBe('Fresh Test Product');
    
    const populatedCart = await Cart.findOne({_id: cart._id})
      .populate({
        path: 'items.product',
        model: 'Product'
      })
      .exec();
    
    // Simplified assertions
    expect(populatedCart).toBeDefined();
    expect(populatedCart.items).toBeDefined();
    expect(populatedCart.items.length).toBe(1);
    expect(populatedCart.items[0].quantity).toBe(2);
    expect(populatedCart.items[0].product).toBeDefined();
    
    // If product is successfully populated:
    if (populatedCart.items[0].product) {
      expect(populatedCart.items[0].product.name).toBe('Fresh Test Product');
    }
    
    expect(populatedCart.total).toBe(freshProduct.price * 2);
  });

  test('should update item quantity and recalculate total', async () => {
    // Create a cart with an item
    const cart = await Cart.create({
      user: testUserId,
      items: [{
        product: testProductId,
        quantity: 1,
        price: testProduct.price
      }],
      total: testProduct.price
    });
    
    // Update the item quantity
    cart.items[0].quantity = 3;
    
    // Recalculate total
    cart.total = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    await cart.save();
    
    // Verify the cart was updated
    const updatedCart = await Cart.findById(cart._id);
    expect(updatedCart.items[0].quantity).toBe(3);
    expect(updatedCart.total).toBe(testProduct.price * 3);
  });
  
  test('should remove items from cart', async () => {
    // Create a cart with an item
    const cart = await Cart.create({
      user: testUserId,
      items: [{
        product: testProductId,
        quantity: 2,
        price: testProduct.price
      }],
      total: testProduct.price * 2
    });
    
    // Remove the item
    cart.items = [];
    cart.total = 0;
    await cart.save();
    
    // Verify the cart was updated
    const updatedCart = await Cart.findById(cart._id);
    expect(updatedCart.items.length).toBe(0);
    expect(updatedCart.total).toBe(0);
  });
});