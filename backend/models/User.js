import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
	name: { type: String, required: true },
	icon: { type: String, required: true },
	description: String,
	unlockedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	password: { type: String, required: true, select: false },
	stats: {
		streak: { type: Number, default: 0 },
		totalSessions: { type: Number, default: 0 },
		totalMinutes: { type: Number, default: 0 },
		lastSessionDate: Date,
		longestStreak: { type: Number, default: 0 }
	},
	achievements: [achievementSchema]
}, { timestamps: true });

// Hash password
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak based on lastSessionDate
userSchema.methods.updateStreak = function () {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	if (!this.stats.lastSessionDate) {
		this.stats.streak = 1;
		this.stats.lastSessionDate = today;
		this.stats.longestStreak = Math.max(this.stats.longestStreak || 0, this.stats.streak);
		return;
	}

	const last = new Date(this.stats.lastSessionDate);
	last.setHours(0, 0, 0, 0);
	const diffMs = today - last;
	const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		// already did today; no change
		return;
	}

	if (diffDays === 1) {
		this.stats.streak = (this.stats.streak || 0) + 1;
	} else {
		this.stats.streak = 1; // reset
	}

	this.stats.lastSessionDate = today;
	if (this.stats.streak > (this.stats.longestStreak || 0)) {
		this.stats.longestStreak = this.stats.streak;
	}
};

userSchema.methods.checkAchievements = function () {
	const newAchievements = [];

	const achs = [
		{ sessions: 1, name: 'First Breath', icon: '🌱', description: 'Complete your first session' },
		{ sessions: 5, name: 'Getting Started', icon: '🌿', description: 'Complete 5 sessions' },
		{ sessions: 10, name: 'Dedicated', icon: '🌳', description: 'Complete 10 sessions' },
		{ sessions: 25, name: 'Committed', icon: '🏆', description: 'Complete 25 sessions' },
		{ sessions: 50, name: 'Breathing Master', icon: '⭐', description: 'Complete 50 sessions' },
		{ sessions: 100, name: 'Zen Master', icon: '🧘', description: 'Complete 100 sessions' },
		{ streak: 3, name: '3-Day Streak', icon: '🔥', description: 'Practice 3 days in a row' },
		{ streak: 7, name: 'Week Warrior', icon: '💪', description: 'Practice 7 days in a row' },
		{ streak: 14, name: 'Two Week Champion', icon: '🏅', description: 'Practice 14 days in a row' },
		{ streak: 30, name: 'Monthly Meditator', icon: '🌟', description: 'Practice 30 days in a row' },
		{ minutes: 60, name: 'Hour of Peace', icon: '⏰', description: 'Complete 60 minutes total' },
		{ minutes: 300, name: 'Time Investment', icon: '⌛', description: 'Complete 300 minutes total' },
		{ minutes: 1000, name: 'Dedication Master', icon: '💎', description: 'Complete 1000 minutes total' }
	];

	achs.forEach(a => {
		const already = this.achievements && this.achievements.find(x => x.name === a.name);
		if (already) return;

		if (a.sessions && (this.stats.totalSessions || 0) >= a.sessions) {
			this.achievements.push({ name: a.name, icon: a.icon, description: a.description });
			newAchievements.push(a);
		}
		if (a.streak && (this.stats.streak || 0) >= a.streak) {
			this.achievements.push({ name: a.name, icon: a.icon, description: a.description });
			newAchievements.push(a);
		}
		if (a.minutes && (this.stats.totalMinutes || 0) >= a.minutes) {
			this.achievements.push({ name: a.name, icon: a.icon, description: a.description });
			newAchievements.push(a);
		}
	});

	return newAchievements;
};

const User = mongoose.model('User', userSchema);

export default User;
