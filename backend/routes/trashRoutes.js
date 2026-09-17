const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Trash = require('../models/Trash');
const Scan = require('../models/Scan');
const Notification = require('../models/Notification');
const { geocodeAddress } = require('../utils/geocoder');
const { calculateDistance } = require('../utils/distance');

const DELIVERY_RADIUS_METERS = process.env.DELIVERY_RADIUS_METERS || 500;

// POST /api/trash - Create a new trash shipment
router.post('/', async (req, res) => {
  try {
    const { trashType, description, destination, sourceLatitude, sourceLongitude, ownerToken } = req.body;

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
      ownerToken: ownerToken || null,
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

// GET /api/trash/owner/:ownerToken - Get all trash created by an owner
router.get('/owner/:ownerToken', async (req, res) => {
  try {
    const packages = await Trash.find({ ownerToken: req.params.ownerToken }).sort({ createdAt: -1 });
    res.json(packages);
  } catch (error) {
    console.error('Error fetching owner packages:', error);
    res.status(500).json({ error: 'Server error' });
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

// GET /api/trash/:trackingId/history - Get complete scan history
router.get('/:trackingId/history', async (req, res) => {
  try {
    const scans = await Scan.find({ trackingId: req.params.trackingId }).sort({ scannedAt: -1 });
    res.json(scans);
  } catch (error) {
    console.error('Error fetching scan history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/trash/:trackingId/scan - Record a scan
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

    let statusChanged = false;

    if (isNearDestination) {
      if (trash.status !== 'DELIVERED') {
        trash.status = 'DELIVERED';
        trash.deliveredAt = scanRecord.scannedAt;
        statusChanged = true;
      }
    } else {
      if (trash.status === 'CREATED') {
        trash.status = 'IN_TRANSIT';
        statusChanged = true;
      }
    }

    await trash.save();

    // Create Notification if owner is associated
    if (trash.ownerToken) {
      const type = isNearDestination ? 'DELIVERED' : 'TRANSIT_SCAN';
      let message = isNearDestination 
        ? `Your package ${trash.trackingId} was scanned near its destination and marked as DELIVERED.` 
        : `Your package ${trash.trackingId} was scanned in transit (approx. ${Math.round(distance/1000)} km from destination).`;
        
      const notification = new Notification({
        ownerToken: trash.ownerToken,
        trackingId: trash.trackingId,
        type,
        message
      });
      await notification.save();
    }

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
