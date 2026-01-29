/**
 * Frontend Test Setup Configuration
 * This file contains common setup for Vitest tests
 */

import { afterEach, beforeAll } from 'vitest';

// Cleanup after each test
afterEach(() => {
  // Cleanup will be handled by individual tests
});

// Mock environment variables
beforeAll(() => {
  // Mock Vite environment variables
  Object.assign(import.meta.env, {
    VITE_API_URL: 'http://localhost:5000',
    MODE: 'test',
    DEV: false,
    PROD: false,
    SSR: false
  });
});

// Global test utilities
export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
  stats: {
    streak: 5,
    totalSessions: 10,
    totalMinutes: 100,
    longestStreak: 7
  },
  achievements: []
};

export const mockSession = {
  _id: '507f1f77bcf86cd799439012',
  duration: 300,
  pattern: {
    inhale: 4,
    hold: 4,
    exhale: 6
  },
  completed: true,
  createdAt: new Date().toISOString()
};

export const mockPattern = {
  _id: '507f1f77bcf86cd799439013',
  name: 'Test Pattern',
  description: 'A test breathing pattern',
  pattern: {
    inhale: 4,
    hold: 2,
    exhale: 6
  },
  isPublic: false
};