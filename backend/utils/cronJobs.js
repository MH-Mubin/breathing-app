import cron from 'node-cron';
import Reminder from '../models/Reminder.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

export const startReminders = () => {
	// Run every minute and check reminders (simple check)
	cron.schedule('* * * * *', async () => {
		try {
			const now = new Date();
			const hh = String(now.getHours()).padStart(2, '0');
			const mm = String(now.getMinutes()).padStart(2, '0');
			const timeStr = `${hh}:${mm}`;
			const reminders = await Reminder.find({ enabled: true });
			const toNotify = reminders.filter(r => r.time === timeStr);
			if (!toNotify.length) return;

			// If email configured, send notifications
			if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
				const transporter = nodemailer.createTransport({
					host: process.env.EMAIL_HOST,
					port: process.env.EMAIL_PORT || 587,
					secure: false,
					auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
				});

				for (const r of toNotify) {
					if (!r.viaEmail) continue;
					const user = await User.findById(r.user);
					if (!user) continue;
					await transporter.sendMail({ from: process.env.EMAIL_USER, to: user.email, subject: 'Breathing reminder', text: `Time to breathe — ${r.time}` });
				}
			}
		} catch (err) {
			console.error('Cron reminder error', err);
		}
	});
};

export default startReminders;
