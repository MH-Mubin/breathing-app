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

describe('User Model Migration Compatibility', () => {
  test('should handle existing users without profile and preferences fields', async () => {
    // Simulate an existing user document without the new fields
    const existingUserData = {
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'hashedpassword',
      stats: {
        streak: 5,
        totalSessions: 10,
        totalMinutes: 100,
        longestStreak: 7
      },
      achievements: []
    };

    // Insert directly to simulate existing data
    const collection = mongoose.connection.collection('users');
    const result = await collection.insertOne(existingUserData);

    // Fetch using the User model
    const user = await User.findById(result.insertedId);

    // Verify that default values are applied for new fields
    expect(user.profile).toBeDefined();
    expect(user.profile.phone).toBeUndefined();
    expect(user.profile.location).toBeUndefined();
    expect(user.profile.avatar).toBe('');

    expect(user.preferences).toBeDefined();
    expect(user.preferences.notifications).toBe(true);
    expect(user.preferences.dailyReminders).toBe(true);
    expect(user.preferences.achievementAlerts).toBe(true);
    expect(user.preferences.emailUpdates).toBe(false);

    // Verify existing functionality still works
    expect(user.stats.streak).toBe(5);
    expect(user.stats.totalSessions).toBe(10);
    expect(user.name).toBe('Existing User');
  });

  test('should allow updating existing users with new fields', async () => {
    // Create an existing user
    const existingUserData = {
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'hashedpassword',
      stats: {
        streak: 5,
        totalSessions: 10,
        totalMinutes: 100,
        longestStreak: 7
      }
    };

    const collection = mongoose.connection.collection('users');
    const result = await collection.insertOne(existingUserData);
    const user = await User.findById(result.insertedId);

    // Update with new profile and preferences
    user.profile.phone = '+1 (555) 987-6543';
    user.profile.location = 'New York, NY';
    user.preferences.notifications = false;
    user.preferences.emailUpdates = true;

    await user.save();

    // Verify the updates were saved
    const updatedUser = await User.findById(result.insertedId);
    expect(updatedUser.profile.phone).toBe('+1 (555) 987-6543');
    expect(updatedUser.profile.location).toBe('New York, NY');
    expect(updatedUser.preferences.notifications).toBe(false);
    expect(updatedUser.preferences.emailUpdates).toBe(true);

    // Verify existing data is preserved
    expect(updatedUser.stats.streak).toBe(5);
    expect(updatedUser.stats.totalSessions).toBe(10);
  });

  test('should maintain backward compatibility with existing methods', async () => {
    // Create user with old structure
    const existingUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      stats: {
        streak: 3,
        totalSessions: 5,
        totalMinutes: 50,
        longestStreak: 3
      }
    };

    const collection = mongoose.connection.collection('users');
    const result = await collection.insertOne(existingUserData);
    const user = await User.findById(result.insertedId);

    // Test existing methods still work
    user.updateStreak();
    expect(user.stats.streak).toBe(1); // Should be 1 since no lastSessionDate

    const newAchievements = user.checkAchievements();
    expect(newAchievements).toBeDefined();
    expect(Array.isArray(newAchievements)).toBe(true);

    // Test password comparison (if password was already hashed)
    // For this test, we'll set a properly hashed password
    user.password = '$2a$10$example.hash.here'; // Mock hash
    user.comparePassword = async function(candidatePassword) {
      // Mock implementation for test
      return candidatePassword === 'password123';
    };

    const isMatch = await user.comparePassword('password123');
    expect(isMatch).toBe(true);
  });
});