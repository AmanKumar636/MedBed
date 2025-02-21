// server/routes/appointmentsRoutes.js
import express from 'express';
import Appointment from '../models/Appointment.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/appointments/history (protected)
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const appointments = await Appointment.find({ userId }).sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
