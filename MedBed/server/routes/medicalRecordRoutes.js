// routes/medicalRecordsRoutes.js
import express from 'express';
import MedicalRecord from '../models/MedicalRecord.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/medicalRecords (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const records = await MedicalRecord.find({ userId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
