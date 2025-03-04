const { query } = require('./db');

// Initialize database

const initDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Create products table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stockCount INT NOT NULL,
        brand VARCHAR(100) NOT NULL,
        imageUrl VARCHAR(255) NOT NULL,
        isAvailable BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await query(createTableQuery);
    console.log('Products table created or already exists');
    
    // Check if there are any products in the table
    const products = await query('SELECT COUNT(*) as count FROM products');
    
    // If no products, insert sample data
    if (products[0].count === 0) {
      
      // Get sample data from the products.js file
      const productsData = require('../data/products');
      
      // Insert each product
      for (const product of productsData) {
        await query(
          `INSERT INTO products (name, category, description, price, stockCount, brand, imageUrl, isAvailable)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.name,
            product.category,
            product.description,
            product.price,
            product.stockCount,
            product.brand,
            product.imageUrl,
            product.isAvailable
          ]
        );
      }
      
      console.log('Inserted sample data into products table');
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
