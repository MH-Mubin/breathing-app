import * as fc from 'fast-check';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../../models/User.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Model Extensions', () => {
  test('should create user with default profile and preferences', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    await user.save();

    expect(user.profile).toBeDefined();
    expect(user.profile.phone).toBeUndefined();
    expect(user.profile.location).toBeUndefined();
    expect(user.profile.avatar).toBe('');

    expect(user.preferences).toBeDefined();
    expect(user.preferences.notifications).toBe(true);
    expect(user.preferences.dailyReminders).toBe(true);
    expect(user.preferences.achievementAlerts).toBe(true);
    expect(user.preferences.emailUpdates).toBe(false);
  });

  test('should save user with profile information', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      profile: {
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        avatar: 'avatar-url'
      }
    };

    const user = new User(userData);
    await user.save();

    expect(user.profile.phone).toBe('+1 (555) 123-4567');
    expect(user.profile.location).toBe('San Francisco, CA');
    expect(user.profile.avatar).toBe('avatar-url');
  });

  test('should save user with custom preferences', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      preferences: {
        notifications: false,
        dailyReminders: false,
        achievementAlerts: false,
        emailUpdates: true
      }
    };

    const user = new User(userData);
    await user.save();

    expect(user.preferences.notifications).toBe(false);
    expect(user.preferences.dailyReminders).toBe(false);
    expect(user.preferences.achievementAlerts).toBe(false);
    expect(user.preferences.emailUpdates).toBe(true);
  });

  test('should trim profile fields', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      profile: {
        phone: '  +1 (555) 123-4567  ',
        location: '  San Francisco, CA  '
      }
    };

    const user = new User(userData);
    await user.save();

    expect(user.profile.phone).toBe('+1 (555) 123-4567');
    expect(user.profile.location).toBe('San Francisco, CA');
  });

  test('should work with existing user functionality', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    await user.save();

    // Test existing functionality still works
    expect(user.stats.streak).toBe(0);
    expect(user.stats.totalSessions).toBe(0);
    expect(user.achievements).toEqual([]);

    // Test password hashing still works
    expect(user.password).not.toBe('password123');
    const isMatch = await user.comparePassword('password123');
    expect(isMatch).toBe(true);

    // Test streak update still works
    user.updateStreak();
    expect(user.stats.streak).toBe(1);
  });
});

describe('User Model Property-Based Tests', () => {
  test('Property 2: Profile Update Persistence', async () => {
    // Feature: profile-settings, Property 2: Profile Update Persistence
    // **Validates: Requirements 1.3, 8.1**
    
    // Ensure we have a clean database state for each property test run
    await User.deleteMany({});
    
    await fc.assert(fc.asyncProperty(
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        email: fc.emailAddress(),
        password: fc.string({ minLength: 6, maxLength: 100 }),
        profile: fc.record({
          phone: fc.option(fc.string({ maxLength: 20 })),
          location: fc.option(fc.string({ maxLength: 100 })),
          avatar: fc.option(fc.string({ maxLength: 200 }), { nil: undefined })
        }),
        preferences: fc.record({
          notifications: fc.boolean(),
          dailyReminders: fc.boolean(),
          achievementAlerts: fc.boolean(),
          emailUpdates: fc.boolean()
        })
      }),
      async (userData) => {
        // Clean up any existing users before this test run
        await User.deleteMany({});
        
        // Create and save user with profile and preferences data
        const user = new User(userData);
        await user.save();
        const userId = user._id;

        // Retrieve the user from database
        const savedUser = await User.findById(userId);
        
        // Verify profile data persistence (accounting for trim behavior)
        expect(savedUser.profile.phone).toBe(userData.profile.phone ? userData.profile.phone.trim() : userData.profile.phone);
        expect(savedUser.profile.location).toBe(userData.profile.location ? userData.profile.location.trim() : userData.profile.location);
        expect(savedUser.profile.avatar).toBe(userData.profile.avatar || '');
        
        // Verify preferences data persistence
        expect(savedUser.preferences.notifications).toBe(userData.preferences.notifications);
        expect(savedUser.preferences.dailyReminders).toBe(userData.preferences.dailyReminders);
        expect(savedUser.preferences.achievementAlerts).toBe(userData.preferences.achievementAlerts);
        expect(savedUser.preferences.emailUpdates).toBe(userData.preferences.emailUpdates);

        // Test profile update persistence
        const updatedProfileData = {
          phone: '+1 (555) 999-8888',
          location: 'Updated City, State',
          avatar: 'updated-avatar-url'
        };

        const updatedPreferencesData = {
          notifications: !userData.preferences.notifications,
          dailyReminders: !userData.preferences.dailyReminders,
          achievementAlerts: !userData.preferences.achievementAlerts,
          emailUpdates: !userData.preferences.emailUpdates
        };

        // Update the user
        savedUser.profile = { ...savedUser.profile, ...updatedProfileData };
        savedUser.preferences = { ...savedUser.preferences, ...updatedPreferencesData };
        await savedUser.save();

        // Retrieve updated user from database
        const updatedUser = await User.findById(userId);

        // Verify updated profile data persistence
        expect(updatedUser.profile.phone).toBe(updatedProfileData.phone);
        expect(updatedUser.profile.location).toBe(updatedProfileData.location);
        expect(updatedUser.profile.avatar).toBe(updatedProfileData.avatar);

        // Verify updated preferences data persistence
        expect(updatedUser.preferences.notifications).toBe(updatedPreferencesData.notifications);
        expect(updatedUser.preferences.dailyReminders).toBe(updatedPreferencesData.dailyReminders);
        expect(updatedUser.preferences.achievementAlerts).toBe(updatedPreferencesData.achievementAlerts);
        expect(updatedUser.preferences.emailUpdates).toBe(updatedPreferencesData.emailUpdates);
        
        // Clean up after this test run
        await User.deleteMany({});
      }
    ), { numRuns: 100 });
  });
});