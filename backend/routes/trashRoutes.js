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

module.exports = router;
