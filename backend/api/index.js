const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' }); // To load from root during dev
const connectDB = require('../config/db');
const trashRoutes = require('../routes/trashRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// For development, try to connect if not Vercel
if (process.env.NODE_ENV !== 'production') {
  connectDB();
}

app.use('/api/trash', trashRoutes);

app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    message: 'TrashTrace Backend is running',
  });
});

// We export the app for Vercel
module.exports = app;

// Listen on port if not running in Vercel (where Vercel handles it)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
