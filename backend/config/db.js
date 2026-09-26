const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const hasMongoUri = () => Boolean(
  typeof process.env.MONGO_URI === 'string' && process.env.MONGO_URI.trim()
);

const isMongoConnected = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
  const mongoUri = typeof process.env.MONGO_URI === 'string'
    ? process.env.MONGO_URI.trim()
    : '';
  console.log('[DB] MONGO_URI present:', Boolean(mongoUri));

  if (!mongoUri) {
    console.error('[DB] MongoDB connection failed: MONGO_URI is missing.');
    throw new Error('MONGO_URI is not set.');
  }

  if (isMongoConnected()) {
    cached.conn = mongoose.connection;
    return cached.conn;
  }

  if (cached.promise) {
    return cached.promise;
  }

  // A previous connection can be dropped while its cached connection object remains truthy.
  // Clear that stale cache so a later serverless invocation can establish a fresh connection.
  cached.conn = null;

  const opts = {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };
  const connectionPromise = mongoose.connect(mongoUri, opts)
    .then(() => {
      console.log('[DB] MongoDB connected successfully.');
      cached.conn = mongoose.connection;
      return cached.conn;
    })
    .catch((err) => {
      console.error('[DB] MongoDB connection failed:', err.message);
      throw err;
    });

  cached.promise = connectionPromise;

  try {
    return await connectionPromise;
  } catch (err) {
    cached.conn = null;
    throw err;
  } finally {
    if (cached.promise === connectionPromise) {
      cached.promise = null;
    }
  }
};

module.exports = connectDB;
module.exports.hasMongoUri = hasMongoUri;
module.exports.isMongoConnected = isMongoConnected;
