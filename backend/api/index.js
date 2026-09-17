const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Local .env files only. On Vercel, MONGO_URI comes from process.env (project settings).
// dotenv does not override variables that are already set.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/db');
const { isMongoConnected, hasMongoUri } = connectDB;

console.log('[DB] MONGO_URI present:', hasMongoUri());
const trashRoutes = require('../routes/trashRoutes');
const notificationRoutes = require('../routes/notificationRoutes');

const app = express();

// --- Security Middleware ---
app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, Vercel server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' })); // Prevent large payload attacks

// --- Rate Limiting ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const scanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many scan attempts, please slow down.' },
});

app.use('/api/', apiLimiter);
app.use('/api/trash/:trackingId/scan', scanLimiter);

const sendDatabaseUnavailable = (res) => {
  return res.status(503).json({ error: 'Database temporarily unavailable.' });
};

// Health must still respond when MongoDB is down so clients can see DB status.
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[DB] Health check connection error:', err.message);
  }

  const connected = isMongoConnected();
  const payload = {
    status: connected ? 'ok' : 'error',
    database: connected ? 'connected' : 'disconnected',
  };

  return res.status(connected ? 200 : 503).json(payload);
});

// --- DB Connection for every serverless invocation ---
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!isMongoConnected()) {
      console.error('[DB] MongoDB is not connected after connectDB().');
      return sendDatabaseUnavailable(res);
    }
    next();
  } catch (err) {
    console.error('[DB] Connection error:', err.message);
    return sendDatabaseUnavailable(res);
  }
});

// --- Routes ---
app.use('/api/trash', trashRoutes);
app.use('/api/notifications', notificationRoutes);

// --- Global Error Handler (no stack traces in production) ---
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : err.message,
  });
});

// Export for Vercel
module.exports = app;

// Local dev server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`[Server] Listening on port ${PORT}`);
  });
}
