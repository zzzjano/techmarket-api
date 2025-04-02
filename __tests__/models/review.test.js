const mongoose = require('mongoose');
const User = require('../../src/models/userSchema');
const Product = require('../../src/models/productSchema');
const Category = require('../../src/models/categorySchema');
const { Review } = require('../../src/models/reviewSchema');
const reviewModel = require('../../src/models/reviewModel');
const bcrypt = require('bcrypt');

// MongoDB test database connection URI
const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://root:test@localhost:27017/techmarket_test?authSource=admin';

describe('Review Model', () => {
  let testUser;
  let testUser2;
  let testUser3;
  let testUserId;
  let testUserId2;
  let testUserId3;
  let testProduct;
  let testProductId;
  let testCategory;
  
  // Connect to the test database before all tests
  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(MONGO_TEST_URI);
    console.log('Connected to test database');
    
    // Clear collections before starting tests
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Review.deleteMany({});
    
    // Create a test user
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: hashedPassword,
      first_name: 'Test',
      last_name: 'User'
    });
    testUser2 = await User.create({
        username: 'testuser2',
        email: 'test2@example.com',
        password_hash: hashedPassword,
        first_name: 'Test',
        last_name: 'User2'
        });
    testUser3 = await User.create({
        username: 'testuser3',
        email: 'test3@example.com',
        password_hash: hashedPassword,
        first_name: 'Test',
        last_name: 'User3'
        });

    testUserId2 = testUser2._id;
    testUserId = testUser._id;
    testUserId3 = testUser3._id;
    
    // Create a test category
    testCategory = await Category.create({
      name: 'Test Category',
      description: 'Test Category Description'
    });
    
    // Create a test product
    testProduct = await Product.create({
      name: 'Test Laptop',
      description: 'A high-performance laptop for testing',
      price: 1299.99,
      category: testCategory._id,
      brand: 'TestBrand',
      imageUrl: 'http://example.com/laptop.jpg',
      stockCount: 10,
      isAvailable: true
    });
    testProductId = testProduct._id;
  });

  afterAll(async () => {
    // Clean up: remove test data and disconnect from database
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Review.deleteMany({});
    await mongoose.disconnect();
    console.log('Disconnected from test database');
  });
  
  afterEach(async () => {
    // Clean up reviews after each test
    await Review.deleteMany({});
  });

  test('should create a review with valid data', async () => {
    const reviewData = {
      productId: testProductId,
      userId: testUserId,
      rating: 5,
      title: 'Excellent Product',
      content: 'This is an amazing laptop with great performance.',
      pros: ['Fast performance', 'Beautiful design'],
      cons: ['Expensive', 'Battery could be better'],
      verifiedPurchase: true
    };
    
    const review = await reviewModel.create(reviewData);
    
    expect(review).toBeDefined();
    expect(review._id).toBeDefined();
    expect(review.productId.toString()).toBe(testProductId.toString());
    expect(review.userId.toString()).toBe(testUserId.toString());
    expect(review.rating).toBe(5);
    expect(review.title).toBe('Excellent Product');
    expect(review.content).toBe('This is an amazing laptop with great performance.');
    expect(review.pros).toHaveLength(2);
    expect(review.cons).toHaveLength(2);
    expect(review.verifiedPurchase).toBe(true);
    expect(review.helpfulVotes).toBe(0);
    expect(review.createdAt).toBeDefined();
  });

  test('should not allow creating a review without required fields', async () => {
    // Missing rating
    const invalidReview = {
      productId: testProductId,
      userId: testUserId,
      title: 'Incomplete Review',
      content: 'This review is missing required fields.'
    };
    
    // Direct validation using mongoose model
    const newReview = new Review(invalidReview);
    await expect(newReview.validate()).rejects.toThrow();
  });

  test('should get a review by ID', async () => {
    // Create a review first
    const reviewData = {
      productId: testProductId,
      userId: testUserId,
      rating: 4,
      title: 'Good Product',
      content: 'This product is good but not perfect.',
      pros: ['Value for money'],
      cons: ['Could have more features']
    };
    
    const createdReview = await reviewModel.create(reviewData);
    const foundReview = await reviewModel.getById(createdReview._id);
    
    expect(foundReview).toBeDefined();
    expect(foundReview._id.toString()).toBe(createdReview._id.toString());
    expect(foundReview.title).toBe('Good Product');
    expect(foundReview.rating).toBe(4);
    
    // Should populate user and product
    expect(foundReview.userId).toBeDefined();
    expect(foundReview.productId).toBeDefined();
  });

  test('should get all reviews for a product', async () => {
    // Create multiple reviews for the same product
    // Create the second review first so it's older
    await reviewModel.create({
      productId: testProductId,
      userId: testUserId,
      rating: 3,
      title: 'Second Review',
      content: 'Second review content'
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create the first review after, so it's newer
    await reviewModel.create({
      productId: testProductId,
      userId: testUserId2,
      rating: 5,
      title: 'First Review',
      content: 'First review content'
    });
    
    const productReviews = await reviewModel.getByProductId(testProductId);
    
    expect(productReviews).toBeDefined();
    expect(productReviews).toHaveLength(2);
    expect(productReviews[0].title).toBe('First Review'); // Newest first
    expect(productReviews[1].title).toBe('Second Review');
  });

  test('should update a review', async () => {
    // Create a review
    const reviewData = {
      productId: testProductId,
      userId: testUserId,
      rating: 3,
      title: 'Initial Review',
      content: 'Initial content',
      pros: ['Initial pro'],
      cons: ['Initial con']
    };
    
    const createdReview = await reviewModel.create(reviewData);
    
    // Update the review
    const updateData = {
      rating: 4,
      title: 'Updated Review',
      content: 'Updated content',
      pros: ['Updated pro 1', 'Updated pro 2'],
      cons: ['Updated con'],
      helpfulVotes: 5
    };
    
    const updatedReview = await reviewModel.update(createdReview._id, updateData);
    
    expect(updatedReview).toBeDefined();
    expect(updatedReview._id.toString()).toBe(createdReview._id.toString());
    expect(updatedReview.rating).toBe(4);
    expect(updatedReview.title).toBe('Updated Review');
    expect(updatedReview.content).toBe('Updated content');
    expect(updatedReview.pros).toHaveLength(2);
    expect(updatedReview.cons).toHaveLength(1);
    expect(updatedReview.helpfulVotes).toBe(5);
  });

  test('should delete a review', async () => {
    // Create a review
    const reviewData = {
      productId: testProductId,
      userId: testUserId,
      rating: 2,
      title: 'Review to Delete',
      content: 'This review will be deleted'
    };
    
    const createdReview = await reviewModel.create(reviewData);
    
    // Delete the review
    const result = await reviewModel.remove(createdReview._id);
    expect(result).toBe(true);
    
    // Verify it's gone
    const foundReview = await Review.findById(createdReview._id);
    expect(foundReview).toBeNull();
  });

  test('should calculate product average rating', async () => {
    // Create multiple reviews with different ratings
    await reviewModel.create({
      productId: testProductId,
      userId: testUserId,
      rating: 5,
      title: 'Five Star',
      content: 'Excellent product!'
    });
    
    await reviewModel.create({
      productId: testProductId,
      userId: testUserId2,
      rating: 3,
      title: 'Three Star',
      content: 'Average product.'
    });
    
    const stats = await reviewModel.getProductAverageRating(testProductId);
    
    expect(stats).toBeDefined();
    expect(stats.average_rating).toBe('4.0'); // (5+3)/2 = 4.0
    expect(stats.total_reviews).toBe(2);
  });

  test('should handle old comment field during review creation', async () => {
    // Create a review using the old comment field
    const legacyReviewData = {
      productId: testProductId,
      userId: testUserId,
      rating: 4,
      title: 'Legacy Review',
      comment: 'This uses the old comment field' 
    };
    
    const review = await reviewModel.create(legacyReviewData);
    
    expect(review).toBeDefined();
    expect(review.content).toBe('This uses the old comment field');
  });

  test('should search reviews by text content', async () => {
    // Create multiple reviews with different content
    await reviewModel.create({
      productId: testProductId,
      userId: testUserId,
      rating: 5,
      title: 'Great performance',
      content: 'This laptop has amazing performance for gaming.'
    });
    
    await reviewModel.create({
      productId: testProductId,
      userId: testUserId2,
      rating: 4,
      title: 'Good display',
      content: 'The display quality is excellent.'
    });
    
    await reviewModel.create({
      productId: testProductId,
      userId: testUserId3,
      rating: 3,
      title: 'Average battery',
      content: 'Battery life could be better.'
    });
    
    // Search for reviews containing "performance"
    const performanceResults = await reviewModel.searchReviews({
      searchText: 'performance'
    });
    
    expect(performanceResults.reviews).toHaveLength(1);
    expect(performanceResults.reviews[0].title).toContain('Great performance');
    
    // Search for reviews containing "display"
    const displayResults = await reviewModel.searchReviews({
      searchText: 'display'
    });
    
    expect(displayResults.reviews).toHaveLength(1);
    expect(displayResults.reviews[0].content).toContain('display quality');
  });

  test('should filter reviews by rating range', async () => {
    // Create reviews with different ratings
    await reviewModel.create({
      productId: testProductId,
      userId: testUserId,
      rating: 5,
      title: 'Five star review',
      content: 'Excellent product'
    });
    
    await reviewModel.create({
      productId: testProductId,
      userId: testUserId2,
      rating: 3,
      title: 'Three star review',
      content: 'Average product'
    });
    
    await reviewModel.create({
      productId: testProductId,
      userId: testUserId3,
      rating: 1,
      title: 'One star review',
      content: 'Poor product'
    });
    
    // Filter reviews with rating >= 4
    const highRatedResults = await reviewModel.searchReviews({
      minRating: 4
    });
    
    expect(highRatedResults.reviews).toHaveLength(1);
    expect(highRatedResults.reviews[0].rating).toBe(5);
    
    // Filter reviews with rating <= 3
    const lowRatedResults = await reviewModel.searchReviews({
      maxRating: 3
    });
    
    expect(lowRatedResults.reviews).toHaveLength(2);
    expect(lowRatedResults.reviews[0].rating).toBeLessThanOrEqual(3);
    expect(lowRatedResults.reviews[1].rating).toBeLessThanOrEqual(3);
    
    // Filter reviews with 2 <= rating <= 4
    const midRangeResults = await reviewModel.searchReviews({
      minRating: 2,
      maxRating: 4
    });
    
    expect(midRangeResults.reviews).toHaveLength(1);
    expect(midRangeResults.reviews[0].rating).toBe(3);
  });

  test('should filter reviews by verified purchase status', async () => {
    // Create reviews with different verified purchase status
    await reviewModel.create({
      productId: testProductId,
      userId: testUserId,
      rating: 4,
      title: 'Verified review',
      content: 'I actually bought this product',
      verifiedPurchase: true
    });
    
    await reviewModel.create({
      productId: testProductId,
      userId: testUserId2,
      rating: 5,
      title: 'Unverified review',
      content: 'Great product but I did not buy it',
      verifiedPurchase: false
    });
    
    // Filter verified purchase reviews
    const verifiedResults = await reviewModel.searchReviews({
      verifiedPurchase: true
    });
    
    expect(verifiedResults.reviews).toHaveLength(1);
    expect(verifiedResults.reviews[0].verifiedPurchase).toBe(true);
    expect(verifiedResults.reviews[0].title).toBe('Verified review');
    
    // Filter unverified purchase reviews
    const unverifiedResults = await reviewModel.searchReviews({
      verifiedPurchase: false
    });
    
    expect(unverifiedResults.reviews).toHaveLength(1);
    expect(unverifiedResults.reviews[0].verifiedPurchase).toBe(false);
    expect(unverifiedResults.reviews[0].title).toBe('Unverified review');
  });

  test('should sort reviews by different criteria', async () => {
    // Create reviews with different ratings and dates
    // First review (oldest)
    await reviewModel.create({
      productId: testProductId,
      userId: testUserId,
      rating: 3,
      title: 'Oldest review',
      content: 'This is the oldest review',
      helpfulVotes: 5
    });
    
    // Wait to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create another product for the second review
    const secondProduct = await Product.create({
      name: 'Second Test Product',
      description: 'Another product for testing',
      price: 899.99,
      category: testCategory._id,
      brand: 'TestBrand',
      imageUrl: 'http://example.com/second.jpg',
      stockCount: 5,
      isAvailable: true
    });
    
    // Second review (middle)
    await reviewModel.create({
      productId: secondProduct._id,
      userId: testUserId,
      rating: 5,
      title: 'Middle review',
      content: 'This is the middle review',
      helpfulVotes: 2
    });
    
    // Wait to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create third product for the newest review
    const thirdProduct = await Product.create({
      name: 'Third Test Product',
      description: 'Yet another product for testing',
      price: 499.99,
      category: testCategory._id,
      brand: 'TestBrand',
      imageUrl: 'http://example.com/third.jpg',
      stockCount: 15,
      isAvailable: true
    });
    
    // Third review (newest) with highest helpful votes
    await reviewModel.create({
      productId: thirdProduct._id,
      userId: testUserId,
      rating: 1,
      title: 'Newest review',
      content: 'This is the newest review',
      helpfulVotes: 10 // Highest helpful votes
    });
    
    // Sort by date (newest first - default)
    const newestResults = await reviewModel.searchReviews({
      sortBy: 'date-new'
    });
    
    expect(newestResults.reviews).toHaveLength(3);
    expect(newestResults.reviews[0].title).toBe('Newest review');
    expect(newestResults.reviews[2].title).toBe('Oldest review');
    
    // Sort by date (oldest first)
    const oldestResults = await reviewModel.searchReviews({
      sortBy: 'date-old'
    });
    
    expect(oldestResults.reviews).toHaveLength(3);
    expect(oldestResults.reviews[0].title).toBe('Oldest review');
    expect(oldestResults.reviews[2].title).toBe('Newest review');
    
    // Sort by highest rating
    const highestRatingResults = await reviewModel.searchReviews({
      sortBy: 'rating-high'
    });
    
    expect(highestRatingResults.reviews).toHaveLength(3);
    expect(highestRatingResults.reviews[0].rating).toBe(5);
    expect(highestRatingResults.reviews[2].rating).toBe(1);
    
    // Sort by lowest rating
    const lowestRatingResults = await reviewModel.searchReviews({
      sortBy: 'rating-low'
    });
    
    expect(lowestRatingResults.reviews).toHaveLength(3);
    expect(lowestRatingResults.reviews[0].rating).toBe(1);
    expect(lowestRatingResults.reviews[2].rating).toBe(5);
    
    // Sort by helpful votes
    const helpfulResults = await reviewModel.searchReviews({
      sortBy: 'helpful'
    });
    
    expect(helpfulResults.reviews).toHaveLength(3);
    expect(helpfulResults.reviews[0].helpfulVotes).toBe(10);
    expect(helpfulResults.reviews[2].helpfulVotes).toBe(2);
  });

  test('should combine multiple search criteria', async () => {
    // Create products for different reviews
    const gamingLaptop = await Product.create({
      name: 'Gaming Laptop',
      description: 'High-performance gaming laptop',
      price: 1499.99,
      category: testCategory._id,
      brand: 'TestBrand',
      imageUrl: 'http://example.com/gaming.jpg',
      stockCount: 10,
      isAvailable: true
    });
    
    const workLaptop = await Product.create({
      name: 'Work Laptop',
      description: 'Business laptop',
      price: 999.99,
      category: testCategory._id, 
      brand: 'TestBrand',
      imageUrl: 'http://example.com/work.jpg',
      stockCount: 15,
      isAvailable: true
    });
    
    const budgetLaptop = await Product.create({
      name: 'Budget Laptop',
      description: 'Affordable laptop',
      price: 599.99,
      category: testCategory._id,
      brand: 'TestBrand',
      imageUrl: 'http://example.com/budget.jpg',
      stockCount: 20,
      isAvailable: true
    });
    
    const oldLaptop = await Product.create({
      name: 'Old Model Laptop',
      description: 'Previous generation laptop',
      price: 399.99,
      category: testCategory._id,
      brand: 'TestBrand',
      imageUrl: 'http://example.com/old.jpg',
      stockCount: 5,
      isAvailable: true
    });
    
    // Create a set of diverse reviews
    await reviewModel.create({
      productId: gamingLaptop._id,
      userId: testUserId,
      rating: 5,
      title: 'Great laptop for gaming',
      content: 'This gaming laptop is amazing',
      verifiedPurchase: true,
      helpfulVotes: 15
    });
    
    await reviewModel.create({
      productId: workLaptop._id,
      userId: testUserId,
      rating: 4,
      title: 'Good for work',
      content: 'Great laptop for productivity',
      verifiedPurchase: true,
      helpfulVotes: 8
    });
    
    await reviewModel.create({
      productId: budgetLaptop._id,
      userId: testUserId,
      rating: 2,
      title: 'Disappointed gamer',
      content: 'Not good for gaming despite claims',
      verifiedPurchase: false,
      helpfulVotes: 3
    });
    
    await reviewModel.create({
      productId: oldLaptop._id,
      userId: testUserId,
      rating: 1,
      title: 'Terrible battery',
      content: 'Battery life is awful',
      verifiedPurchase: true,
      helpfulVotes: 20
    });
    
    // high-rated verified purchases with "gaming" in content
    const complexResults = await reviewModel.searchReviews({
      minRating: 4,
      verifiedPurchase: true,
      searchText: 'gaming',
      sortBy: 'rating-high'
    });
    
    expect(complexResults.reviews).toHaveLength(1);
    expect(complexResults.reviews[0].rating).toBe(5);
    expect(complexResults.reviews[0].verifiedPurchase).toBe(true);
    expect(complexResults.reviews[0].title).toContain('gaming');
    
    // low-rated reviews sorted by helpful votes
    const lowRatedHelpfulResults = await reviewModel.searchReviews({
      maxRating: 2,
      sortBy: 'helpful'
    });
    
    expect(lowRatedHelpfulResults.reviews).toHaveLength(2);
    expect(lowRatedHelpfulResults.reviews[0].helpfulVotes).toBe(20); // Most helpful first
    expect(lowRatedHelpfulResults.reviews[0].rating).toBeLessThanOrEqual(2);
    expect(lowRatedHelpfulResults.reviews[1].rating).toBeLessThanOrEqual(2);
  });

  test('should handle pagination correctly', async () => {
    // Create 5 different products for 5 reviews
    const products = [];
    for (let i = 1; i <= 5; i++) {
      const product = await Product.create({
        name: `Pagination Test Product ${i}`,
        description: `Description for product ${i}`,
        price: 100 * i,
        category: testCategory._id,
        brand: 'TestBrand',
        imageUrl: `http://example.com/product${i}.jpg`,
        stockCount: 10,
        isAvailable: true
      });
      products.push(product);
    }
    
    // Create 5 reviews, one for each product
    for (let i = 0; i < 5; i++) {
      await reviewModel.create({
        productId: products[i]._id,
        userId: testUserId,
        rating: i + 1,
        title: `Review ${i + 1}`,
        content: `Content for review ${i + 1}`
      });
    }
    
    // Get first page with 2 items per page
    const page1Results = await reviewModel.searchReviews({
      page: 1,
      limit: 2
    });
    
    expect(page1Results.reviews).toHaveLength(2);
    expect(page1Results.page).toBe(1);
    expect(page1Results.totalPages).toBe(3);
    expect(page1Results.limit).toBe(2);
    
    // Get second page with 2 items per page
    const page2Results = await reviewModel.searchReviews({
      page: 2,
      limit: 2
    });
    
    expect(page2Results.reviews).toHaveLength(2);
    expect(page2Results.page).toBe(2);
    
    // Get third page with 2 items per page (should have only 1 item)
    const page3Results = await reviewModel.searchReviews({
      page: 3,
      limit: 2
    });
    
    expect(page3Results.reviews).toHaveLength(1);
    expect(page3Results.page).toBe(3);
  });
});
