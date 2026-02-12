import express from 'express';
import * as fc from 'fast-check';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import User from '../../models/User.js';
import userRoutes from '../../routes/user.js';

// Set up test environment
process.env.JWT_SECRET = 'breathing_app_super_secret_jwt_key_2024_secure_32_characters_minimum';

// Mock the User model
const mockUserFindById = (user) => {
	User.findById = jest.fn(() => ({
		select: jest.fn().mockResolvedValue(user)
	}));
};

const mockUserForUpdate = (user) => {
	// Create a user object with save method for the route
	const userWithSave = {
		...user,
		save: jest.fn().mockResolvedValue(user)
	};
	
	// Mock findById to handle both auth middleware (.select) and route (direct access)
	User.findById = jest.fn((id) => {
		// Create a chainable mock that works for both auth middleware and route
		const mockChain = {
			select: jest.fn().mockResolvedValue(user) // For auth middleware - always return user
		};
		
		// Return the user with save method for direct access (route usage)
		const result = Promise.resolve(userWithSave);
		// Add the select method to the promise for auth middleware
		result.select = jest.fn().mockResolvedValue(user);
		
		return result;
	});
	
	User.findOne = jest.fn().mockResolvedValue(null); // No duplicate email
};

// Create test app
const app = express();
app.use(express.json());
app.use('/api/user', userRoutes);

// Mock user data
const mockUser = {
	_id: '507f1f77bcf86cd799439011',
	name: 'Test User',
	email: 'test@example.com',
	profile: {
		phone: '+1234567890',
		location: 'Test City',
		avatar: ''
	},
	preferences: {
		notifications: true,
		dailyReminders: true,
		achievementAlerts: true,
		emailUpdates: false
	},
	stats: {
		streak: 5,
		totalSessions: 10,
		totalMinutes: 100,
		longestStreak: 7
	},
	achievements: [],
	createdAt: new Date('2024-01-01')
};

// Mock JWT token
const mockToken = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET);

describe('User Profile Routes', () => {
	beforeEach(() => {
		// Clear all mocks before each test
	});

	describe('GET /api/user/profile', () => {
		it('should return user profile data with statistics', async () => {
			// Mock User.findById
			mockUserFindById(mockUser);

			const response = await request(app)
				.get('/api/user/profile')
				.set('Authorization', `Bearer ${mockToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('name', 'Test User');
			expect(response.body.data).toHaveProperty('email', 'test@example.com');
			expect(response.body.data).toHaveProperty('profile');
			expect(response.body.data).toHaveProperty('stats');
			expect(response.body.data).toHaveProperty('achievements');
		});

		it('should return 401 if user not found (auth middleware catches it first)', async () => {
			mockUserFindById(null);

			const response = await request(app)
				.get('/api/user/profile')
				.set('Authorization', `Bearer ${mockToken}`);

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('User not found');
		});

		// Property 1: Profile Data Display Consistency
		// Tag: Feature: profile-settings, Property 1: Profile Data Display Consistency
		// **Validates: Requirements 1.1**
		test('Property 1: Profile Data Display Consistency', async () => {
			await fc.assert(
				fc.asyncProperty(
					// Generate user data with profile information
					fc.record({
						_id: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
							s.split('').map(c => '0123456789abcdef'[c.charCodeAt(0) % 16]).join('')
						),
						name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
						email: fc.emailAddress(),
						profile: fc.record({
							phone: fc.option(fc.string({ minLength: 0, maxLength: 20 })),
							location: fc.option(fc.string({ minLength: 0, maxLength: 100 })),
							avatar: fc.option(fc.string())
						}),
						preferences: fc.record({
							notifications: fc.boolean(),
							dailyReminders: fc.boolean(),
							achievementAlerts: fc.boolean(),
							emailUpdates: fc.boolean()
						}),
						stats: fc.record({
							streak: fc.nat({ max: 365 }),
							totalSessions: fc.nat({ max: 1000 }),
							totalMinutes: fc.nat({ max: 10000 }),
							longestStreak: fc.nat({ max: 365 })
						}),
						achievements: fc.array(fc.record({
							name: fc.string({ minLength: 1, maxLength: 50 }),
							icon: fc.string({ minLength: 1, maxLength: 10 }),
							description: fc.option(fc.string({ minLength: 0, maxLength: 200 })),
							unlockedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime()))
						})),
						createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime()))
					}),
					async (userData) => {
						// Mock User.findById to return the generated user data
						mockUserFindById(userData);

						// Create a valid JWT token for the user
						const userToken = jwt.sign({ id: userData._id }, process.env.JWT_SECRET);

						const response = await request(app)
							.get('/api/user/profile')
							.set('Authorization', `Bearer ${userToken}`);

						// Property requirement 1: Should return successful response
						expect(response.status).toBe(200);
						expect(response.body.success).toBe(true);

						// Property requirement 2: All profile fields should be correctly displayed
						const responseData = response.body.data;
						
						// Core user fields must match exactly
						expect(responseData.name).toBe(userData.name);
						expect(responseData.email).toBe(userData.email);
						expect(responseData._id).toBe(userData._id);
						expect(responseData.createdAt).toBe(userData.createdAt.toISOString());

						// Profile fields should be present and match (with defaults if not provided)
						expect(responseData).toHaveProperty('profile');
						// Handle both null and empty string cases
						const expectedPhone = userData.profile.phone || null;
						const expectedLocation = userData.profile.location || null;
						const expectedAvatar = userData.profile.avatar || null;
						
						// API may return either null or empty string for missing values
						if (expectedPhone === null) {
							expect([null, ''].includes(responseData.profile.phone)).toBe(true);
						} else {
							expect(responseData.profile.phone).toBe(expectedPhone);
						}
						
						if (expectedLocation === null) {
							expect([null, ''].includes(responseData.profile.location)).toBe(true);
						} else {
							expect(responseData.profile.location).toBe(expectedLocation);
						}
						
						if (expectedAvatar === null) {
							expect([null, ''].includes(responseData.profile.avatar)).toBe(true);
						} else {
							expect(responseData.profile.avatar).toBe(expectedAvatar);
						}

						// Preferences should be present and match (with defaults if not provided)
						expect(responseData).toHaveProperty('preferences');
						expect(responseData.preferences.notifications).toBe(userData.preferences.notifications);
						expect(responseData.preferences.dailyReminders).toBe(userData.preferences.dailyReminders);
						expect(responseData.preferences.achievementAlerts).toBe(userData.preferences.achievementAlerts);
						expect(responseData.preferences.emailUpdates).toBe(userData.preferences.emailUpdates);

						// Stats should be present and match (with defaults if not provided)
						expect(responseData).toHaveProperty('stats');
						expect(responseData.stats.streak).toBe(userData.stats.streak);
						expect(responseData.stats.totalSessions).toBe(userData.stats.totalSessions);
						expect(responseData.stats.totalMinutes).toBe(userData.stats.totalMinutes);
						expect(responseData.stats.longestStreak).toBe(userData.stats.longestStreak);

						// Achievements should be present and match
						expect(responseData).toHaveProperty('achievements');
						expect(Array.isArray(responseData.achievements)).toBe(true);
						expect(responseData.achievements).toHaveLength(userData.achievements.length);
						
						// Verify each achievement matches
						userData.achievements.forEach((achievement, index) => {
							expect(responseData.achievements[index].name).toBe(achievement.name);
							expect(responseData.achievements[index].icon).toBe(achievement.icon);
							expect(responseData.achievements[index].description).toBe(achievement.description);
						});

						// Property requirement 3: Response should not contain sensitive data
						expect(responseData).not.toHaveProperty('password');
					}
				),
				{ numRuns: 100 }
			);
		});
	});

	describe('PUT /api/user/profile', () => {
		it('should update user profile successfully', async () => {
			const updatedUser = { ...mockUser, name: 'Updated User' };
			
			// Create a user object with save method
			const userWithSave = {
				...mockUser,
				save: jest.fn().mockResolvedValue(updatedUser)
			};
			
			// Mock for authentication middleware - returns user for .select()
			// Mock for route handler - returns user with save method
			User.findById = jest.fn((id) => {
				// Create a promise that resolves to the user with save method
				const promise = Promise.resolve(userWithSave);
				// Add select method for auth middleware
				promise.select = jest.fn().mockResolvedValue(mockUser);
				return promise;
			});
			
			// Mock findOne to check for duplicate email
			User.findOne = jest.fn().mockResolvedValue(null);

			const updateData = {
				name: 'Updated User',
				email: 'updated@example.com',
				profile: {
					phone: '+9876543210',
					location: 'Updated City'
				}
			};

			const response = await request(app)
				.put('/api/user/profile')
				.set('Authorization', `Bearer ${mockToken}`)
				.send(updateData);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe('Profile updated successfully');
		});

		it('should return validation errors for invalid data', async () => {
			// Mock user for authentication
			mockUserForUpdate(mockUser);

			const response = await request(app)
				.put('/api/user/profile')
				.set('Authorization', `Bearer ${mockToken}`)
				.send({
					name: '', // Empty name
					email: 'invalid-email' // Invalid email format
				});

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Validation error');
			expect(response.body.errors).toHaveProperty('name');
			expect(response.body.errors).toHaveProperty('email');
		});

		// Property 4: Input Validation Error Handling
		// Tag: Feature: profile-settings, Property 4: Input Validation Error Handling
		// **Validates: Requirements 1.5, 6.4**
		test('Property 4: Input Validation Error Handling', async () => {
			await fc.assert(
				fc.asyncProperty(
					// Generate invalid profile data that should trigger validation errors
					fc.oneof(
						// Invalid name cases
						fc.record({
							name: fc.oneof(
								fc.constant(''), // Empty string
								fc.constant('   '), // Whitespace only
								fc.string({ minLength: 51, maxLength: 100 }) // Too long
							),
							email: fc.emailAddress() // Valid email to isolate name validation
						}),
						// Invalid email cases
						fc.record({
							name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), // Valid name
							email: fc.oneof(
								fc.constant(''), // Empty email
								fc.constant('invalid-email'), // No @ symbol
								fc.constant('invalid@'), // Missing domain
								fc.constant('@invalid.com'), // Missing local part
								fc.constant('invalid.email'), // Missing @ symbol
								fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@')) // Random string without @
							)
						}),
						// Invalid profile fields
						fc.record({
							name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), // Valid name
							email: fc.emailAddress(), // Valid email
							profile: fc.record({
								phone: fc.string({ minLength: 21, maxLength: 50 }), // Too long phone
								location: fc.string({ minLength: 101, maxLength: 200 }) // Too long location
							})
						})
					),
					async (invalidData) => {
						// Mock user exists for authentication and update operations
						mockUserForUpdate({
							...mockUser,
							save: () => Promise.resolve(mockUser)
						});

						// Create a valid JWT token for authentication
						const validToken = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET);

						const response = await request(app)
							.put('/api/user/profile')
							.set('Authorization', `Bearer ${validToken}`)
							.send(invalidData);

						// Property requirement 1: System should reject invalid data
						expect(response.status).toBe(400);
						expect(response.body.success).toBe(false);
						expect(response.body.message).toBe('Validation error');

						// Property requirement 2: Should provide specific error messages
						expect(response.body.errors).toBeDefined();
						expect(typeof response.body.errors).toBe('object');
						expect(Object.keys(response.body.errors).length).toBeGreaterThan(0);

						// Property requirement 3: Error messages should be specific to invalid fields
						if (invalidData.name !== undefined) {
							const nameIsInvalid = !invalidData.name || 
								invalidData.name.trim().length === 0 || 
								invalidData.name.trim().length > 50;
							if (nameIsInvalid) {
								expect(response.body.errors).toHaveProperty('name');
								expect(typeof response.body.errors.name).toBe('string');
								expect(response.body.errors.name.length).toBeGreaterThan(0);
							}
						}

						if (invalidData.email !== undefined) {
							const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
							const emailIsInvalid = !invalidData.email || !emailRegex.test(invalidData.email);
							if (emailIsInvalid) {
								expect(response.body.errors).toHaveProperty('email');
								expect(typeof response.body.errors.email).toBe('string');
								expect(response.body.errors.email.length).toBeGreaterThan(0);
							}
						}

						if (invalidData.profile) {
							if (invalidData.profile.phone && invalidData.profile.phone.length > 20) {
								expect(response.body.errors).toHaveProperty('phone');
								expect(typeof response.body.errors.phone).toBe('string');
								expect(response.body.errors.phone.length).toBeGreaterThan(0);
							}
							if (invalidData.profile.location && invalidData.profile.location.length > 100) {
								expect(response.body.errors).toHaveProperty('location');
								expect(typeof response.body.errors.location).toBe('string');
								expect(response.body.errors.location.length).toBeGreaterThan(0);
							}
						}
					}
				),
				{ numRuns: 100 }
			);
		});
	});

	describe('PUT /api/user/preferences', () => {
		it('should update user preferences successfully', async () => {
			const updatedUser = { 
				...mockUser, 
				preferences: {
					notifications: false,
					dailyReminders: true,
					achievementAlerts: false,
					emailUpdates: true
				}
			};
			
			// Mock for authentication and update operations
			mockUserForUpdate({
				...mockUser,
				save: () => Promise.resolve(updatedUser)
			});

			const preferencesData = {
				notifications: false,
				dailyReminders: true,
				achievementAlerts: false,
				emailUpdates: true
			};

			const response = await request(app)
				.put('/api/user/preferences')
				.set('Authorization', `Bearer ${mockToken}`)
				.send(preferencesData);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe('Preferences updated successfully');
			expect(response.body.data).toEqual(preferencesData);
		});

		it('should return 401 if user not found (auth middleware catches it first)', async () => {
			// Mock User.findById to return null
			User.findById = jest.fn().mockResolvedValue(null);

			const response = await request(app)
				.put('/api/user/preferences')
				.set('Authorization', `Bearer ${mockToken}`)
				.send({ notifications: false });

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			// Auth middleware returns generic error message when user not found
			expect(response.body.message).toBe('Token is not valid');
		});

		// Property 6: Preference Toggle Persistence
		// Tag: Feature: profile-settings, Property 6: Preference Toggle Persistence
		// **Validates: Requirements 3.3**
		test('Property 6: Preference Toggle Persistence', async () => {
			await fc.assert(
				fc.asyncProperty(
					// Generate preference settings data
					fc.record({
						notifications: fc.boolean(),
						dailyReminders: fc.boolean(),
						achievementAlerts: fc.boolean(),
						emailUpdates: fc.boolean()
					}),
					async (preferencesData) => {
						// Create a user with initial preferences (opposite of what we'll set)
						const initialUser = {
							...mockUser,
							preferences: {
								notifications: !preferencesData.notifications,
								dailyReminders: !preferencesData.dailyReminders,
								achievementAlerts: !preferencesData.achievementAlerts,
								emailUpdates: !preferencesData.emailUpdates
							}
						};

						// Create updated user with new preferences
						const updatedUser = {
							...initialUser,
							preferences: preferencesData,
							save: jest.fn().mockResolvedValue({
								...initialUser,
								preferences: preferencesData
							})
						};

						// Mock User.findById for both authentication middleware and route handler
						User.findById = jest.fn((id) => {
							// For authentication middleware - return chainable mock
							const authMock = {
								select: jest.fn().mockResolvedValue(initialUser) // Return user for auth
							};
							
							// For route handler - return user with save method directly
							const routeMock = Promise.resolve(updatedUser);
							
							// Add select method to the promise for auth middleware compatibility
							routeMock.select = jest.fn().mockResolvedValue(initialUser);
							
							return routeMock;
						});

						// Create a valid JWT token for authentication
						const validToken = jwt.sign({ id: initialUser._id }, process.env.JWT_SECRET);

						// Make the preference update request
						const response = await request(app)
							.put('/api/user/preferences')
							.set('Authorization', `Bearer ${validToken}`)
							.send(preferencesData);

						// Property requirement 1: Update should be successful
						expect(response.status).toBe(200);
						expect(response.body.success).toBe(true);
						expect(response.body.message).toBe('Preferences updated successfully');

						// Property requirement 2: Response should contain the updated preferences
						expect(response.body.data).toBeDefined();
						expect(response.body.data.notifications).toBe(preferencesData.notifications);
						expect(response.body.data.dailyReminders).toBe(preferencesData.dailyReminders);
						expect(response.body.data.achievementAlerts).toBe(preferencesData.achievementAlerts);
						expect(response.body.data.emailUpdates).toBe(preferencesData.emailUpdates);

						// Property requirement 3: Save method should be called to persist changes
						expect(updatedUser.save).toHaveBeenCalled();

						// Property requirement 4: All preference fields should be properly converted to boolean
						Object.keys(preferencesData).forEach(key => {
							expect(typeof response.body.data[key]).toBe('boolean');
						});
					}
				),
				{ numRuns: 100 }
			);
		});
	});

	// Property 11: Authentication Protection
	// Tag: Feature: profile-settings, Property 11: Authentication Protection
	// **Validates: Requirements 6.1, 6.2**
	describe('Property 11: Authentication Protection', () => {
		test('All profile endpoints should require JWT authentication', async () => {
			await fc.assert(
				fc.asyncProperty(
					// Generate different types of invalid/missing authentication scenarios
					fc.oneof(
						fc.constant(null), // No token at all
						fc.constant(''), // Empty token
						fc.constant('invalid-token'), // Invalid token format
						fc.constant('Bearer '), // Bearer with no token
						fc.string({ minLength: 1, maxLength: 50 }).filter(s => s !== mockToken), // Random invalid token
						fc.constant('InvalidPrefix ' + mockToken) // Wrong prefix
					),
					async (invalidAuth) => {
						// Test all profile endpoints with invalid/missing authentication
						const endpoints = [
							{ method: 'get', path: '/api/user/profile', body: null },
							{ method: 'put', path: '/api/user/profile', body: { name: 'Test' } },
							{ method: 'put', path: '/api/user/preferences', body: { notifications: true } },
							{ method: 'put', path: '/api/user/change-password', body: { 
								currentPassword: 'test123', 
								newPassword: 'test456', 
								confirmPassword: 'test456' 
							}}
						];

						for (const endpoint of endpoints) {
							// Build request
							let req = request(app)[endpoint.method](endpoint.path);
							
							// Add invalid/missing authentication header
							if (invalidAuth !== null) {
								if (invalidAuth.startsWith('Bearer ') || invalidAuth.startsWith('InvalidPrefix ')) {
									req = req.set('Authorization', invalidAuth);
								} else if (invalidAuth !== '') {
									req = req.set('Authorization', `Bearer ${invalidAuth}`);
								}
								// If invalidAuth is empty string, don't set Authorization header at all
							}
							// If invalidAuth is null, don't set Authorization header at all
							
							// Add body for PUT requests
							if (endpoint.body) {
								req = req.send(endpoint.body);
							}
							
							const response = await req;

							// Property requirement 1: All endpoints should verify JWT authentication
							// Property requirement 2: Unauthenticated requests should return 401
							expect(response.status).toBe(401);
							expect(response.body.success).toBe(false);
							
							// Property requirement 3: Error message should indicate authentication failure
							expect(response.body.message).toBeDefined();
							expect(typeof response.body.message).toBe('string');
							expect(response.body.message.length).toBeGreaterThan(0);
							
							// Common authentication error messages
							const validAuthErrorMessages = [
								'Not authorized, token missing',
								'Token is not valid',
								'User not found',
								'Not authorized'
							];
							
							expect(validAuthErrorMessages.some(msg => 
								response.body.message.includes(msg) || 
								response.body.message.toLowerCase().includes('token') ||
								response.body.message.toLowerCase().includes('authorized') ||
								response.body.message.toLowerCase().includes('auth')
							)).toBe(true);
							
							// Property requirement 4: Response should not contain sensitive data
							expect(response.body).not.toHaveProperty('password');
							expect(response.body).not.toHaveProperty('token');
							
							// Property requirement 5: Response structure should be consistent
							expect(response.body).toHaveProperty('success');
							expect(response.body).toHaveProperty('message');
							expect(typeof response.body.success).toBe('boolean');
							expect(response.body.success).toBe(false);
						}
					}
				),
				{ numRuns: 100 }
			);
		});

		test('Valid JWT tokens should allow access to protected endpoints', async () => {
			await fc.assert(
				fc.asyncProperty(
					// Generate valid user data
					fc.record({
						_id: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
							s.split('').map(c => '0123456789abcdef'[c.charCodeAt(0) % 16]).join('')
						),
						name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
						email: fc.emailAddress()
					}),
					async (userData) => {
						// Create a valid JWT token for the user
						const validToken = jwt.sign({ id: userData._id }, process.env.JWT_SECRET);
						
						// Mock user for authentication
						mockUserFindById({
							...mockUser,
							_id: userData._id,
							name: userData.name,
							email: userData.email
						});

						// Test GET /api/user/profile with valid token
						const response = await request(app)
							.get('/api/user/profile')
							.set('Authorization', `Bearer ${validToken}`);

						// Property requirement 6: Valid authentication should allow access
						expect(response.status).not.toBe(401);
						
						// Should either succeed (200) or fail for other reasons (404, 500)
						// but NOT for authentication (401)
						expect([200, 404, 500]).toContain(response.status);
						
						// If successful, should have proper response structure
						if (response.status === 200) {
							expect(response.body.success).toBe(true);
							expect(response.body.data).toBeDefined();
						}
					}
				),
				{ numRuns: 100 }
			);
		});
	});

	// Property 12: Data Access Security
	// Tag: Feature: profile-settings, Property 12: Data Access Security
	// **Validates: Requirements 6.3**
	describe('Property 12: Data Access Security', () => {
		test('Authenticated users should only access their own data', async () => {
			await fc.assert(
				fc.asyncProperty(
					// Generate two different users to test data isolation
					fc.tuple(
						fc.record({
							_id: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
								s.split('').map(c => '0123456789abcdef'[c.charCodeAt(0) % 16]).join('')
							),
							name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
							email: fc.emailAddress(),
							profile: fc.record({
								phone: fc.option(fc.string({ minLength: 0, maxLength: 20 })),
								location: fc.option(fc.string({ minLength: 0, maxLength: 100 })),
								avatar: fc.option(fc.string())
							}),
							preferences: fc.record({
								notifications: fc.boolean(),
								dailyReminders: fc.boolean(),
								achievementAlerts: fc.boolean(),
								emailUpdates: fc.boolean()
							}),
							stats: fc.record({
								streak: fc.nat({ max: 365 }),
								totalSessions: fc.nat({ max: 1000 }),
								totalMinutes: fc.nat({ max: 10000 }),
								longestStreak: fc.nat({ max: 365 })
							}),
							achievements: fc.array(fc.record({
								name: fc.string({ minLength: 1, maxLength: 50 }),
								icon: fc.string({ minLength: 1, maxLength: 10 }),
								description: fc.option(fc.string({ minLength: 0, maxLength: 200 })),
								unlockedAt: fc.date()
							})),
							createdAt: fc.date()
						}),
						fc.record({
							_id: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
								s.split('').map(c => '0123456789abcdef'[c.charCodeAt(0) % 16]).join('')
							),
							name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
							email: fc.emailAddress(),
							profile: fc.record({
								phone: fc.option(fc.string({ minLength: 0, maxLength: 20 })),
								location: fc.option(fc.string({ minLength: 0, maxLength: 100 })),
								avatar: fc.option(fc.string())
							}),
							preferences: fc.record({
								notifications: fc.boolean(),
								dailyReminders: fc.boolean(),
								achievementAlerts: fc.boolean(),
								emailUpdates: fc.boolean()
							}),
							stats: fc.record({
								streak: fc.nat({ max: 365 }),
								totalSessions: fc.nat({ max: 1000 }),
								totalMinutes: fc.nat({ max: 10000 }),
								longestStreak: fc.nat({ max: 365 })
							}),
							achievements: fc.array(fc.record({
								name: fc.string({ minLength: 1, maxLength: 50 }),
								icon: fc.string({ minLength: 1, maxLength: 10 }),
								description: fc.option(fc.string({ minLength: 0, maxLength: 200 })),
								unlockedAt: fc.date()
							})),
							createdAt: fc.date()
						})
					).filter(([user1, user2]) => user1._id !== user2._id), // Ensure different users
					async ([user1, user2]) => {
						// Create JWT token for user1
						const user1Token = jwt.sign({ id: user1._id }, process.env.JWT_SECRET);

						// Mock User.findById to return the correct user based on the ID in the token
						// The auth middleware extracts the user ID from the token and calls findById
						User.findById = jest.fn((id) => {
							// For auth middleware - return user1 when user1's ID is requested
							const authMock = {
								select: jest.fn().mockResolvedValue(id === user1._id ? user1 : user2)
							};
							return authMock;
						});

						// Test GET /api/user/profile with user1's token
						const response = await request(app)
							.get('/api/user/profile')
							.set('Authorization', `Bearer ${user1Token}`);

						// Property requirement 1: Request should succeed for authenticated user
						expect(response.status).toBe(200);
						expect(response.body.success).toBe(true);

						// Property requirement 2: Response should contain ONLY user1's data
						expect(response.body.data._id).toBe(user1._id);
						expect(response.body.data.name).toBe(user1.name);
						expect(response.body.data.email).toBe(user1.email);

						// Property requirement 3: Response should NOT contain user2's data
						expect(response.body.data._id).not.toBe(user2._id);
						expect(response.body.data.name).not.toBe(user2.name);
						expect(response.body.data.email).not.toBe(user2.email);

						// Property requirement 4: Profile data should match user1's profile
						if (user1.profile.phone) {
							expect([user1.profile.phone, null, ''].includes(response.body.data.profile.phone)).toBe(true);
						}
						if (user1.profile.location) {
							expect([user1.profile.location, null, ''].includes(response.body.data.profile.location)).toBe(true);
						}

						// Property requirement 5: Preferences should match user1's preferences
						expect(response.body.data.preferences.notifications).toBe(user1.preferences.notifications);
						expect(response.body.data.preferences.dailyReminders).toBe(user1.preferences.dailyReminders);
						expect(response.body.data.preferences.achievementAlerts).toBe(user1.preferences.achievementAlerts);
						expect(response.body.data.preferences.emailUpdates).toBe(user1.preferences.emailUpdates);

						// Property requirement 6: Stats should match user1's stats
						expect(response.body.data.stats.streak).toBe(user1.stats.streak);
						expect(response.body.data.stats.totalSessions).toBe(user1.stats.totalSessions);
						expect(response.body.data.stats.totalMinutes).toBe(user1.stats.totalMinutes);
						expect(response.body.data.stats.longestStreak).toBe(user1.stats.longestStreak);

						// Property requirement 7: Response should not expose other users' information
						// Verify that none of user2's unique data appears in the response
						const responseString = JSON.stringify(response.body);
						
						// Only check for user2's unique identifiers that wouldn't naturally appear in user1's data
						// We can't check for common values like booleans or small numbers
						if (user2.email !== user1.email) {
							expect(responseString.includes(user2.email)).toBe(false);
						}
						
						// Check that user2's ID doesn't appear anywhere in the response
						expect(responseString.includes(user2._id)).toBe(false);
					}
				),
				{ numRuns: 100 }
			);
		});

		test('Users cannot access other users data through profile updates', async () => {
			await fc.assert(
				fc.asyncProperty(
					// Generate two different users
					fc.tuple(
						fc.record({
							_id: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
								s.split('').map(c => '0123456789abcdef'[c.charCodeAt(0) % 16]).join('')
							),
							name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
							email: fc.emailAddress()
						}),
						fc.record({
							_id: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
								s.split('').map(c => '0123456789abcdef'[c.charCodeAt(0) % 16]).join('')
							),
							name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
							email: fc.emailAddress()
						})
					).filter(([user1, user2]) => user1._id !== user2._id && user1.email !== user2.email),
					async ([user1, user2]) => {
						// Create JWT token for user1
						const user1Token = jwt.sign({ id: user1._id }, process.env.JWT_SECRET);

						// Create user1 object with save method
						const user1WithSave = {
							...mockUser,
							_id: user1._id,
							name: user1.name,
							email: user1.email,
							save: jest.fn().mockResolvedValue({
								...mockUser,
								_id: user1._id,
								name: 'Updated Name',
								email: user1.email
							})
						};

						// Mock User.findById to return user1 for authentication and updates
						User.findById = jest.fn((id) => {
							// For auth middleware
							const authMock = {
								select: jest.fn().mockResolvedValue(id === user1._id ? user1 : null)
							};
							
							// For route handler
							const routeMock = Promise.resolve(id === user1._id ? user1WithSave : null);
							routeMock.select = jest.fn().mockResolvedValue(id === user1._id ? user1 : null);
							
							return routeMock;
						});

						// Mock findOne to check for duplicate emails
						User.findOne = jest.fn().mockResolvedValue(null);

						// Attempt to update profile with user1's token
						const updateData = {
							name: 'Updated Name',
							email: user1.email // Keep user1's email
						};

						const response = await request(app)
							.put('/api/user/profile')
							.set('Authorization', `Bearer ${user1Token}`)
							.send(updateData);

						// Property requirement 1: Update should succeed for authenticated user
						expect(response.status).toBe(200);
						expect(response.body.success).toBe(true);

						// Property requirement 2: Save should be called on user1's object only
						expect(user1WithSave.save).toHaveBeenCalled();

						// Property requirement 3: The system should only update user1's data
						// Verify that User.findById was called with user1's ID (from token)
						expect(User.findById).toHaveBeenCalled();
						
						// Get the ID that was used in findById calls
						const findByIdCalls = User.findById.mock.calls;
						const idsUsed = findByIdCalls.map(call => call[0]);
						
						// Property requirement 4: user2's ID should never be used in any database query
						expect(idsUsed.includes(user2._id)).toBe(false);
						
						// Property requirement 5: Response should not contain user2's data
						const responseString = JSON.stringify(response.body);
						expect(responseString.includes(user2._id)).toBe(false);
						if (user2.email !== user1.email) {
							expect(responseString.includes(user2.email)).toBe(false);
						}
					}
				),
				{ numRuns: 100 }
			);
		});
	});

	// Property 13: Response Data Sanitization
	// Tag: Feature: profile-settings, Property 13: Response Data Sanitization
	// **Validates: Requirements 6.5**
	describe('Property 13: Response Data Sanitization', () => {
		test('All profile API responses should not contain sensitive information', async () => {
			await fc.assert(
				fc.asyncProperty(
					// Generate user data with all fields including sensitive ones
					fc.record({
						_id: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
							s.split('').map(c => '0123456789abcdef'[c.charCodeAt(0) % 16]).join('')
						),
						name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
						email: fc.emailAddress(),
						password: fc.string({ minLength: 6, maxLength: 50 }), // Sensitive field
						profile: fc.record({
							phone: fc.option(fc.string({ minLength: 0, maxLength: 20 })),
							location: fc.option(fc.string({ minLength: 0, maxLength: 100 })),
							avatar: fc.option(fc.string())
						}),
						preferences: fc.record({
							notifications: fc.boolean(),
							dailyReminders: fc.boolean(),
							achievementAlerts: fc.boolean(),
							emailUpdates: fc.boolean()
						}),
						stats: fc.record({
							streak: fc.nat({ max: 365 }),
							totalSessions: fc.nat({ max: 1000 }),
							totalMinutes: fc.nat({ max: 10000 }),
							longestStreak: fc.nat({ max: 365 })
						}),
						achievements: fc.array(fc.record({
							name: fc.string({ minLength: 1, maxLength: 50 }),
							icon: fc.string({ minLength: 1, maxLength: 10 }),
							description: fc.option(fc.string({ minLength: 0, maxLength: 200 })),
							unlockedAt: fc.date()
						})),
						createdAt: fc.date(),
						__v: fc.nat({ max: 100 }), // Internal MongoDB version field
						updatedAt: fc.date() // Internal timestamp
					}),
					async (userData) => {
						// Create a valid JWT token for the user
						const userToken = jwt.sign({ id: userData._id }, process.env.JWT_SECRET);

						// Test all profile endpoints that return user data
						const endpoints = [
							{
								method: 'get',
								path: '/api/user/profile',
								body: null,
								mockSetup: () => {
									mockUserFindById(userData);
								}
							},
							{
								method: 'put',
								path: '/api/user/profile',
								body: { 
									name: fc.sample(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), 1)[0],
									email: fc.sample(fc.emailAddress(), 1)[0]
								},
								mockSetup: () => {
									const userWithSave = {
										...userData,
										save: jest.fn().mockResolvedValue(userData)
									};
									User.findById = jest.fn((id) => {
										const promise = Promise.resolve(userWithSave);
										promise.select = jest.fn().mockResolvedValue(userData);
										return promise;
									});
									User.findOne = jest.fn().mockResolvedValue(null);
								}
							},
							{
								method: 'put',
								path: '/api/user/preferences',
								body: {
									notifications: fc.sample(fc.boolean(), 1)[0],
									dailyReminders: fc.sample(fc.boolean(), 1)[0]
								},
								mockSetup: () => {
									const userWithSave = {
										...userData,
										save: jest.fn().mockResolvedValue(userData)
									};
									User.findById = jest.fn((id) => {
										const promise = Promise.resolve(userWithSave);
										promise.select = jest.fn().mockResolvedValue(userData);
										return promise;
									});
								}
							}
						];

						for (const endpoint of endpoints) {
							// Setup mocks for this endpoint
							endpoint.mockSetup();

							// Build request
							let req = request(app)[endpoint.method](endpoint.path)
								.set('Authorization', `Bearer ${userToken}`);
							
							// Add body for PUT requests
							if (endpoint.body) {
								req = req.send(endpoint.body);
							}
							
							const response = await req;

							// Property requirement 1: Response should not contain password field
							expect(response.body).not.toHaveProperty('password');
							if (response.body.data) {
								expect(response.body.data).not.toHaveProperty('password');
							}

							// Property requirement 2: Response should not contain password hash
							const responseString = JSON.stringify(response.body);
							if (userData.password) {
								// Check that the actual password value doesn't appear in response
								expect(responseString.includes(userData.password)).toBe(false);
							}

							// Property requirement 3: Response should not contain internal MongoDB fields
							if (response.body.data) {
								expect(response.body.data).not.toHaveProperty('__v');
								expect(response.body.data).not.toHaveProperty('updatedAt');
							}

							// Property requirement 4: Response should not contain JWT tokens
							expect(response.body).not.toHaveProperty('token');
							if (response.body.data) {
								expect(response.body.data).not.toHaveProperty('token');
							}

							// Property requirement 5: If response is successful, it should have clean structure
							if (response.status === 200) {
								expect(response.body).toHaveProperty('success');
								expect(response.body.success).toBe(true);
								
								// Check that only expected fields are present in the response
								const allowedTopLevelFields = ['success', 'message', 'data'];
								const actualTopLevelFields = Object.keys(response.body);
								actualTopLevelFields.forEach(field => {
									expect(allowedTopLevelFields.includes(field)).toBe(true);
								});

								// If data is present, check it doesn't contain sensitive fields
								if (response.body.data) {
									const allowedDataFields = [
										'_id', 'name', 'email', 'profile', 'preferences', 
										'stats', 'achievements', 'createdAt', 
										'notifications', 'dailyReminders', 'achievementAlerts', 'emailUpdates'
									];
									const sensitiveFields = ['password', '__v', 'updatedAt', 'token', 'salt'];
									
									const dataString = JSON.stringify(response.body.data);
									sensitiveFields.forEach(sensitiveField => {
										// Check that sensitive field names don't appear as keys
										const fieldPattern = new RegExp(`"${sensitiveField}"\\s*:`, 'i');
										expect(fieldPattern.test(dataString)).toBe(false);
									});
								}
							}

							// Property requirement 6: Error responses should also not leak sensitive data
							if (response.status >= 400) {
								expect(response.body).not.toHaveProperty('password');
								expect(response.body).not.toHaveProperty('token');
								expect(response.body).not.toHaveProperty('__v');
								
								// Error responses should have consistent structure
								expect(response.body).toHaveProperty('success');
								expect(response.body.success).toBe(false);
								expect(response.body).toHaveProperty('message');
							}
						}
					}
				),
				{ numRuns: 100 }
			);
		});

		test('Password change responses should never contain password data', async () => {
			await fc.assert(
				fc.asyncProperty(
					// Generate password change scenarios
					fc.record({
						currentPassword: fc.string({ minLength: 6, maxLength: 50 }),
						newPassword: fc.string({ minLength: 6, maxLength: 50 }),
						isCurrentPasswordCorrect: fc.boolean()
					}),
					async (passwordData) => {
						// Create a user with comparePassword method
						const userWithPassword = {
							...mockUser,
							password: 'hashed-password-value', // Simulated hash
							comparePassword: jest.fn().mockResolvedValue(passwordData.isCurrentPasswordCorrect),
							save: jest.fn().mockResolvedValue(mockUser)
						};

						// Mock User.findById with password selection
						User.findById = jest.fn(() => ({
							select: jest.fn().mockResolvedValue(userWithPassword)
						}));

						// Create a valid JWT token for authentication
						const validToken = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET);

						// Prepare request data
						const requestData = {
							currentPassword: passwordData.currentPassword,
							newPassword: passwordData.newPassword,
							confirmPassword: passwordData.newPassword
						};

						const response = await request(app)
							.put('/api/user/change-password')
							.set('Authorization', `Bearer ${validToken}`)
							.send(requestData);

						// Property requirement 1: Response should never contain password field
						expect(response.body).not.toHaveProperty('password');
						expect(response.body).not.toHaveProperty('data');

						// Property requirement 2: Response should not contain any password values
						const responseString = JSON.stringify(response.body);
						expect(responseString.includes(passwordData.currentPassword)).toBe(false);
						expect(responseString.includes(passwordData.newPassword)).toBe(false);
						expect(responseString.includes('hashed-password-value')).toBe(false);

						// Property requirement 3: Response should not contain user object with sensitive data
						expect(response.body).not.toHaveProperty('user');
						
						// Property requirement 4: Response structure should be clean
						const allowedFields = ['success', 'message', 'errors'];
						const actualFields = Object.keys(response.body);
						actualFields.forEach(field => {
							expect(allowedFields.includes(field)).toBe(true);
						});

						// Property requirement 5: Success or error, structure should be consistent
						expect(response.body).toHaveProperty('success');
						expect(response.body).toHaveProperty('message');
						expect(typeof response.body.success).toBe('boolean');
						expect(typeof response.body.message).toBe('string');

						// Property requirement 6: Error messages should not reveal password details
						if (response.body.errors) {
							const errorsString = JSON.stringify(response.body.errors);
							expect(errorsString.includes(passwordData.currentPassword)).toBe(false);
							expect(errorsString.includes(passwordData.newPassword)).toBe(false);
						}
					}
				),
				{ numRuns: 100 }
			);
		});
	});

	describe('PUT /api/user/change-password', () => {
		it('should change password successfully with valid current password', async () => {
			const userWithPassword = {
				...mockUser,
				comparePassword: jest.fn().mockResolvedValue(true), // Current password is correct
				save: jest.fn().mockResolvedValue(mockUser)
			};

			// Mock User.findById with password selection
			User.findById = jest.fn(() => ({
				select: jest.fn().mockResolvedValue(userWithPassword)
			}));

			const passwordData = {
				currentPassword: 'currentpass123',
				newPassword: 'newpass123',
				confirmPassword: 'newpass123'
			};

			const response = await request(app)
				.put('/api/user/change-password')
				.set('Authorization', `Bearer ${mockToken}`)
				.send(passwordData);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe('Password changed successfully');
			expect(userWithPassword.comparePassword).toHaveBeenCalledWith('currentpass123');
			expect(userWithPassword.save).toHaveBeenCalled();
		});

		it('should return 401 for incorrect current password', async () => {
			const userWithPassword = {
				...mockUser,
				comparePassword: jest.fn().mockResolvedValue(false), // Current password is incorrect
				save: jest.fn().mockResolvedValue(mockUser)
			};

			// Mock User.findById with password selection
			User.findById = jest.fn(() => ({
				select: jest.fn().mockResolvedValue(userWithPassword)
			}));

			const passwordData = {
				currentPassword: 'wrongpassword',
				newPassword: 'newpass123',
				confirmPassword: 'newpass123'
			};

			const response = await request(app)
				.put('/api/user/change-password')
				.set('Authorization', `Bearer ${mockToken}`)
				.send(passwordData);

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Current password is incorrect');
			expect(response.body.errors).toHaveProperty('currentPassword');
		});

		it('should return validation errors for invalid password data', async () => {
			const response = await request(app)
				.put('/api/user/change-password')
				.set('Authorization', `Bearer ${mockToken}`)
				.send({
					currentPassword: '', // Empty current password
					newPassword: '123', // Too short
					confirmPassword: '456' // Doesn't match
				});

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Validation error');
			expect(response.body.errors).toHaveProperty('currentPassword');
			expect(response.body.errors).toHaveProperty('newPassword');
			expect(response.body.errors).toHaveProperty('confirmPassword');
		});

		// Property 8: Password Change Security
		// Tag: Feature: profile-settings, Property 8: Password Change Security
		// **Validates: Requirements 4.2, 4.3**
		test('Property 8: Password Change Security', async () => {
			await fc.assert(
				fc.asyncProperty(
					// Generate password data with both correct and incorrect current passwords
					fc.record({
						currentPassword: fc.string({ minLength: 6, maxLength: 50 }),
						newPassword: fc.string({ minLength: 6, maxLength: 50 }),
						isCurrentPasswordCorrect: fc.boolean()
					}),
					async (passwordData) => {
						// Create a user with comparePassword method
						const userWithPassword = {
							...mockUser,
							comparePassword: jest.fn().mockResolvedValue(passwordData.isCurrentPasswordCorrect),
							save: jest.fn().mockResolvedValue(mockUser)
						};

						// Mock User.findById with password selection
						User.findById = jest.fn(() => ({
							select: jest.fn().mockResolvedValue(userWithPassword)
						}));

						// Create a valid JWT token for authentication
						const validToken = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET);

						// Prepare request data with matching confirm password
						const requestData = {
							currentPassword: passwordData.currentPassword,
							newPassword: passwordData.newPassword,
							confirmPassword: passwordData.newPassword // Always match for this test
						};

						const response = await request(app)
							.put('/api/user/change-password')
							.set('Authorization', `Bearer ${validToken}`)
							.send(requestData);

						// Property requirement 1: System should verify current password using bcrypt
						expect(userWithPassword.comparePassword).toHaveBeenCalledWith(passwordData.currentPassword);

						if (passwordData.isCurrentPasswordCorrect) {
							// Property requirement 2: When current password is correct, change should succeed
							expect(response.status).toBe(200);
							expect(response.body.success).toBe(true);
							expect(response.body.message).toBe('Password changed successfully');
							
							// Property requirement 3: New password should be saved (hashed by pre-save middleware)
							expect(userWithPassword.save).toHaveBeenCalled();
							
							// Property requirement 4: Response should not contain sensitive data
							expect(response.body).not.toHaveProperty('password');
							expect(response.body).not.toHaveProperty('data');
						} else {
							// Property requirement 5: When current password is incorrect, change should be rejected
							expect(response.status).toBe(401);
							expect(response.body.success).toBe(false);
							expect(response.body.message).toBe('Current password is incorrect');
							
							// Property requirement 6: Should provide specific error for current password
							expect(response.body.errors).toHaveProperty('currentPassword');
							expect(response.body.errors.currentPassword).toBe('Current password is incorrect');
							
							// Property requirement 7: Save should not be called when current password is wrong
							expect(userWithPassword.save).not.toHaveBeenCalled();
						}

						// Property requirement 8: Response should always be structured correctly
						expect(response.body).toHaveProperty('success');
						expect(response.body).toHaveProperty('message');
						expect(typeof response.body.success).toBe('boolean');
						expect(typeof response.body.message).toBe('string');
					}
				),
				{ numRuns: 100 }
			);
		});

		// Property 9: Password Change Process
		// Tag: Feature: profile-settings, Property 9: Password Change Process
		// **Validates: Requirements 4.4, 4.5**
		test('Property 9: Password Change Process', async () => {
			await fc.assert(
				fc.asyncProperty(
					// Generate valid password change data (only successful cases)
					fc.record({
						currentPassword: fc.string({ minLength: 6, maxLength: 50 }),
						newPassword: fc.string({ minLength: 6, maxLength: 50 })
					}),
					async (passwordData) => {
						// Track if password was updated and what the new password is
						let updatedPassword = null;
						
						// Create a user with comparePassword method that always returns true (correct password)
						const userWithPassword = {
							...mockUser,
							password: 'old-hashed-password',
							comparePassword: jest.fn().mockResolvedValue(true), // Current password is always correct
							save: jest.fn(async function() {
								// Capture the new password when save is called
								updatedPassword = this.password;
								return this;
							}),
							isModified: jest.fn((field) => field === 'password')
						};

						// Mock User.findById with password selection for both auth and route
						User.findById = jest.fn(() => {
							// For auth middleware
							const authMock = {
								select: jest.fn().mockResolvedValue(mockUser)
							};
							
							// For route handler - return user with password
							const routeMock = Promise.resolve(userWithPassword);
							routeMock.select = jest.fn().mockResolvedValue(userWithPassword);
							
							return routeMock;
						});

						// Create a valid JWT token for authentication
						const validToken = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET);

						// Prepare request data with matching confirm password
						const requestData = {
							currentPassword: passwordData.currentPassword,
							newPassword: passwordData.newPassword,
							confirmPassword: passwordData.newPassword
						};

						const response = await request(app)
							.put('/api/user/change-password')
							.set('Authorization', `Bearer ${validToken}`)
							.send(requestData);

						// Property requirement 1: With correct current password, change should succeed
						expect(response.status).toBe(200);
						expect(response.body.success).toBe(true);
						expect(response.body.message).toBe('Password changed successfully');

						// Property requirement 2: Current password should be verified
						expect(userWithPassword.comparePassword).toHaveBeenCalledWith(passwordData.currentPassword);

						// Property requirement 3: New password should be assigned to user object
						expect(userWithPassword.password).toBe(passwordData.newPassword);

						// Property requirement 4: Save method should be called to persist the change
						expect(userWithPassword.save).toHaveBeenCalled();

						// Property requirement 5: The password field should have been modified
						// (In real implementation, the pre-save hook would hash it)
						expect(updatedPassword).toBe(passwordData.newPassword);

						// Property requirement 6: UI should receive success feedback
						expect(response.body).toHaveProperty('success', true);
						expect(response.body).toHaveProperty('message');
						expect(response.body.message).toBe('Password changed successfully');

						// Property requirement 7: Response should not contain sensitive data
						expect(response.body).not.toHaveProperty('password');
						expect(response.body).not.toHaveProperty('data');
						expect(response.body).not.toHaveProperty('user');

						// Property requirement 8: Response structure should be consistent
						expect(typeof response.body.success).toBe('boolean');
						expect(typeof response.body.message).toBe('string');
					}
				),
				{ numRuns: 100 }
			);
		});
	});
});