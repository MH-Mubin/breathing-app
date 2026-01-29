import mongoose from 'mongoose';

const patternSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	name: { type: String, required: true },
	description: { type: String, default: '' },
	pattern: {
		inhale: { type: Number, required: true },
		hold: { type: Number, default: 0 },
		exhale: { type: Number, required: true }
	},
	isPublic: { type: Boolean, default: false }
}, { timestamps: true });

const Pattern = mongoose.model('Pattern', patternSchema);

export default Pattern;
