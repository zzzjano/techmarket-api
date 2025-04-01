const { mongoose } = require('./mongodb');

// Test database connection
const testConnection = async () => {
  try {
    const state = mongoose.connection.readyState;
    if (state === 1) {
      console.log('MongoDB connection established successfully.');
      return true;
    } else {
      console.log('MongoDB not connected. Connection state:', state);
      return false;
    }
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  testConnection
};
