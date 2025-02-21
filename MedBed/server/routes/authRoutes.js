// server/routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

const registerEntity = async (model, req, res, type) => {
  try {
    const { email } = req.body;
    const existing = await model.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: `${type} with this email already exists` });
    }
    const newEntity = new model({ ...req.body });
    await newEntity.save();
    const token = jwt.sign({ userId: newEntity._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
    res.status(201).json({ userId: newEntity._id, token, tokenExpiration: process.env.JWT_EXPIRATION, userType: type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.post('/register/user', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ code: 'MISSING_FIELDS', message: 'All fields are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ code: 'USER_EXISTS', message: 'User already registered' });
    }
    if (password.length < 8) {
      return res.status(400).json({ code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters' });
    }
    const newUser = new User({ email, password, name });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
    res.status(201).json({ userId: newUser._id, token, tokenExpiration: process.env.JWT_EXPIRATION, userType: 'user' });
  } catch (error) {
    res.status(500).json({ code: 'REGISTRATION_FAILED', message: error.message });
  }
});

router.post('/register/hospital', async (req, res) => {
  await registerEntity(Hospital, req, res, 'hospital');
});

const loginEntity = async (model, req, res, type) => {
  try {
    const { email, password } = req.body;
    const entity = await model.findOne({ email });
    if (!entity) {
      return res.status(401).json({ message: `Invalid ${type} credentials` });
    }
    const isMatch = await bcrypt.compare(password, entity.password);
    if (!isMatch) {
      return res.status(401).json({ message: `Invalid ${type} credentials` });
    }
    const token = jwt.sign({ userId: entity._id, exp: Math.floor(Date.now() / 1000) + 60 * 60 }, process.env.JWT_SECRET);
    res.json({ userId: entity._id, token, tokenExpiration: process.env.JWT_EXPIRATION, userType: type });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.post('/login/user', async (req, res) => {
  await loginEntity(User, req, res, 'user');
});

router.post('/login/hospital', async (req, res) => {
  await loginEntity(Hospital, req, res, 'hospital');
});

// Protected /me endpoint
router.get('/me', authMiddleware, async (req, res) => {
  const { userId } = req.user;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    let user = await User.findById(userId).select('-password');
    if (user) return res.json(user);
    let hospital = await Hospital.findById(userId).select('-password');
    if (hospital) return res.json(hospital);
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Token refresh endpoint (if needed)
router.post('/refresh', async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

export default router;
