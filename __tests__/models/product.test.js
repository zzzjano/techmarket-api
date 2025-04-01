const mongoose = require('mongoose');
const Product = require('../../src/models/productSchema');
const Category = require('../../src/models/categorySchema');
const productModel = require('../../src/models/productModel');

// MongoDB test database connection URI
const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://root:test@localhost:27017/techmarket_test?authSource=admin';

describe('Product Model', () => {
  let testCategory;
  let testCategoryId;
  
  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(MONGO_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to test database');
    
    await Product.deleteMany({});
    await Category.deleteMany({});
    
    // Create a test category
    testCategory = await Category.create({
      name: 'Test Category',
      description: 'Test Category Description'
    });
    testCategoryId = testCategory._id;
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});
    await mongoose.disconnect();
    console.log('Disconnected from test database');
  });
  
  afterEach(async () => {
    await Product.deleteMany({});
  });

  test('should create a product with valid data', async () => {
    const productData = {
      name: 'Test Laptop',
      category: testCategoryId,
      description: 'A high-performance laptop for testing',
      price: 1299.99,
      stockCount: 10,
      brand: 'TestBrand',
      imageUrl: 'http://example.com/laptop.jpg',
      isAvailable: true
    };
    
    const product = await productModel.create(productData);
    
    expect(product).toBeDefined();
    expect(product._id).toBeDefined();
    expect(product.name).toBe('Test Laptop');
    expect(product.description).toBe('A high-performance laptop for testing');
    expect(product.price).toBe(1299.99);
    expect(product.stockCount).toBe(10);
    expect(product.brand).toBe('TestBrand');
    expect(product.imageUrl).toBe('http://example.com/laptop.jpg');
    expect(product.isAvailable).toBe(true);
    expect(product.createdAt).toBeDefined();
    
    // Category should be populated
    expect(product.category).toBeDefined();
  });

  test('should not allow creating a product without required fields', async () => {
    // Missing required fields
    const invalidProduct = {
      name: 'Invalid Product',
      // missing description
      price: 99.99,
      // missing brand
      imageUrl: 'http://example.com/image.jpg'
    };
    
    // Direct validation using mongoose model
    const newProduct = new Product(invalidProduct);
    await expect(newProduct.validate()).rejects.toThrow();
  });

  test('should get a product by ID', async () => {
    // Create a product first
    const productData = {
      name: 'Get By ID Test Product',
      category: testCategoryId,
      description: 'Product for testing getById',
      price: 499.99,
      stockCount: 5,
      brand: 'TestBrand',
      imageUrl: 'http://example.com/product.jpg',
      isAvailable: true
    };
    
    const createdProduct = await Product.create(productData);
    const foundProduct = await productModel.getById(createdProduct._id);
    
    expect(foundProduct).toBeDefined();
    expect(foundProduct._id.toString()).toBe(createdProduct._id.toString());
    expect(foundProduct.name).toBe('Get By ID Test Product');
    expect(foundProduct.price).toBe(499.99);
    
    // Category should be populated
    expect(foundProduct.category).toBeDefined();
  });

  test('should get all products', async () => {
    // Create multiple products
    const productsData = [
      {
        name: 'Product One',
        category: testCategoryId,
        description: 'First test product',
        price: 199.99,
        stockCount: 10,
        brand: 'BrandA',
        imageUrl: 'http://example.com/product1.jpg',
        isAvailable: true
      },
      {
        name: 'Product Two',
        category: testCategoryId,
        description: 'Second test product',
        price: 299.99,
        stockCount: 5,
        brand: 'BrandB',
        imageUrl: 'http://example.com/product2.jpg',
        isAvailable: true
      },
      {
        name: 'Product Three',
        category: testCategoryId,
        description: 'Third test product',
        price: 399.99,
        stockCount: 3,
        brand: 'BrandA',
        imageUrl: 'http://example.com/product3.jpg',
        isAvailable: false
      }
    ];
    
    await Product.insertMany(productsData);
    
    const allProducts = await productModel.getAll();
    
    expect(allProducts).toBeDefined();
    expect(allProducts.length).toBe(3);
    
    // Verify first product data
    expect(allProducts[0].name).toBeDefined();
    expect(allProducts[0].description).toBeDefined();
    expect(allProducts[0].price).toBeDefined();
    
    // Categories should be populated
    expect(allProducts[0].category).toBeDefined();
  });

  test('should update a product', async () => {
    // Create a product first
    const productData = {
      name: 'Original Product',
      category: testCategoryId,
      description: 'Original description',
      price: 599.99,
      stockCount: 15,
      brand: 'OriginalBrand',
      imageUrl: 'http://example.com/original.jpg',
      isAvailable: true
    };
    
    const createdProduct = await Product.create(productData);
    
    // Update the product
    const updateData = {
      name: 'Updated Product',
      description: 'Updated description',
      price: 699.99,
      stockCount: 10,
      isAvailable: false
    };
    
    const updatedProduct = await productModel.update(createdProduct._id, updateData);
    
    expect(updatedProduct).toBeDefined();
    expect(updatedProduct._id.toString()).toBe(createdProduct._id.toString());
    expect(updatedProduct.name).toBe('Updated Product'); // Changed
    expect(updatedProduct.description).toBe('Updated description'); // Changed
    expect(updatedProduct.price).toBe(699.99); // Changed
    expect(updatedProduct.stockCount).toBe(10); // Changed
    expect(updatedProduct.brand).toBe('OriginalBrand'); // Unchanged
    expect(updatedProduct.imageUrl).toBe('http://example.com/original.jpg'); // Unchanged
    expect(updatedProduct.isAvailable).toBe(false); // Changed
    
    // Category should still be populated
    expect(updatedProduct.category).toBeDefined();
  });

  test('should delete a product', async () => {
    // Create a product first
    const productData = {
      name: 'Product To Delete',
      category: testCategoryId,
      description: 'This product will be deleted',
      price: 99.99,
      stockCount: 1,
      brand: 'TestBrand',
      imageUrl: 'http://example.com/delete.jpg',
      isAvailable: true
    };
    
    const createdProduct = await Product.create(productData);
    
    // Delete the product
    const result = await productModel.remove(createdProduct._id);
    expect(result).toBe(true);
    
    // Verify its gone
    const foundProduct = await Product.findById(createdProduct._id);
    expect(foundProduct).toBeNull();
  });

  test('should search products with filters', async () => {
    // Create multiple products with different properties
    const productsData = [
      {
        name: 'Budget Laptop',
        category: testCategoryId,
        description: 'Affordable laptop',
        price: 599.99,
        stockCount: 20,
        brand: 'BrandA',
        imageUrl: 'http://example.com/budget.jpg',
        isAvailable: true
      },
      {
        name: 'Premium Laptop',
        category: testCategoryId,
        description: 'High-end laptop',
        price: 1999.99,
        stockCount: 5,
        brand: 'BrandB',
        imageUrl: 'http://example.com/premium.jpg',
        isAvailable: true
      },
      {
        name: 'Gaming Laptop',
        category: testCategoryId,
        description: 'Laptop for gaming',
        price: 1299.99,
        stockCount: 10,
        brand: 'BrandA',
        imageUrl: 'http://example.com/gaming.jpg',
        isAvailable: true
      },
      {
        name: 'Out of Stock Laptop',
        category: testCategoryId,
        description: 'Unavailable laptop',
        price: 899.99,
        stockCount: 0,
        brand: 'BrandC',
        imageUrl: 'http://example.com/outofstock.jpg',
        isAvailable: false
      }
    ];
    
    await Product.insertMany(productsData);
    
    // Test price range filter
    const budgetProducts = await productModel.searchProducts({
      maxPrice: 1000
    });
    
    expect(budgetProducts).toBeDefined();
    expect(budgetProducts.length).toBe(2);
    expect(budgetProducts[0].price).toBeLessThanOrEqual(1000);
    expect(budgetProducts[1].price).toBeLessThanOrEqual(1000);
    
    // Test brand filter
    const brandAProducts = await productModel.searchProducts({
      brand: 'BrandA'
    });

    console.log(brandAProducts);
    
    expect(brandAProducts).toBeDefined();
    expect(brandAProducts.length).toBe(2);
    expect(brandAProducts[0].brand).toBe('BrandA');
    expect(brandAProducts[1].brand).toBe('BrandA');
    
    // Test availability filter
    const availableProducts = await productModel.searchProducts({
      available: true
    });
    
    expect(availableProducts).toBeDefined();
    expect(availableProducts.length).toBe(3);
    expect(availableProducts[0].isAvailable).toBe(true);
    expect(availableProducts[1].isAvailable).toBe(true);
    expect(availableProducts[2].isAvailable).toBe(true);
    
    // Test sorting by price (ascending)
    const sortedByPriceAsc = await productModel.searchProducts({
      sortBy: 'price',
      sortOrder: 'asc'
    });
    
    expect(sortedByPriceAsc).toBeDefined();
    expect(sortedByPriceAsc.length).toBe(4);
    expect(sortedByPriceAsc[0].price).toBe(599.99);
    expect(sortedByPriceAsc[3].price).toBe(1999.99);
    
    // Test sorting by price (descending)
    const sortedByPriceDesc = await productModel.searchProducts({
      sortBy: 'price',
      sortOrder: 'desc'
    });
    
    expect(sortedByPriceDesc).toBeDefined();
    expect(sortedByPriceDesc.length).toBe(4);
    expect(sortedByPriceDesc[0].price).toBe(1999.99);
    expect(sortedByPriceDesc[3].price).toBe(599.99);
    
    // Test combined filters
    const combinedSearch = await productModel.searchProducts({
      brand: 'BrandA',
      minPrice: 1000,
      available: true
    });
    
    expect(combinedSearch).toBeDefined();
    expect(combinedSearch.length).toBe(1);
    expect(combinedSearch[0].name).toBe('Gaming Laptop');
    expect(combinedSearch[0].brand).toBe('BrandA');
    expect(combinedSearch[0].price).toBeGreaterThanOrEqual(1000);
    expect(combinedSearch[0].isAvailable).toBe(true);
  });
});
