const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MongoDB URI is not set. Database not connected.');
      return;
    }
    
    // In serverless environments, avoid creating multiple connections
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Optional: process.exit(1);
  }
};

module.exports = connectDB;
