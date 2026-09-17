const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const connectDB = require('../config/db');
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

// --- DB Connection for every serverless invocation ---
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB] Connection error:', err.message);
    res.status(503).json({ error: 'Database temporarily unavailable.' });
  }
});

// --- Routes ---
app.use('/api/trash', trashRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    message: 'TrashTrace API is running',
  });
});

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
