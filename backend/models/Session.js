import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	duration: { type: Number, required: true }, // seconds
	pattern: {
		inhale: { type: Number, required: true },
		hold: { type: Number, default: 0 },
		exhale: { type: Number, required: true }
	},
	completed: { type: Boolean, default: false },
	completedAt: Date
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
