import pkg from 'nodemailer';
const { createTransport } = pkg;

// Create reusable transporter
const createTransporter = () => {
	return createTransport({
		host: process.env.SMTP_HOST,
		port: parseInt(process.env.SMTP_PORT),
		secure: false, // true for 465, false for other ports
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	});
};

// Send password reset OTP email
export const sendPasswordResetOTP = async (email, otp) => {
	const transporter = createTransporter();
	
	const mailOptions = {
		from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
		to: email,
		subject: 'Password Reset OTP - Respira',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
					.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
					.otp-box { background: white; border: 2px dashed #FF8A1F; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
					.otp-code { font-size: 32px; font-weight: bold; color: #FF8A1F; letter-spacing: 8px; font-family: monospace; }
					.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🧘 Respira</h1>
						<p>Password Reset Request</p>
					</div>
					<div class="content">
						<p>Hello,</p>
						<p>We received a request to reset your password. Use the OTP code below to reset your password:</p>
						<div class="otp-box">
							<p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code</p>
							<div class="otp-code">${otp}</div>
						</div>
						<p><strong>This OTP will expire in 10 minutes.</strong></p>
						<p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
						<p><strong>Security Tips:</strong></p>
						<ul>
							<li>Never share your OTP with anyone</li>
							<li>Respira will never ask for your OTP via phone or email</li>
							<li>If you didn't request this, please secure your account</li>
						</ul>
						<p>Best regards,<br>The Respira Team</p>
					</div>
					<div class="footer">
						<p>© ${new Date().getFullYear()} Respira. All rights reserved.</p>
						<p>This is an automated email. Please do not reply.</p>
					</div>
				</div>
			</body>
			</html>
		`,
		text: `
			Password Reset OTP
			
			Hello,
			
			We received a request to reset your password. Use the OTP code below to reset your password:
			
			OTP: ${otp}
			
			This OTP will expire in 10 minutes.
			
			If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
			
			Best regards,
			The Respira Team
		`,
	};
	
	try {
		await transporter.sendMail(mailOptions);
		console.log('Password reset OTP email sent to:', email);
		return { success: true };
	} catch (error) {
		console.error('Error sending OTP email:', error);
		throw new Error('Failed to send password reset OTP email');
	}
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email) => {
	const transporter = createTransporter();
	
	const mailOptions = {
		from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
		to: email,
		subject: 'Password Successfully Reset - Respira',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
					.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
					.success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
					.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🧘 Respira</h1>
						<p>Password Reset Successful</p>
					</div>
					<div class="content">
						<div class="success">
							<strong>✓ Success!</strong> Your password has been successfully reset.
						</div>
						<p>Hello,</p>
						<p>This email confirms that your Respira account password was successfully changed.</p>
						<p>If you did not make this change, please contact our support team immediately at <a href="mailto:${process.env.FROM_EMAIL}">${process.env.FROM_EMAIL}</a></p>
						<p>For your security, we recommend:</p>
						<ul>
							<li>Using a strong, unique password</li>
							<li>Enabling two-factor authentication if available</li>
							<li>Not sharing your password with anyone</li>
						</ul>
						<p>Best regards,<br>The Respira Team</p>
					</div>
					<div class="footer">
						<p>© ${new Date().getFullYear()} Respira. All rights reserved.</p>
						<p>This is an automated email. Please do not reply.</p>
					</div>
				</div>
			</body>
			</html>
		`,
		text: `
			Password Reset Successful
			
			Hello,
			
			This email confirms that your Respira account password was successfully changed.
			
			If you did not make this change, please contact our support team immediately at ${process.env.FROM_EMAIL}
			
			Best regards,
			The Respira Team
		`,
	};
	
	try {
		await transporter.sendMail(mailOptions);
		console.log('Password reset confirmation email sent to:', email);
		return { success: true };
	} catch (error) {
		console.error('Error sending confirmation email:', error);
		// Don't throw error for confirmation email - it's not critical
		return { success: false };
	}
};
