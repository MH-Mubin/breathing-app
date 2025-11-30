import express from 'express';
import { protect } from '../middleware/auth.js';
import Pattern from '../models/Pattern.js';

const router = express.Router();

// Create pattern
router.post('/create', protect, async (req, res) => {
	try {
		const { name, pattern } = req.body;
		if (!pattern || !pattern.inhale || !pattern.exhale) return res.status(400).json({ success: false, message: 'Invalid pattern' });
		const p = await Pattern.create({ user: req.user._id, name: name || 'Custom', pattern });
		res.json({ success: true, data: p });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Get user's patterns
router.get('/', protect, async (req, res) => {
	try {
		const patterns = await Pattern.find({ user: req.user._id }).sort({ createdAt: -1 });
		res.json({ success: true, data: patterns });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Delete pattern
router.delete('/:id', protect, async (req, res) => {
	try {
		const p = await Pattern.findOneAndDelete({ _id: req.params.id, user: req.user._id });
		if (!p) return res.status(404).json({ success: false, message: 'Pattern not found' });
		res.json({ success: true, message: 'Deleted' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

export default router;
