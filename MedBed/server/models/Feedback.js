// server/models/Feedback.js
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    feedback: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
  },
  { strict: true, versionKey: false }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
