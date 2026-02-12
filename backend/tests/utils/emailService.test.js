import { sendPasswordResetConfirmation, sendPasswordResetOTP } from '../../utils/emailService.js';

// Mock nodemailer
jest.mock('nodemailer', () => ({
	__esModule: true,
	default: {
		createTransport: jest.fn(() => ({
			sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
		}))
	}
}));

describe('Email Service - Color and Typography Tests', () => {
	const testEmail = 'test@example.com';
	const testOTP = '123456';

	beforeEach(() => {
		// Set required environment variables
		process.env.SMTP_HOST = 'smtp.test.com';
		process.env.SMTP_PORT = '587';
		process.env.SMTP_USER = 'test@test.com';
		process.env.SMTP_PASS = 'testpass';
		process.env.FROM_NAME = 'Test Respira';
		process.env.FROM_EMAIL = 'noreply@test.com';
	});

	describe('Password Reset OTP Email', () => {
		test('should contain new teal primary color (#0EA5A4)', async () => {
			const nodemailer = require('nodemailer');
			const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
			nodemailer.default.createTransport.mockReturnValue({ sendMail: mockSendMail });

			await sendPasswordResetOTP(testEmail, testOTP);

			expect(mockSendMail).toHaveBeenCalled();
			const mailOptions = mockSendMail.mock.calls[0][0];
			expect(mailOptions.html).toContain('#0EA5A4');
		});

		test('should NOT contain old orange colors (#FF8A1F or #ff6a00)', async () => {
			const nodemailer = require('nodemailer');
			const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
			nodemailer.default.createTransport.mockReturnValue({ sendMail: mockSendMail });

			await sendPasswordResetOTP(testEmail, testOTP);

			const mailOptions = mockSendMail.mock.calls[0][0];
			expect(mailOptions.html).not.toMatch(/#FF8A1F/i);
			expect(mailOptions.html).not.toMatch(/#ff6a00/i);
		});

		test('should use inline styles (no class attributes)', async () => {
			const nodemailer = require('nodemailer');
			const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
			nodemailer.default.createTransport.mockReturnValue({ sendMail: mockSendMail });

			await sendPasswordResetOTP(testEmail, testOTP);

			const mailOptions = mockSendMail.mock.calls[0][0];
			// Should not have class="..." attributes
			expect(mailOptions.html).not.toMatch(/class="/);
			// Should have style="..." attributes
			expect(mailOptions.html).toMatch(/style="/);
		});

		test('should use Poppins font for headings', async () => {
			const nodemailer = require('nodemailer');
			const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
			nodemailer.default.createTransport.mockReturnValue({ sendMail: mockSendMail });

			await sendPasswordResetOTP(testEmail, testOTP);

			const mailOptions = mockSendMail.mock.calls[0][0];
			expect(mailOptions.html).toMatch(/font-family:\s*'Poppins'/);
		});

		test('should use Nunito font for body text', async () => {
			const nodemailer = require('nodemailer');
			const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
			nodemailer.default.createTransport.mockReturnValue({ sendMail: mockSendMail });

			await sendPasswordResetOTP(testEmail, testOTP);

			const mailOptions = mockSendMail.mock.calls[0][0];
			expect(mailOptions.html).toMatch(/font-family:\s*'Nunito'/);
		});
	});

	describe('Password Reset Confirmation Email', () => {
		test('should contain new teal primary color (#0EA5A4)', async () => {
			const nodemailer = require('nodemailer');
			const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
			nodemailer.default.createTransport.mockReturnValue({ sendMail: mockSendMail });

			await sendPasswordResetConfirmation(testEmail);

			expect(mockSendMail).toHaveBeenCalled();
			const mailOptions = mockSendMail.mock.calls[0][0];
			expect(mailOptions.html).toContain('#0EA5A4');
		});

		test('should NOT contain old orange colors (#FF8A1F or #ff6a00)', async () => {
			const nodemailer = require('nodemailer');
			const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
			nodemailer.default.createTransport.mockReturnValue({ sendMail: mockSendMail });

			await sendPasswordResetConfirmation(testEmail);

			const mailOptions = mockSendMail.mock.calls[0][0];
			expect(mailOptions.html).not.toMatch(/#FF8A1F/i);
			expect(mailOptions.html).not.toMatch(/#ff6a00/i);
		});

		test('should use inline styles (no class attributes)', async () => {
			const nodemailer = require('nodemailer');
			const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
			nodemailer.default.createTransport.mockReturnValue({ sendMail: mockSendMail });

			await sendPasswordResetConfirmation(testEmail);

			const mailOptions = mockSendMail.mock.calls[0][0];
			// Should not have class="..." attributes
			expect(mailOptions.html).not.toMatch(/class="/);
			// Should have style="..." attributes
			expect(mailOptions.html).toMatch(/style="/);
		});

		test('should use Poppins font for headings', async () => {
			const nodemailer = require('nodemailer');
			const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
			nodemailer.default.createTransport.mockReturnValue({ sendMail: mockSendMail });

			await sendPasswordResetConfirmation(testEmail);

			const mailOptions = mockSendMail.mock.calls[0][0];
			expect(mailOptions.html).toMatch(/font-family:\s*'Poppins'/);
		});

		test('should use Nunito font for body text', async () => {
			const nodemailer = require('nodemailer');
			const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
			nodemailer.default.createTransport.mockReturnValue({ sendMail: mockSendMail });

			await sendPasswordResetConfirmation(testEmail);

			const mailOptions = mockSendMail.mock.calls[0][0];
			expect(mailOptions.html).toMatch(/font-family:\s*'Nunito'/);
		});
	});
});
