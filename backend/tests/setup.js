/**
 * Test Setup Configuration
 * This file contains common setup and teardown logic for all tests
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Set JWT_SECRET for all tests
process.env.JWT_SECRET = 'breathing_app_super_secret_jwt_key_2024_secure_32_characters_minimum';

let mongoServer;

/**
 * Global test setup - runs before all tests
 */
export const setupTestDB = async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
  
  console.log('🧪 Test database connected');
};

/**
 * Global test teardown - runs after all tests
 */
export const teardownTestDB = async () => {
  // Close database connection
  await mongoose.disconnect();
  
  // Stop the in-memory MongoDB instance
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  console.log('🧪 Test database disconnected');
};

/**
 * Clean all collections - useful for test cleanup
 */
export const cleanupTestDB = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Create test user data
 */
export const createTestUser = (overrides = {}) => {
  return {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    ...overrides
  };
};

/**
 * Create test session data
 */
export const createTestSession = (userId, overrides = {}) => {
  return {
    user: userId,
    duration: 300, // 5 minutes
    pattern: {
      inhale: 4,
      hold: 4,
      exhale: 6
    },
    completed: true,
    ...overrides
  };
};

/**
 * Create test pattern data
 */
export const createTestPattern = (userId, overrides = {}) => {
  return {
    user: userId,
    name: 'Test Pattern',
    description: 'A test breathing pattern',
    pattern: {
      inhale: 4,
      hold: 2,
      exhale: 6
    },
    isPublic: false,
    ...overrides
  };
};