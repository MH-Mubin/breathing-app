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

// Get profile with statistics
router.get('/profile', protect, async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select('-password');
		
		if (!user) {
			return res.status(404).json({ 
				success: false, 
				message: 'User not found' 
			});
		}

		// Calculate member since date
		const memberSince = user.createdAt;
		
		// Prepare response with profile data and statistics
		const profileData = {
			_id: user._id,
			name: user.name,
			email: user.email,
			profile: user.profile || {
				phone: '',
				location: '',
				avatar: ''
			},
			preferences: user.preferences || {
				notifications: true,
				dailyReminders: true,
				achievementAlerts: true,
				emailUpdates: false
			},
			stats: user.stats || {
				streak: 0,
				totalSessions: 0,
				totalMinutes: 0,
				longestStreak: 0
			},
			achievements: user.achievements || [],
			createdAt: memberSince
		};

		res.json({ 
			success: true, 
			data: profileData 
		});
	} catch (error) {
		console.error('Profile fetch error:', error);
		res.status(500).json({ 
			success: false, 
			message: 'Failed to fetch profile data' 
		});
	}
});

// Update profile
router.put('/profile', protect, async (req, res) => {
	try {
		const { name, email, profile } = req.body;
		
		// Input validation
		const errors = {};
		
		if (name !== undefined) {
			if (!name || name.trim().length === 0) {
				errors.name = 'Name is required';
			} else if (name.trim().length > 50) {
				errors.name = 'Name must be less than 50 characters';
			}
		}
		
		if (email !== undefined) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!email || !emailRegex.test(email)) {
				errors.email = 'Invalid email format';
			}
		}
		
		if (profile) {
			if (profile.phone && profile.phone.length > 20) {
				errors.phone = 'Phone number must be less than 20 characters';
			}
			if (profile.location && profile.location.length > 100) {
				errors.location = 'Location must be less than 100 characters';
			}
		}
		
		// Return validation errors if any
		if (Object.keys(errors).length > 0) {
			return res.status(400).json({
				success: false,
				message: 'Validation error',
				errors
			});
		}
		
		// Find user
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}
		
		// Update fields if provided
		if (name !== undefined) {
			user.name = name.trim();
		}
		
		if (email !== undefined) {
			// Check if email is already taken by another user
			const existingUser = await User.findOne({ 
				email: email.toLowerCase(), 
				_id: { $ne: user._id } 
			});
			if (existingUser) {
				return res.status(400).json({
					success: false,
					message: 'Email already in use',
					errors: { email: 'Email already in use' }
				});
			}
			user.email = email.toLowerCase();
		}
		
		if (profile) {
			// Initialize profile object if it doesn't exist
			if (!user.profile) {
				user.profile = {};
			}
			
			if (profile.phone !== undefined) {
				user.profile.phone = profile.phone.trim();
			}
			if (profile.location !== undefined) {
				user.profile.location = profile.location.trim();
			}
			if (profile.avatar !== undefined) {
				user.profile.avatar = profile.avatar;
			}
		}
		
		// Save updated user
		await user.save();
		
		// Return updated user data (excluding password)
		const updatedUser = await User.findById(user._id).select('-password');
		
		const responseData = {
			_id: updatedUser._id,
			name: updatedUser.name,
			email: updatedUser.email,
			profile: updatedUser.profile || {
				phone: '',
				location: '',
				avatar: ''
			},
			preferences: updatedUser.preferences || {
				notifications: true,
				dailyReminders: true,
				achievementAlerts: true,
				emailUpdates: false
			},
			stats: updatedUser.stats || {
				streak: 0,
				totalSessions: 0,
				totalMinutes: 0,
				longestStreak: 0
			},
			achievements: updatedUser.achievements || [],
			createdAt: updatedUser.createdAt
		};
		
		res.json({
			success: true,
			message: 'Profile updated successfully',
			data: responseData
		});
		
	} catch (error) {
		console.error('Profile update error:', error);
		
		// Handle duplicate key error (email)
		if (error.code === 11000) {
			return res.status(400).json({
				success: false,
				message: 'Email already in use',
				errors: { email: 'Email already in use' }
			});
		}
		
		res.status(500).json({
			success: false,
			message: 'Failed to update profile'
		});
	}
});

// Update user preferences
router.put('/preferences', protect, async (req, res) => {
	try {
		const { notifications, dailyReminders, achievementAlerts, emailUpdates } = req.body;
		
		// Find user
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}
		
		// Initialize preferences object if it doesn't exist
		if (!user.preferences) {
			user.preferences = {
				notifications: true,
				dailyReminders: true,
				achievementAlerts: true,
				emailUpdates: false
			};
		}
		
		// Update preferences if provided (only update fields that are explicitly provided)
		if (notifications !== undefined) {
			user.preferences.notifications = Boolean(notifications);
		}
		if (dailyReminders !== undefined) {
			user.preferences.dailyReminders = Boolean(dailyReminders);
		}
		if (achievementAlerts !== undefined) {
			user.preferences.achievementAlerts = Boolean(achievementAlerts);
		}
		if (emailUpdates !== undefined) {
			user.preferences.emailUpdates = Boolean(emailUpdates);
		}
		
		// Save updated user with immediate persistence
		await user.save();
		
		// Return updated preferences object
		res.json({
			success: true,
			message: 'Preferences updated successfully',
			data: user.preferences
		});
		
	} catch (error) {
		console.error('Preferences update error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update preferences'
		});
	}
});

// Change password
router.put('/change-password', protect, async (req, res) => {
	try {
		const { currentPassword, newPassword, confirmPassword } = req.body;
		
		// Input validation
		const errors = {};
		
		if (!currentPassword) {
			errors.currentPassword = 'Current password is required';
		}
		
		if (!newPassword) {
			errors.newPassword = 'New password is required';
		} else if (newPassword.length < 6) {
			errors.newPassword = 'New password must be at least 6 characters';
		}
		
		if (!confirmPassword) {
			errors.confirmPassword = 'Password confirmation is required';
		} else if (newPassword !== confirmPassword) {
			errors.confirmPassword = 'Passwords do not match';
		}
		
		// Return validation errors if any
		if (Object.keys(errors).length > 0) {
			return res.status(400).json({
				success: false,
				message: 'Validation error',
				errors
			});
		}
		
		// Find user with password field (since it's normally excluded)
		const user = await User.findById(req.user._id).select('+password');
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}
		
		// Verify current password using bcrypt
		const isCurrentPasswordValid = await user.comparePassword(currentPassword);
		if (!isCurrentPasswordValid) {
			return res.status(401).json({
				success: false,
				message: 'Current password is incorrect',
				errors: { currentPassword: 'Current password is incorrect' }
			});
		}
		
		// Update password (will be automatically hashed by the pre-save middleware)
		user.password = newPassword;
		await user.save();
		
		// Return success response (no sensitive data)
		res.json({
			success: true,
			message: 'Password changed successfully'
		});
		
	} catch (error) {
		console.error('Password change error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to change password'
		});
	}
});

export default router;
