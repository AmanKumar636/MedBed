// server/models/Appointment.js
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  date: { type: Date, default: Date.now },
  details: { type: String, default: 'Bed booked successfully' },
}, { strict: true, versionKey: false });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
