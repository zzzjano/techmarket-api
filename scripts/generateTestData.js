require('dotenv').config();
const mongoose = require('mongoose');
const { connectToMongoDB } = require('../src/config/mongodb');
const Product = require('../src/models/productSchema');
const User = require('../src/models/userSchema');
const { Review } = require('../src/models/reviewSchema');
const ProductView = require('../src/models/productViewSchema');

// Helper functions
function getRandomDate(startDate, endDate) {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function generateTestData() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToMongoDB();
    
    // Get all products and users from the database
    const products = await Product.find({});
    const users = await User.find({});
    
    if (products.length === 0 || users.length === 0) {
      console.error('No products or users found in the database. Please create them first.');
      process.exit(1);
    }
    
    console.log(`Found ${products.length} products and ${users.length} users.`);
    
    // Clear existing reviews and product views
    await Review.deleteMany({});
    await ProductView.deleteMany({});
    console.log('Cleared existing reviews and product views.');
    
    // Generate reviews
    console.log('Generating reviews...');
    const reviewsToCreate = [];
    
    // Track which user has reviewed which product to avoid duplicates
    const userProductMap = new Map();
    
    for (const product of products) {
      // Maximum number of reviews is the number of users (since each user can only review once)
      const maxReviews = Math.min(users.length, getRandomInt(3, 10));
      
      // Shuffle users to get random selection
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
      
      // Take only the first maxReviews users after shuffling
      const selectedUsers = shuffledUsers.slice(0, maxReviews);
      
      for (const user of selectedUsers) {
        const userProductKey = `${user._id.toString()}_${product._id.toString()}`;
        
        // Skip if this user already reviewed this product
        if (userProductMap.has(userProductKey)) {
          continue;
        }
        
        // Mark this user-product combination as used
        userProductMap.set(userProductKey, true);
        
        // Generate random rating (1-5)
        const rating = getRandomInt(1, 5);
        
        // Create review
        reviewsToCreate.push({
          productId: product._id,
          userId: user._id,
          rating: rating,
          title: `${rating}-star review for ${product.name}`,
          content: `This is a ${rating}-star review for ${product.name}. ${
            rating >= 4 ? 'I really liked this product!' : 
            rating === 3 ? 'This product is okay.' : 
            'I was disappointed with this product.'
          }`,
          pros: rating >= 3 ? ['Good quality', 'Good value'] : [],
          cons: rating <= 3 ? ['Could be better', 'Overpriced'] : [],
          verifiedPurchase: Math.random() > 0.3, // 70% are verified purchases
          helpfulVotes: getRandomInt(0, 20),
          createdAt: getRandomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()),
          updatedAt: new Date()
        });
      }
    }
    
    console.log(`Preparing to insert ${reviewsToCreate.length} reviews...`);
    
    // Insert reviews
    if (reviewsToCreate.length > 0) {
      await Review.insertMany(reviewsToCreate);
      console.log(`Successfully generated ${reviewsToCreate.length} reviews.`);
    } else {
      console.log('No reviews to create.');
    }
    
    // Generate product views for the last 30 days
    console.log('Generating product views...');
    const viewsToCreate = [];
    const sources = ['search', 'recommendation', 'direct', 'category', 'social', 'email'];
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
    
    // Generate 50-100 views per product
    for (const product of products) {
      const numViews = getRandomInt(50, 100);
      
      for (let i = 0; i < numViews; i++) {
        // 20% of views are anonymous
        const user = Math.random() > 0.2 ? getRandomElement(users) : null;
        
        viewsToCreate.push({
          productId: product._id,
          userId: user ? user._id : null,
          viewDate: getRandomDate(startDate, endDate),
          duration: getRandomInt(5, 300), // 5 seconds to 5 minutes
          source: getRandomElement(sources)
        });
      }
    }
    
    // Insert product views
    await ProductView.insertMany(viewsToCreate);
    console.log(`Generated ${viewsToCreate.length} product views.`);
    
    console.log('Test data generation complete!');
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error generating test data:', error);
    process.exit(1);
  }
}

// Run the script
generateTestData();
