const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Trash = require('../models/Trash');
const Scan = require('../models/Scan');
const Notification = require('../models/Notification');
const { geocodeAddress } = require('../utils/geocoder');
const { calculateDistance } = require('../utils/distance');

const DELIVERY_RADIUS_METERS = parseInt(process.env.DELIVERY_RADIUS_METERS, 10) || 500;

// --- Coordinate Validation Helper ---
const isValidCoordinate = (lat, lon) => {
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  return (
    !isNaN(latNum) && !isNaN(lonNum) &&
    latNum >= -90 && latNum <= 90 &&
    lonNum >= -180 && lonNum <= 180
  );
};

// POST /api/trash - Create a new trash shipment
router.post('/', async (req, res) => {
  try {
    const { trashType, description, destination, sourceLatitude, sourceLongitude, ownerToken } = req.body;

    if (!trashType || !destination || sourceLatitude === undefined || sourceLongitude === undefined) {
      return res.status(400).json({ error: 'trashType, destination, sourceLatitude and sourceLongitude are required.' });
    }

    if (!isValidCoordinate(sourceLatitude, sourceLongitude)) {
      return res.status(400).json({ error: 'Invalid source coordinates.' });
    }

    if (typeof trashType !== 'string' || trashType.trim().length > 100) {
      return res.status(400).json({ error: 'Invalid trash type.' });
    }

    if (typeof destination !== 'string' || destination.trim().length < 3) {
      return res.status(400).json({ error: 'Destination must be at least 3 characters.' });
    }

    const destCoordinates = await geocodeAddress(destination.trim());
    if (!destCoordinates) {
      return res.status(400).json({ error: 'Could not resolve destination address. Please be more specific.' });
    }

    // Generate unique Tracking ID
    let trackingId;
    let attempts = 0;
    while (attempts < 5) {
      trackingId = crypto.randomBytes(4).toString('hex').toUpperCase();
      const existing = await Trash.findOne({ trackingId }).lean();
      if (!existing) break;
      attempts++;
    }
    if (!trackingId) {
      return res.status(500).json({ error: 'Could not generate a unique tracking ID. Please try again.' });
    }

    const newTrash = new Trash({
      ownerToken: ownerToken || null,
      trackingId,
      trashType: trashType.trim(),
      description: description ? String(description).slice(0, 500) : '',
      sourceLocation: {
        type: 'Point',
        coordinates: [parseFloat(sourceLongitude), parseFloat(sourceLatitude)],
      },
      destination: {
        name: destination.trim(),
        location: {
          type: 'Point',
          coordinates: [destCoordinates.longitude, destCoordinates.latitude],
        }
      },
      status: 'CREATED'
    });

    await newTrash.save();

    // Build tracking URL using env var or the origin header
    const baseUrl = process.env.PUBLIC_URL
      || req.headers.origin
      || 'https://trashtrace.vercel.app';

    const trackingUrl = `${baseUrl}/track/${trackingId}`;

    return res.status(201).json({
      trackingId,
      trackingUrl,
      data: newTrash
    });

  } catch (error) {
    console.error('[POST /api/trash]', error.message);
    return res.status(500).json({ error: 'Server error while creating shipment.' });
  }
});

// GET /api/trash/owner/:ownerToken - Get all trash for an owner
router.get('/owner/:ownerToken', async (req, res) => {
  try {
    const token = req.params.ownerToken;
    if (!token || token.length < 5) {
      return res.status(400).json({ error: 'Invalid owner token.' });
    }
    const packages = await Trash.find({ ownerToken: token })
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();
    return res.json(packages);
  } catch (error) {
    console.error('[GET /api/trash/owner]', error.message);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/trash/:trackingId - Get tracking info (public)
router.get('/:trackingId', async (req, res) => {
  try {
    const trash = await Trash.findOne({ trackingId: req.params.trackingId })
      .select('-ownerToken -__v')
      .lean();
    if (!trash) {
      return res.status(404).json({ error: 'Tracking ID not found.' });
    }
    return res.json(trash);
  } catch (error) {
    console.error('[GET /api/trash/:trackingId]', error.message);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/trash/:trackingId/history - Scan history
router.get('/:trackingId/history', async (req, res) => {
  try {
    const trash = await Trash.findOne({ trackingId: req.params.trackingId }).lean();
    if (!trash) {
      return res.status(404).json({ error: 'Tracking ID not found.' });
    }
    const scans = await Scan.find({ trackingId: req.params.trackingId })
      .sort({ scannedAt: -1 })
      .select('-__v')
      .lean();
    return res.json(scans);
  } catch (error) {
    console.error('[GET /api/trash/:trackingId/history]', error.message);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/trash/:trackingId/scan - Record a scan event
router.post('/:trackingId/scan', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'latitude and longitude are required.' });
    }

    if (!isValidCoordinate(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180.' });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    const trash = await Trash.findOne({ trackingId: req.params.trackingId });
    if (!trash) {
      return res.status(404).json({ error: 'Tracking ID not found.' });
    }

    const destLon = trash.destination.location.coordinates[0];
    const destLat = trash.destination.location.coordinates[1];

    const distance = calculateDistance(lat, lon, destLat, destLon);
    const isNearDestination = distance <= DELIVERY_RADIUS_METERS;

    const scanRecord = new Scan({
      trashId: trash._id,
      trackingId: trash.trackingId,
      location: {
        type: 'Point',
        coordinates: [lon, lat],
      },
      distanceFromDestination: Math.round(distance),
      isNearDestination,
      scannedAt: new Date(),
    });
    await scanRecord.save();

    trash.latestScan = {
      location: { type: 'Point', coordinates: [lon, lat] },
      scannedAt: scanRecord.scannedAt,
    };

    if (isNearDestination && trash.status !== 'DELIVERED') {
      trash.status = 'DELIVERED';
      trash.deliveredAt = scanRecord.scannedAt;
    } else if (!isNearDestination && trash.status === 'CREATED') {
      trash.status = 'IN_TRANSIT';
    }

    await trash.save();

    // Notification — only if owner token associated
    if (trash.ownerToken) {
      const distKm = (distance / 1000).toFixed(1);
      const type = isNearDestination ? 'DELIVERED' : 'TRANSIT_SCAN';
      const message = isNearDestination
        ? `QR code for package ${trash.trackingId} was scanned near the destination (${trash.destination.name}). Status updated to DELIVERED.`
        : `Package ${trash.trackingId} was scanned approximately ${distKm} km from its destination (${trash.destination.name}).`;

      await Notification.create({
        ownerToken: trash.ownerToken,
        trackingId: trash.trackingId,
        type,
        message,
      });
    }

    return res.json({
      message: isNearDestination
        ? 'QR code scanned near destination — status updated to DELIVERED.'
        : 'Transit scan recorded successfully.',
      distanceMeters: Math.round(distance),
      deliveryRadiusMeters: DELIVERY_RADIUS_METERS,
      isNearDestination,
      status: trash.status,
      note: 'This records where the QR code was scanned, not guaranteed physical delivery.'
    });

  } catch (error) {
    console.error('[POST /api/trash/:trackingId/scan]', error.message);
    return res.status(500).json({ error: 'Server error while recording scan.' });
  }
});

module.exports = router;
