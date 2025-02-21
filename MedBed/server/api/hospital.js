const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const { check } = require('express-validator');
const { handleError } = require('../utils/errorHandler');

router.get('/nearby', [
  check('lat').isFloat({ min: -90, max: 90 }),
  check('lng').isFloat({ min: -180, max: 180 }),
  check('radius').optional().isInt({ min: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lat, lng, radius = 10000 } = req.query;
    const coordinates = [parseFloat(lng), parseFloat(lat)];

    // Try nearby hospitals first
    let hospitals = await Hospital.find({
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: parseInt(radius)
        }
      },
      bedsAvailable: { $gt: 0 }
    }).limit(50);

    // Fallback to all hospitals if none found
    if (hospitals.length === 0) {
      hospitals = await Hospital.find().limit(50);
      return res.json({
        success: true,
        count: hospitals.length,
        data: hospitals,
        warning: 'Showing all hospitals'
      });
    }

    res.json({ success: true, count: hospitals.length, data: hospitals });
  } catch (err) {
    // Final fallback to all hospitals on error
    const hospitals = await Hospital.find().limit(50);
    handleError(res, err, 500, 'Failed to fetch nearby hospitals', {
      data: hospitals,
      warning: 'Showing all hospitals due to error'
    });
  }
});

module.exports = router;