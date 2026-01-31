import express from 'express';
import { protect } from '../middleware/auth.js';
import Session from '../models/Session.js';
import User from '../models/User.js';

const router = express.Router();

// Get comprehensive dashboard stats
router.get('/stats', protect, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		const sessions = await Session.find({ user: req.user._id, completed: true }).sort({ completedAt: -1 });

		// Today's stats
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const todaySessions = sessions.filter(s => {
			const sessionDate = new Date(s.completedAt);
			sessionDate.setHours(0, 0, 0, 0);
			return sessionDate.getTime() === today.getTime();
		});
		const todayMinutes = todaySessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

		// This week's stats
		const weekAgo = new Date(today);
		weekAgo.setDate(weekAgo.getDate() - 7);
		const thisWeekSessions = sessions.filter(s => new Date(s.completedAt) >= weekAgo);
		const thisWeekMinutes = thisWeekSessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

		// Last week's stats for comparison
		const twoWeeksAgo = new Date(weekAgo);
		twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
		const lastWeekSessions = sessions.filter(s => {
			const date = new Date(s.completedAt);
			return date >= twoWeeksAgo && date < weekAgo;
		});
		const lastWeekMinutes = lastWeekSessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

		// Average session duration
		const avgDuration = sessions.length > 0 
			? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length / 60)
			: 0;

		// Calculate weekly average
		const weeklyAvg = sessions.length > 0
			? Math.round((user.stats.totalSessions || 0) / Math.max(1, Math.ceil((Date.now() - user.createdAt) / (7 * 24 * 60 * 60 * 1000))))
			: 0;

		res.json({
			success: true,
			data: {
				today: {
					sessions: todaySessions.length,
					minutes: todayMinutes,
					streak: user.stats.streak || 0,
				},
				allTime: {
					totalSessions: user.stats.totalSessions || 0,
					totalMinutes: user.stats.totalMinutes || 0,
					longestStreak: user.stats.longestStreak || 0,
					avgDuration,
					weeklyAvg,
				},
				thisWeek: {
					sessions: thisWeekSessions.length,
					minutes: thisWeekMinutes,
				},
				lastWeek: {
					sessions: lastWeekSessions.length,
					minutes: lastWeekMinutes,
				},
				comparison: {
					sessionsChange: thisWeekSessions.length - lastWeekSessions.length,
					minutesChange: thisWeekMinutes - lastWeekMinutes,
				},
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Get weekly activity for calendar heatmap
router.get('/weekly-activity', protect, async (req, res) => {
	try {
		const sessions = await Session.find({ user: req.user._id, completed: true });
		
		// Get last 365 days (1 year)
		const days = [];
		const today = new Date();
		for (let i = 364; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);
			date.setHours(0, 0, 0, 0);
			
			const daySessions = sessions.filter(s => {
				const sessionDate = new Date(s.completedAt);
				sessionDate.setHours(0, 0, 0, 0);
				return sessionDate.getTime() === date.getTime();
			});
			
			days.push({
				date: date.toISOString().split('T')[0],
				sessions: daySessions.length,
				minutes: daySessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0),
				active: daySessions.length > 0,
			});
		}

		res.json({ success: true, data: days });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Get pattern usage statistics
router.get('/pattern-usage', protect, async (req, res) => {
	try {
		const sessions = await Session.find({ user: req.user._id, completed: true });
		
		// Group by pattern
		const patternMap = {};
		sessions.forEach(s => {
			const key = `${s.pattern.inhale}-${s.pattern.hold || 0}-${s.pattern.exhale}`;
			if (!patternMap[key]) {
				patternMap[key] = {
					pattern: s.pattern,
					count: 0,
					totalMinutes: 0,
					name: getPatternName(s.pattern),
				};
			}
			patternMap[key].count++;
			patternMap[key].totalMinutes += Math.round(s.duration / 60);
		});

		const patterns = Object.values(patternMap).sort((a, b) => b.count - a.count);

		res.json({ success: true, data: patterns });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Get personalized insights
router.get('/insights', protect, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		const sessions = await Session.find({ user: req.user._id, completed: true }).sort({ completedAt: -1 });
		
		const insights = [];

		// Streak insight
		if (user.stats.streak >= 3) {
			insights.push({
				type: 'streak',
				icon: '🔥',
				message: `Amazing! You're on a ${user.stats.streak}-day streak. Keep it going!`,
			});
		} else if (user.stats.streak === 0 && user.stats.totalSessions > 0) {
			insights.push({
				type: 'comeback',
				icon: '💪',
				message: "Welcome back! Start a new streak today.",
			});
		}

		// Consistency insight
		if (sessions.length >= 7) {
			const last7Days = sessions.slice(0, 7);
			const uniqueDays = new Set(last7Days.map(s => new Date(s.completedAt).toDateString())).size;
			if (uniqueDays >= 5) {
				insights.push({
					type: 'consistency',
					icon: '⭐',
					message: `You practiced ${uniqueDays} out of the last 7 days. Excellent consistency!`,
				});
			}
		}

		// Milestone insight
		const nextMilestone = getNextMilestone(user.stats.totalSessions);
		if (nextMilestone) {
			const remaining = nextMilestone.value - user.stats.totalSessions;
			insights.push({
				type: 'milestone',
				icon: '🎯',
				message: `Only ${remaining} more session${remaining > 1 ? 's' : ''} until you reach ${nextMilestone.value} total sessions!`,
			});
		}

		// Time of day insight
		if (sessions.length >= 10) {
			const hourCounts = {};
			sessions.slice(0, 20).forEach(s => {
				const hour = new Date(s.completedAt).getHours();
				hourCounts[hour] = (hourCounts[hour] || 0) + 1;
			});
			const mostActiveHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
			if (mostActiveHour) {
				const hour = parseInt(mostActiveHour[0]);
				const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
				insights.push({
					type: 'timing',
					icon: '⏰',
					message: `You're most consistent in the ${timeOfDay}. That's your power hour!`,
				});
			}
		}

		// Encouragement
		if (insights.length === 0) {
			insights.push({
				type: 'encouragement',
				icon: '🌟',
				message: "Every breath is a step toward calm. Start your practice today!",
			});
		}

		res.json({ success: true, data: insights });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Helper functions
function getPatternName(pattern) {
	const { inhale, hold, exhale } = pattern;
	if (inhale === 4 && hold === 7 && exhale === 8) return '4-7-8 Breathing';
	if (inhale === 4 && hold === 4 && exhale === 4) return 'Box Breathing';
	if (inhale === 5 && hold === 0 && exhale === 5) return 'Equal Breathing';
	if (inhale === 4 && hold === 0 && exhale === 6) return 'Relaxing Breath';
	return `${inhale}-${hold}-${exhale} Pattern`;
}

function getNextMilestone(current) {
	const milestones = [5, 10, 25, 50, 100, 200, 500, 1000];
	for (const m of milestones) {
		if (current < m) return { value: m };
	}
	return null;
}

export default router;
