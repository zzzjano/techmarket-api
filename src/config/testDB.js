const mongoose = require('mongoose');

// MongoDB test database connection URI
const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://root:test@localhost:27017/techmarket_test?authSource=admin';

/**
 * Connect to the test database
 */
async function connectToTestDB() {
  try {
    await mongoose.connect(MONGO_TEST_URI);
    console.log('Connected to test database');
    return true;
  } catch (error) {
    console.error('Test database connection failed:', error.message);
    return false;
  }
}

/**
 * Disconnect from the test database
 */
async function disconnectFromTestDB() {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from test database');
    return true;
  } catch (error) {
    console.error('Test database disconnection failed:', error.message);
    return false;
  }
}

/**
 * Clear all collections in the test database
 */
async function clearTestDB(models) {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    
    console.log('Test database cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear test database:', error.message);
    return false;
  }
}

module.exports = {
  connectToTestDB,
  disconnectFromTestDB,
  clearTestDB,
  MONGO_TEST_URI
};
