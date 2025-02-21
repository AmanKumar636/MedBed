// server/routes/feedbackRoutes.js
import express from 'express';
import Feedback from '../models/Feedback.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { feedback, rating } = req.body;
    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ message: 'Feedback is required' });
    }
    const newFeedback = new Feedback({ feedback: feedback.trim(), rating });
    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
