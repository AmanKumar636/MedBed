// server/routes/hospitals.js
import express from 'express';
import Hospital from '../models/Hospital.js';
import Appointment from '../models/Appointment.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/hospitals/nearby with dynamic radius (default: 500 km)
// Returns only hospitals within the specified radius.
router.get('/nearby', async (req, res) => {
  const { lat, lng, radius } = req.query;
  const maxDistance = radius ? parseFloat(radius) * 1000 : 500000; // 500 km in meters
  try {
    if (lat && lng) {
      const hospitals = await Hospital.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: maxDistance,
          },
        },
      });
      return res.json({ data: hospitals });
    } else {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// PATCH /api/hospitals/:id/book-bed (protected)
// Reduces hospital beds by 1 and creates an appointment record with hospital details.
router.patch('/:id/book-bed', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const hospital = await Hospital.findById(id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    if (hospital.bedsAvailable <= 0) {
      return res.status(400).json({ message: 'No beds available' });
    }
    hospital.bedsAvailable -= 1;
    await hospital.save();
    const appointment = new Appointment({
      userId: req.user.userId,
      hospitalId: hospital._id,
      date: new Date(),
      details: `Hospital Name: ${hospital.name}, Address: ${hospital.address}, City: ${hospital.city}, Email: ${hospital.email}`,
    });
    await appointment.save();
    res.json({
      message: 'Bed Booked Successfully',
      bedsAvailable: hospital.bedsAvailable,
      appointment,
      hospital,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/hospitals/:id/update-resources (protected)
router.patch('/:id/update-resources', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { bedsAvailable, oxygenCylinders } = req.body;
  try {
    const hospital = await Hospital.findById(id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    hospital.bedsAvailable = bedsAvailable;
    hospital.oxygenCylinders = oxygenCylinders;
    await hospital.save();
    res.json({ message: 'Resources updated successfully', hospital });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/hospitals/:id/update-location (protected)
router.patch('/:id/update-location', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;
  try {
    const hospital = await Hospital.findById(id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    hospital.location = { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };
    await hospital.save();
    res.json({ message: 'Location updated successfully', hospital });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
