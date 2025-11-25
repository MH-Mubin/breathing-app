import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	time: { type: String, required: true }, // e.g. '08:00'
	days: { type: [String], default: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
	enabled: { type: Boolean, default: true },
	viaEmail: { type: Boolean, default: false }
}, { timestamps: true });

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;
