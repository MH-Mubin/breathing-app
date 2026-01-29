import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import { sendPasswordResetConfirmation, sendPasswordResetOTP } from '../utils/emailService.js';

const router = express.Router();

const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// Register
router.post('/register', async (req, res) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Please provide name, email and password' });

		const existing = await User.findOne({ email });
		if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

		const user = await User.create({ name, email, password });
		const token = generateToken(user._id);
		const userObj = await User.findById(user._id).select('-password');
		res.json({ success: true, data: { ...userObj.toObject(), token } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Login
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

		const user = await User.findOne({ email }).select('+password');
		if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

		const isMatch = await user.comparePassword(password);
		if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

		const token = generateToken(user._id);
		const userObj = await User.findById(user._id).select('-password');
		res.json({ success: true, data: { ...userObj.toObject(), token } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Get current user
router.get('/me', protect, async (req, res) => {
	try {
		res.json({ success: true, data: req.user });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
	try {
		const { email } = req.body;
		
		if (!email) {
			return res.status(400).json({ 
				success: false, 
				message: 'Please provide an email address' 
			});
		}

		// Find user by email
		const user = await User.findOne({ email: email.toLowerCase() });
		
		if (!user) {
			// Don't reveal if user exists or not for security
			return res.json({ 
				success: true, 
				message: 'If an account exists with this email, an OTP has been sent.' 
			});
		}

		// Generate 6-digit OTP
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		
		// Hash OTP and save to database
		const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
		
		user.resetPasswordOTP = hashedOTP;
		user.resetPasswordOTPExpires = Date.now() + 600000; // 10 minutes
		await user.save();

		// Send email
		try {
			await sendPasswordResetOTP(user.email, otp);
			
			res.json({ 
				success: true, 
				message: 'OTP sent to your email successfully' 
			});
		} catch (emailError) {
			// If email fails, remove OTP
			user.resetPasswordOTP = undefined;
			user.resetPasswordOTPExpires = undefined;
			await user.save();
			
			console.error('Email sending failed:', emailError);
			return res.status(500).json({ 
				success: false, 
				message: 'Failed to send OTP email. Please try again later.' 
			});
		}
	} catch (error) {
		console.error('Forgot password error:', error);
		res.status(500).json({ 
			success: false, 
			message: 'An error occurred. Please try again later.' 
		});
	}
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
	try {
		const { email, otp } = req.body;
		
		if (!email || !otp) {
			return res.status(400).json({ 
				success: false, 
				message: 'Please provide email and OTP' 
			});
		}

		// Hash the OTP
		const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
		
		// Find user with valid OTP
		const user = await User.findOne({
			email: email.toLowerCase(),
			resetPasswordOTP: hashedOTP,
			resetPasswordOTPExpires: { $gt: Date.now() }
		}).select('+resetPasswordOTP +resetPasswordOTPExpires');

		if (!user) {
			return res.status(400).json({ 
				success: false, 
				message: 'Invalid or expired OTP' 
			});
		}

		res.json({ 
			success: true, 
			message: 'OTP verified successfully'
		});
	} catch (error) {
		console.error('Verify OTP error:', error);
		res.status(500).json({ 
			success: false, 
			message: 'An error occurred. Please try again later.' 
		});
	}
});

// Reset Password with OTP
router.post('/reset-password', async (req, res) => {
	try {
		const { email, otp, password } = req.body;
		
		if (!email || !otp || !password) {
			return res.status(400).json({ 
				success: false, 
				message: 'Please provide email, OTP, and new password' 
			});
		}

		if (password.length < 6) {
			return res.status(400).json({ 
				success: false, 
				message: 'Password must be at least 6 characters long' 
			});
		}

		// Hash the OTP
		const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
		
		// Find user with valid OTP
		const user = await User.findOne({
			email: email.toLowerCase(),
			resetPasswordOTP: hashedOTP,
			resetPasswordOTPExpires: { $gt: Date.now() }
		}).select('+resetPasswordOTP +resetPasswordOTPExpires +password');

		if (!user) {
			return res.status(400).json({ 
				success: false, 
				message: 'Invalid or expired OTP' 
			});
		}

		// Update password
		user.password = password;
		user.resetPasswordOTP = undefined;
		user.resetPasswordOTPExpires = undefined;
		await user.save();

		// Send confirmation email (don't wait for it)
		sendPasswordResetConfirmation(user.email).catch(err => 
			console.error('Failed to send confirmation email:', err)
		);

		res.json({ 
			success: true, 
			message: 'Password reset successful. Please login with your new password.'
		});
	} catch (error) {
		console.error('Reset password error:', error);
		res.status(500).json({ 
			success: false, 
			message: 'An error occurred. Please try again later.' 
		});
	}
});

export default router;
