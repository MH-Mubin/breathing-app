import express from 'express';
import { protect } from '../middleware/auth.js';
import Session from '../models/Session.js';
import User from '../models/User.js';

const router = express.Router();

// Start a new session
router.post('/start', protect, async (req, res) => {
	try {
		const { duration, pattern } = req.body; // duration in seconds
		if (!duration || !pattern) return res.status(400).json({ success: false, message: 'Missing duration or pattern' });

		const session = await Session.create({ user: req.user._id, duration, pattern, completed: false });
		res.json({ success: true, data: session });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Complete session
router.post('/complete', protect, async (req, res) => {
	try {
		const { sessionId, duration, pattern } = req.body;
		let session = null;
		if (sessionId) session = await Session.findById(sessionId);

		if (!session) {
			// create a completed session if not found
			session = await Session.create({ user: req.user._id, duration: duration || 0, pattern: pattern || { inhale: 5, hold: 2, exhale: 7 }, completed: true, completedAt: new Date() });
		} else {
			session.completed = true;
			session.completedAt = new Date();
			session.duration = duration || session.duration;
			session.pattern = pattern || session.pattern;
			await session.save();
		}

		// Update user stats
		const minutes = Math.round((duration || session.duration || 0) / 60);
		const user = await User.findById(req.user._id);
		user.stats.totalSessions = (user.stats.totalSessions || 0) + 1;
		user.stats.totalMinutes = (user.stats.totalMinutes || 0) + minutes;
		user.updateStreak();
		const newAchievements = user.checkAchievements();
		await user.save();

		res.json({ success: true, data: { session, streak: user.stats.streak, totalSessions: user.stats.totalSessions, totalMinutes: user.stats.totalMinutes, newAchievements } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Get session history
router.get('/history', protect, async (req, res) => {
	try {
		const sessions = await Session.find({ user: req.user._id }).sort({ createdAt: -1 });
		res.json({ success: true, data: sessions });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

export default router;
