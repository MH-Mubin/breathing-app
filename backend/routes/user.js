import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user stats
router.get('/stats', protect, async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select('-password');
		if (!user) return res.status(404).json({ success: false, message: 'User not found' });
		res.json({ success: true, data: { stats: user.stats, achievements: user.achievements } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Get profile
router.get('/profile', protect, async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select('-password');
		res.json({ success: true, data: user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

export default router;
