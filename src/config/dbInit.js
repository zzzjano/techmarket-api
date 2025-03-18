const { query } = require('./db');

// Initialize database
const initDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Create categories table
    const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await query(createCategoriesTable);
    console.log('Categories table created or already exists');

    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await query(createUsersTable);
    console.log('Users table created or already exists');
    
    // Create products table with category_id as foreign key
    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id INT,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stockCount INT NOT NULL,
        brand VARCHAR(100) NOT NULL,
        imageUrl VARCHAR(255) NOT NULL,
        isAvailable BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `;
    
    await query(createProductsTable);
    console.log('Products table created or already exists');

    // Create reviews table
    const createReviewsTable = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    await query(createReviewsTable);
    console.log('Reviews table created or already exists');
    
    // Check if there are any categories in the table
    const categories = await query('SELECT COUNT(*) as count FROM categories');
    
    // If no categories, insert sample categories
    if (categories[0].count === 0) {
      const defaultCategories = [
        { name: 'Laptopy', description: 'Laptopy i ultrabooki' },
      ];
      
      for (const category of defaultCategories) {
        await query(
          `INSERT INTO categories (name, description) VALUES (?, ?)`,
          [category.name, category.description]
        );
      }
      
      console.log('Inserted sample categories');
    }
    
    // Check if there are any products in the table
    const products = await query('SELECT COUNT(*) as count FROM products');
    
    // If no products, insert sample data
    if (products[0].count === 0) {
      
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
      ]
      
      // Insert each product
      for (const product of productsData) {
        await query(
          `INSERT INTO products (name, category_id, description, price, stockCount, brand, imageUrl)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            product.name,
            product.category_id,
            product.description,
            product.price,
            product.stockCount,
            product.brand,
            product.imageUrl
          ]
        );
      }
      
      console.log('Inserted sample data into products table');
    }

    // Check if there are any users in the table
    const users = await query('SELECT COUNT(*) as count FROM users');

    if(users[0].count === 0) {
      const defaultUsers = [
        { 
          username: 'admin', 
          email: 'milewczykjan@gmail.com',
          password_hash: '$2b$10$eYl5C'
        }
      ];

      for (const user of defaultUsers) {
        await query(
          `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
          [user.username, user.email, user.password_hash]
        );
      }
    }

    // Check if there are any reviews in the table
    const reviews = await query('SELECT COUNT(*) as count FROM reviews');

    if(reviews[0].count === 0) {
      const defaultReviews = [
        {
          product_id: 1,
          user_id: 1,
          rating: 5,
          comment: 'Super laptop!'
        }
      ];

      for (const review of defaultReviews) {
        await query(
          `INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
          [review.product_id, review.user_id, review.rating, review.comment]
        );
      }
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