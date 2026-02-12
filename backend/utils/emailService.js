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
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			</head>
			<body style="font-family: 'Nunito', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
				<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
						<h1 style="font-family: 'Poppins', sans-serif; margin: 0; font-size: 28px;">🧘 Respira</h1>
						<p style="font-family: 'Nunito', sans-serif; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
					</div>
					<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
						<p style="font-family: 'Nunito', sans-serif; margin: 0 0 15px 0;">Hello,</p>
						<p style="font-family: 'Nunito', sans-serif; margin: 0 0 15px 0;">We received a request to reset your password. Use the OTP code below to reset your password:</p>
						<div style="background: white; border: 2px dashed #0EA5A4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px;">
							<p style="font-family: 'Nunito', sans-serif; margin: 0; color: #666; font-size: 14px;">Your OTP Code</p>
							<div style="font-family: monospace; font-size: 32px; font-weight: bold; color: #0EA5A4; letter-spacing: 8px; margin-top: 10px;">${otp}</div>
						</div>
						<p style="font-family: 'Nunito', sans-serif; margin: 0 0 15px 0;"><strong>This OTP will expire in 10 minutes.</strong></p>
						<p style="font-family: 'Nunito', sans-serif; margin: 0 0 15px 0;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
						<p style="font-family: 'Nunito', sans-serif; margin: 0 0 10px 0;"><strong>Security Tips:</strong></p>
						<ul style="font-family: 'Nunito', sans-serif; margin: 0 0 15px 0; padding-left: 20px;">
							<li style="margin-bottom: 5px;">Never share your OTP with anyone</li>
							<li style="margin-bottom: 5px;">Respira will never ask for your OTP via phone or email</li>
							<li style="margin-bottom: 5px;">If you didn't request this, please secure your account</li>
						</ul>
						<p style="font-family: 'Nunito', sans-serif; margin: 0;">Best regards,<br>The Respira Team</p>
					</div>
					<div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
						<p style="font-family: 'Nunito', sans-serif; margin: 5px 0;">© ${new Date().getFullYear()} Respira. All rights reserved.</p>
						<p style="font-family: 'Nunito', sans-serif; margin: 5px 0;">This is an automated email. Please do not reply.</p>
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
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			</head>
			<body style="font-family: 'Nunito', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
				<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
						<h1 style="font-family: 'Poppins', sans-serif; margin: 0; font-size: 28px;">🧘 Respira</h1>
						<p style="font-family: 'Nunito', sans-serif; margin: 10px 0 0 0; font-size: 16px;">Password Reset Successful</p>
					</div>
					<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
						<div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 0 0 20px 0;">
							<strong style="font-family: 'Nunito', sans-serif;">✓ Success!</strong> <span style="font-family: 'Nunito', sans-serif;">Your password has been successfully reset.</span>
						</div>
						<p style="font-family: 'Nunito', sans-serif; margin: 0 0 15px 0;">Hello,</p>
						<p style="font-family: 'Nunito', sans-serif; margin: 0 0 15px 0;">This email confirms that your Respira account password was successfully changed.</p>
						<p style="font-family: 'Nunito', sans-serif; margin: 0 0 15px 0;">If you did not make this change, please contact our support team immediately at <a href="mailto:${process.env.FROM_EMAIL}" style="color: #0EA5A4; text-decoration: none;">${process.env.FROM_EMAIL}</a></p>
						<p style="font-family: 'Nunito', sans-serif; margin: 0 0 10px 0;">For your security, we recommend:</p>
						<ul style="font-family: 'Nunito', sans-serif; margin: 0 0 15px 0; padding-left: 20px;">
							<li style="margin-bottom: 5px;">Using a strong, unique password</li>
							<li style="margin-bottom: 5px;">Enabling two-factor authentication if available</li>
							<li style="margin-bottom: 5px;">Not sharing your password with anyone</li>
						</ul>
						<p style="font-family: 'Nunito', sans-serif; margin: 0;">Best regards,<br>The Respira Team</p>
					</div>
					<div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
						<p style="font-family: 'Nunito', sans-serif; margin: 5px 0;">© ${new Date().getFullYear()} Respira. All rights reserved.</p>
						<p style="font-family: 'Nunito', sans-serif; margin: 5px 0;">This is an automated email. Please do not reply.</p>
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
