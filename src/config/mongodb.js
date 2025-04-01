const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB with native driver');
    db = client.db();
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB with Mongoose');
    
    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

function getDb() {
  if (!db) {
    throw new Error('MongoDB connection not established');
  }
  return db;
}

module.exports = {
  connectToMongoDB,
  getDb,
  mongoose
};
