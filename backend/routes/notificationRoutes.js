const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET /api/notifications/:ownerToken
router.get('/:ownerToken', async (req, res) => {
  try {
    const notifications = await Notification.find({ ownerToken: req.params.ownerToken })
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50 notifications
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/notifications/:ownerToken/read
// Mark all as read
router.put('/:ownerToken/read', async (req, res) => {
  try {
    await Notification.updateMany(
      { ownerToken: req.params.ownerToken, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
