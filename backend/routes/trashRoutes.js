const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
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
  let debugStage = 'Request received';
  let trackingId;

  console.log('[TrashTrace DEBUG]', debugStage, {
    method: req.method,
    path: req.originalUrl,
    bodyKeys: Object.keys(req.body || {}),
  });

  try {
    const { trashType, description, destination, sourceLatitude, sourceLongitude, ownerToken } = req.body || {};

    debugStage = 'Input validation';
    console.log('[TrashTrace DEBUG]', debugStage, {
      hasTrashType: Boolean(trashType),
      hasDestination: Boolean(destination),
      hasSourceCoordinates: sourceLatitude !== undefined && sourceLongitude !== undefined,
      hasDescription: Boolean(description),
      hasOwnerToken: Boolean(ownerToken),
    });

    if (!trashType || !destination || sourceLatitude === undefined || sourceLongitude === undefined) {
      console.log('[TrashTrace DEBUG]', 'Input validation failed', { reason: 'Missing required fields' });
      return res.status(400).json({ error: 'trashType, destination, sourceLatitude and sourceLongitude are required.' });
    }

    if (!isValidCoordinate(sourceLatitude, sourceLongitude)) {
      console.log('[TrashTrace DEBUG]', 'Input validation failed', { reason: 'Invalid source coordinates' });
      return res.status(400).json({ error: 'Invalid source coordinates.' });
    }

    if (typeof trashType !== 'string' || trashType.trim().length > 100) {
      console.log('[TrashTrace DEBUG]', 'Input validation failed', { reason: 'Invalid trash type' });
      return res.status(400).json({ error: 'Invalid trash type.' });
    }

    if (typeof destination !== 'string' || destination.trim().length < 3) {
      console.log('[TrashTrace DEBUG]', 'Input validation failed', { reason: 'Invalid destination' });
      return res.status(400).json({ error: 'Destination must be at least 3 characters.' });
    }

    console.log('[TrashTrace DEBUG]', 'Input validation succeeded');

    debugStage = 'MongoDB connection';
    const dbState = mongoose.connection.readyState;
    console.log('[TrashTrace DEBUG]', debugStage, {
      readyState: dbState,
      connected: dbState === 1,
    });
    if (dbState !== 1) {
      const error = new Error(`MongoDB connection is not ready (readyState: ${dbState}).`);
      error.status = 503;
      console.error('[TrashTrace DEBUG]', error.message);
      throw error;
    }

    debugStage = 'Nominatim geocoding request';
    console.log('[TrashTrace DEBUG]', 'Geocoding start');
    const destCoordinates = await geocodeAddress(destination.trim());
    console.log('[TrashTrace DEBUG]', 'Geocoding end', { success: Boolean(destCoordinates) });
    if (!destCoordinates) {
      const error = new Error('Geocoder returned no coordinates.');
      console.error('[TrashTrace DEBUG]', error);
      return res.status(400).json({ error: 'Could not resolve destination address. Please be more specific.' });
    }

    // Generate unique Tracking ID
    debugStage = 'Trash document construction';
    let attempts = 0;
    while (attempts < 5) {
      trackingId = crypto.randomBytes(4).toString('hex').toUpperCase();
      const existing = await Trash.findOne({ trackingId }).lean();
      if (!existing) break;
      attempts++;
    }
    if (!trackingId) {
      const error = new Error('Could not generate a unique tracking ID after 5 attempts.');
      console.error('[TrashTrace DEBUG]', error);
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
    console.log('[TrashTrace DEBUG]', debugStage, {
      trackingId,
      hasDestinationCoordinates: true,
      hasOwnerToken: Boolean(ownerToken),
    });

    debugStage = 'Trash.save()';
    console.log('[TrashTrace DEBUG]', debugStage, { trackingId });
    try {
      await newTrash.save();
      console.log('[TrashTrace DEBUG]', 'Trash.save() success', { trackingId });
    } catch (saveError) {
      console.error('[TrashTrace DEBUG]', 'Trash.save() failure', {
        trackingId,
        name: saveError.name,
        message: saveError.message,
      });
      throw saveError;
    }

    // Build tracking URL using env var or the origin header
    debugStage = 'Response generation';
    const baseUrl = process.env.PUBLIC_URL
      || req.headers.origin
      || 'https://trashtrace.vercel.app';

    const trackingUrl = `${baseUrl}/track/${trackingId}`;
    console.log('[TrashTrace DEBUG]', debugStage, { trackingId });

    return res.status(201).json({
      trackingId,
      trackingUrl,
      data: newTrash
    });

  } catch (error) {
    console.error('[TrashTrace DEBUG]', error.message);
    console.error('[TrashTrace DEBUG]', { failedStage: debugStage, trackingId: trackingId || null });
    console.error('[POST /api/trash]', error.message);

    const mongoUnavailable =
      error.status === 503 ||
      mongoose.connection.readyState !== 1 ||
      /mongo|MONGO_URI|database/i.test(error.message || '') ||
      /Mongo|Mongoose/.test(error.name || '');

    if (mongoUnavailable) {
      return res.status(503).json({ error: 'Database temporarily unavailable.' });
    }

    return res.status(error.status || 500).json({ error: 'Server error while creating shipment.' });
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
