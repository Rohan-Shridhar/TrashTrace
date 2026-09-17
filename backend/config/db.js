const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const hasMongoUri = () => Boolean(process.env.MONGO_URI && String(process.env.MONGO_URI).trim());

const isMongoConnected = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
  const mongoUriConfigured = hasMongoUri();
  console.log('[DB] MONGO_URI present:', mongoUriConfigured);

  if (!mongoUriConfigured) {
    console.error('[DB] MongoDB connection failed: MONGO_URI is missing.');
    throw new Error('MONGO_URI is not set.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts)
      .then((connection) => {
        console.log('[DB] MongoDB connected successfully.');
        return connection;
      })
      .catch((err) => {
        console.error('[DB] MongoDB connection failed:', err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error('[DB] MongoDB connection failed:', err.message);
    throw err;
  }

  return cached.conn;
};

module.exports = connectDB;
module.exports.hasMongoUri = hasMongoUri;
module.exports.isMongoConnected = isMongoConnected;
