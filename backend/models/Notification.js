const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  ownerToken: {
    type: String,
    required: true,
    index: true,
  },
  trackingId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['TRANSIT_SCAN', 'DELIVERED', 'ERROR'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
