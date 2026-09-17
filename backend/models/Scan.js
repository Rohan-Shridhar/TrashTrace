const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  trashId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trash',
    required: true,
    index: true,
  },
  trackingId: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  distanceFromDestination: {
    type: Number, // in meters
    required: true,
  },
  isNearDestination: {
    type: Boolean,
    required: true,
    default: false,
  },
  scannedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

scanSchema.index({ 'location': '2dsphere' });

module.exports = mongoose.model('Scan', scanSchema);
