import jwt from 'jsonwebtoken';
import { protect } from '../../middleware/auth.js';
import User from '../../models/User.js';
import { cleanupTestDB, createTestUser, setupTestDB, teardownTestDB } from '../setup.js';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await cleanupTestDB();
});

describe('Auth Middleware', () => {
  let testUser;
  let validToken;

  beforeEach(async () => {
    // Create test user
    const userData = createTestUser();
    testUser = new User(userData);
    await testUser.save();

    // Generate valid token
    validToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'testsecret', {
      expiresIn: '1h'
    });
  });

  test('should authenticate user with valid token', async () => {
    const req = {
      headers: {
        authorization: `Bearer ${validToken}`
      }
    };
    const res = {};
    const next = jest.fn();

    await protect(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user._id.toString()).toBe(testUser._id.toString());
    expect(next).toHaveBeenCalledWith();
  });

  test('should reject request without authorization header', async () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized, token missing'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject request with invalid token format', async () => {
    const req = {
      headers: {
        authorization: 'InvalidFormat'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized, token missing'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject request with invalid token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer invalidtoken'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject request with expired token', async () => {
    // Create expired token
    const expiredToken = jwt.sign(
      { id: testUser._id },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '-1h' } // Expired 1 hour ago
    );

    const req = {
      headers: {
        authorization: `Bearer ${expiredToken}`
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token is not valid'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject request for non-existent user', async () => {
    // Create token with non-existent user ID
    const fakeUserId = '507f1f77bcf86cd799439011';
    const fakeToken = jwt.sign(
      { id: fakeUserId },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );

    const req = {
      headers: {
        authorization: `Bearer ${fakeToken}`
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User not found'
    });
    expect(next).not.toHaveBeenCalled();
  });
});