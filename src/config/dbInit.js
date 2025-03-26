const { sequelize } = require('./db');
const { Category, User, Product, Review, Cart, CartItem } = require('../models');
const bcrypt = require('bcrypt'); // Add this package for password hashing if not already included

// Initialize database
const initDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    await sequelize.sync();
    console.log('Database tables synchronized');
    
    // Check if there are any categories in the table
    const categoriesCount = await Category.count();
    
    // If no categories, insert sample categories
    if (categoriesCount === 0) {
      const defaultCategories = [
        { name: 'Laptopy', description: 'Laptopy i ultrabooki' },
      ];
      
      await Category.bulkCreate(defaultCategories);
      console.log('Inserted sample categories');
    }
    
    // Check if there are any products in the table
    const productsCount = await Product.count();
    
    // If no products, insert sample data
    if (productsCount === 0) {
      const productsData = [
        {
          name: 'Dell XPS 13',
          category_id: 1,
          description: 'Laptop Dell XPS 13 z procesorem Intel Core i7 11. generacji',
          price: 6999.99,
          stockCount: 10,
          brand: 'Dell',
          imageUrl: 'https://placehold.co/400',
        }
      ];
      
      await Product.bulkCreate(productsData);
      console.log('Inserted sample data into products table');
    }

    // Check if there are any users in the table
    const usersCount = await User.count();

    if (usersCount === 0) {
      const defaultUsers = [
        { 
          username: 'admin', 
          email: 'milewczykjan@gmail.com',
          password_hash: '$2b$10$eYl5C'
        }
      ];

      await User.bulkCreate(defaultUsers);
      console.log('Inserted sample users');
    }

    // Check if there are any reviews in the table
    const reviewsCount = await Review.count();

    if (reviewsCount === 0) {
      const defaultReviews = [
        {
          product_id: 1,
          user_id: 1,
          rating: 5,
          comment: 'Super laptop!'
        }
      ];

      await Review.bulkCreate(defaultReviews);
      console.log('Inserted sample reviews');
    }

    // Check if there are any carts in the table
    const cartsCount = await Cart.count();

    if (cartsCount === 0) {
      const defaultCarts = [
        {
          user_id: 1,
          total: 0
        }
      ];

      await Cart.bulkCreate(defaultCarts);
      console.log('Inserted sample carts');
    }

    // Check if there are any cart items in the table
    const cartItemsCount = await CartItem.count();

    if (cartItemsCount === 0) {
      const defaultCartItems = [
        {
          cart_id: 1,
          product_id: 1,
          quantity: 1
        }
      ];

      await CartItem.bulkCreate(defaultCartItems);
      console.log('Inserted sample cart items');
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  initDatabase
};