import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// Register
router.post('/register', async (req, res) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Please provide name, email and password' });

		const existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

		const user = await User.create({ name, email, password });
		const token = generateToken(user._id);
		const userObj = await User.findById(user._id).select('-password');
		res.json({ success: true, data: { ...userObj.toObject(), token } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Login
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

		const user = await User.findOne({ email }).select('+password');
		if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

		const isMatch = await user.comparePassword(password);
		if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

		const token = generateToken(user._id);
		const userObj = await User.findById(user._id).select('-password');
		res.json({ success: true, data: { ...userObj.toObject(), token } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Get current user
router.get('/me', protect, async (req, res) => {
	try {
		res.json({ success: true, data: req.user });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

export default router;
