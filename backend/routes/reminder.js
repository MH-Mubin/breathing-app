import express from 'express';
import Reminder from '../models/Reminder.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create reminder
router.post('/create', protect, async (req, res) => {
	try {
		const { time, days, viaEmail, enabled } = req.body;
		if (!time) return res.status(400).json({ success: false, message: 'time required' });
		const r = await Reminder.create({ user: req.user._id, time, days, viaEmail, enabled });
		res.json({ success: true, data: r });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// List reminders
router.get('/', protect, async (req, res) => {
	try {
		const list = await Reminder.find({ user: req.user._id }).sort({ createdAt: -1 });
		res.json({ success: true, data: list });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Delete
router.delete('/:id', protect, async (req, res) => {
	try {
		const r = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
		if (!r) return res.status(404).json({ success: false, message: 'Reminder not found' });
		res.json({ success: true, message: 'Deleted' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

export default router;
