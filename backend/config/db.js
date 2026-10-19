const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 * Production deployments must supply MONGODB_URI through the host's
 * environment settings. Never place database credentials in source code.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI ||
    (process.env.NODE_ENV === 'production'
      ? ''
      : 'mongodb://127.0.0.1:27017/resumeiq');

  if (!uri) {
    throw new Error('MONGODB_URI is required. Configure it in your deployment environment.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return null;
  }
};

module.exports = connectDB;
