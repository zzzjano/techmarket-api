const { connectToMongoDB, getDb } = require('./mongodb');
const User = require('../models/userSchema');
const Product = require('../models/productSchema');
const Category = require('../models/categorySchema');
const { Review } = require('../models/reviewSchema');
const Cart = require('../models/cartSchema');
const bcrypt = require('bcrypt');

// Initialize database
const initDatabase = async () => {
  try {
    console.log('Initializing MongoDB database...');
    
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Initialize collections with sample data
    
    // Categories
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      const defaultCategories = [
        { name: 'Laptopy', description: 'Laptopy i ultrabooki' },
        { name: 'Smartfony', description: 'Telefony komórkowe i smartfony' },
        { name: 'Akcesoria', description: 'Akcesoria komputerowe i elektroniczne' }
      ];
      
      await Category.insertMany(defaultCategories);
      console.log('Inserted sample categories');
    }
    
    // Get the laptop category for product creation
    const laptopCategory = await Category.findOne({ name: 'Laptopy' });
    
    // Products
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      const defaultProducts = [
        {
          name: 'Dell XPS 13',
          category: laptopCategory._id,
          description: 'Laptop Dell XPS 13 z procesorem Intel Core i7 11. generacji',
          price: 6999.99,
          stockCount: 10,
          brand: 'Dell',
          imageUrl: 'https://placehold.co/400',
          isAvailable: true
        },
        {
          name: 'MacBook Pro 14',
          category: laptopCategory._id,
          description: 'Apple MacBook Pro z procesorem M1 Pro',
          price: 9999.99,
          stockCount: 5,
          brand: 'Apple',
          imageUrl: 'https://placehold.co/400',
          isAvailable: true
        }
      ];
      
      await Product.insertMany(defaultProducts);
      console.log('Inserted sample products');
    }
    
    // Users
    const usersCount = await User.countDocuments();
    if (usersCount === 0) {
      // Generate hashed password for admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const defaultUsers = [
        { 
          username: 'admin', 
          email: 'milewczykjan@gmail.com',
          password_hash: hashedPassword,
          first_name: 'Admin',
          last_name: 'User'
        }
      ];
      
      await User.insertMany(defaultUsers);
      console.log('Inserted sample users');
    }
    
    // Get the first user and product for reviews and cart
    const firstUser = await User.findOne({});
    const firstProduct = await Product.findOne({});
    
    // Reviews
    const reviewsCount = await Review.countDocuments();
    if (reviewsCount === 0 && firstUser && firstProduct) {
      const defaultReviews = [
        {
          productId: firstProduct._id,
          userId: firstUser._id,
          rating: 5,
          title: 'Wspaniały laptop!',
          content: 'Ten laptop przekroczył moje oczekiwania. Szybki, wydajny i elegancki.',
          pros: ['Długi czas pracy baterii', 'Wysoka wydajność', 'Elegancki design'],
          cons: ['Wysoka cena', 'Ograniczona liczba portów'],
          verifiedPurchase: true,
          helpfulVotes: 3
        }
      ];
      
      await Review.insertMany(defaultReviews);
      console.log('Inserted sample reviews');
    }
    
    // Carts
    const cartsCount = await Cart.countDocuments();
    if (cartsCount === 0 && firstUser && firstProduct) {
      const defaultCart = {
        user: firstUser._id,
        items: [
          {
            product: firstProduct._id,
            quantity: 1,
            price: firstProduct.price
          }
        ],
        total: firstProduct.price
      };
      
      await Cart.create(defaultCart);
      console.log('Inserted sample cart');
    }
    
    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  initDatabase
};