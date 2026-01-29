import Session from '../../models/Session.js';
import User from '../../models/User.js';
import { cleanupTestDB, createTestSession, createTestUser, setupTestDB, teardownTestDB } from '../setup.js';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await cleanupTestDB();
});

describe('Session Model', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user for session tests
    const userData = createTestUser();
    testUser = new User(userData);
    await testUser.save();
  });

  test('should create a session with valid data', async () => {
    const sessionData = createTestSession(testUser._id);
    
    const session = new Session(sessionData);
    await session.save();

    expect(session.user.toString()).toBe(testUser._id.toString());
    expect(session.duration).toBe(300);
    expect(session.pattern.inhale).toBe(4);
    expect(session.pattern.hold).toBe(4);
    expect(session.pattern.exhale).toBe(6);
    expect(session.completed).toBe(true);
    expect(session.createdAt).toBeDefined();
  });

  test('should require user field', async () => {
    const sessionData = createTestSession();
    delete sessionData.user;

    const session = new Session(sessionData);
    
    await expect(session.save()).rejects.toThrow();
  });

  test('should require duration field', async () => {
    const sessionData = createTestSession(testUser._id);
    delete sessionData.duration;

    const session = new Session(sessionData);
    
    await expect(session.save()).rejects.toThrow();
  });

  test('should require pattern fields', async () => {
    const sessionData = createTestSession(testUser._id);
    delete sessionData.pattern.inhale;

    const session = new Session(sessionData);
    
    await expect(session.save()).rejects.toThrow();
  });

  test('should default completed to false', async () => {
    const sessionData = createTestSession(testUser._id);
    delete sessionData.completed;

    const session = new Session(sessionData);
    await session.save();

    expect(session.completed).toBe(false);
  });

  test('should populate user data', async () => {
    const sessionData = createTestSession(testUser._id);
    
    const session = new Session(sessionData);
    await session.save();

    const populatedSession = await Session.findById(session._id).populate('user');
    
    expect(populatedSession.user.name).toBe(testUser.name);
    expect(populatedSession.user.email).toBe(testUser.email);
  });
});