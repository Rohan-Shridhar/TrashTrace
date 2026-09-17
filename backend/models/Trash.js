const mongoose = require('mongoose');

const trashSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  trashType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  sourceLocation: {
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
  destination: {
    name: {
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
  },
  status: {
    type: String,
    enum: ['CREATED', 'IN_TRANSIT', 'DELIVERED'],
    default: 'CREATED',
  },
  deliveredAt: {
    type: Date,
  },
  latestScan: {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
      },
    },
    scannedAt: {
      type: Date,
    },
  },
}, {
  timestamps: true,
});

// Indexes for geospatial queries
trashSchema.index({ 'sourceLocation': '2dsphere' });
trashSchema.index({ 'destination.location': '2dsphere' });
trashSchema.index({ 'latestScan.location': '2dsphere' });

module.exports = mongoose.model('Trash', trashSchema);
