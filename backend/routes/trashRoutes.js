const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Trash = require('../models/Trash');
const { geocodeAddress } = require('../utils/geocoder');

// POST /api/trash - Create a new trash shipment
router.post('/', async (req, res) => {
  try {
    const { trashType, description, destination, sourceLatitude, sourceLongitude } = req.body;

    // Validation
    if (!trashType || !destination || sourceLatitude === undefined || sourceLongitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Geocode destination
    const destCoordinates = await geocodeAddress(destination);
    
    if (!destCoordinates) {
      return res.status(400).json({ error: 'Could not resolve destination address. Please provide a valid address.' });
    }

    // Generate unique Tracking ID (8 characters)
    let trackingId;
    let isUnique = false;
    
    while (!isUnique) {
      trackingId = crypto.randomBytes(4).toString('hex').toUpperCase();
      const existing = await Trash.findOne({ trackingId });
      if (!existing) {
        isUnique = true;
      }
    }

    // Save to Database
    const newTrash = new Trash({
      trackingId,
      trashType,
      description: description || '',
      sourceLocation: {
        type: 'Point',
        coordinates: [sourceLongitude, sourceLatitude], // GeoJSON order: [lng, lat]
      },
      destination: {
        name: destination,
        location: {
          type: 'Point',
          coordinates: [destCoordinates.longitude, destCoordinates.latitude], // GeoJSON order
        }
      },
      status: 'CREATED'
    });

    await newTrash.save();

    // Construct tracking URL
    // We assume frontend is running on the origin of the request, or we use a header/env
    const host = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    const trackingUrl = `${host}/track/${trackingId}`;

    res.status(201).json({
      message: 'Trash shipment created successfully',
      trackingId,
      trackingUrl,
      data: newTrash
    });

  } catch (error) {
    console.error('Error creating trash shipment:', error);
    res.status(500).json({ error: 'Server error while creating trash shipment' });
  }
});
// GET /api/trash/:trackingId - Get tracking information
router.get('/:trackingId', async (req, res) => {
  try {
    const trash = await Trash.findOne({ trackingId: req.params.trackingId });
    if (!trash) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }
    res.json(trash);
  } catch (error) {
    console.error('Error fetching trash:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/trash/:trackingId/scan - Record a scan
const Scan = require('../models/Scan');
const { calculateDistance } = require('../utils/distance');
const DELIVERY_RADIUS_METERS = process.env.DELIVERY_RADIUS_METERS || 500;

router.post('/:trackingId/scan', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Scan coordinates are required' });
    }

    const trash = await Trash.findOne({ trackingId: req.params.trackingId });
    if (!trash) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    // Coordinates are stored as [longitude, latitude] in GeoJSON
    const destLon = trash.destination.location.coordinates[0];
    const destLat = trash.destination.location.coordinates[1];

    const distance = calculateDistance(latitude, longitude, destLat, destLon);
    const isNearDestination = distance <= DELIVERY_RADIUS_METERS;

    // Record the scan
    const scanRecord = new Scan({
      trashId: trash._id,
      trackingId: trash.trackingId,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      distanceFromDestination: distance,
      isNearDestination,
      scannedAt: new Date()
    });
    
    await scanRecord.save();

    // Update Trash record
    trash.latestScan = {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      scannedAt: scanRecord.scannedAt
    };

    if (isNearDestination) {
      // Only set delivered if it wasn't already
      if (trash.status !== 'DELIVERED') {
        trash.status = 'DELIVERED';
        trash.deliveredAt = scanRecord.scannedAt;
      }
    } else {
      if (trash.status === 'CREATED') {
        trash.status = 'IN_TRANSIT';
      }
    }

    await trash.save();

    res.json({
      message: isNearDestination ? 'QR scanned near destination' : 'Scan recorded successfully',
      distance,
      isNearDestination,
      status: trash.status
    });

  } catch (error) {
    console.error('Error recording scan:', error);
    res.status(500).json({ error: 'Server error while recording scan' });
  }
});

module.exports = router;
