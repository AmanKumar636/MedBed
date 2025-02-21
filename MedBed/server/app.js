// app.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import hospitalsRoutes from './routes/hospitals.js';
import appointmentsRoutes from './routes/appointmentsRoutes.js';
import medicalRecordsRoutes from './routes/medicalRecordsRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Public Routes
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to MedBed API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      health: "/health"
    }
  });
});

app.get('/favicon.ico', (req, res) => res.sendStatus(204));

// Mount public routes
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/hospitals', hospitalsRoutes);

// Apply auth middleware for protected routes
app.use(authMiddleware);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/medicalRecords', medicalRecordsRoutes);

// Health Route (protected)
app.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'OK' : 'DOWN';
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: { database: mongoStatus, api: 'OK' },
    environment: process.env.NODE_ENV,
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found. Check the URL.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message, stack: err.stack });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
