import Pattern from '../../models/Pattern.js';
import User from '../../models/User.js';
import { cleanupTestDB, createTestPattern, createTestUser, setupTestDB, teardownTestDB } from '../setup.js';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await cleanupTestDB();
});

describe('Pattern Model', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user for pattern tests
    const userData = createTestUser();
    testUser = new User(userData);
    await testUser.save();
  });

  test('should create a pattern with valid data', async () => {
    const patternData = createTestPattern(testUser._id);
    
    const pattern = new Pattern(patternData);
    await pattern.save();

    expect(pattern.user.toString()).toBe(testUser._id.toString());
    expect(pattern.name).toBe('Test Pattern');
    expect(pattern.description).toBe('A test breathing pattern');
    expect(pattern.pattern.inhale).toBe(4);
    expect(pattern.pattern.hold).toBe(2);
    expect(pattern.pattern.exhale).toBe(6);
    expect(pattern.isPublic).toBe(false);
    expect(pattern.createdAt).toBeDefined();
  });

  test('should require user field', async () => {
    const patternData = createTestPattern();
    delete patternData.user;

    const pattern = new Pattern(patternData);
    
    await expect(pattern.save()).rejects.toThrow();
  });

  test('should require name field', async () => {
    const patternData = createTestPattern(testUser._id);
    delete patternData.name;

    const pattern = new Pattern(patternData);
    
    await expect(pattern.save()).rejects.toThrow();
  });

  test('should require pattern fields', async () => {
    const patternData = createTestPattern(testUser._id);
    delete patternData.pattern.inhale;

    const pattern = new Pattern(patternData);
    
    await expect(pattern.save()).rejects.toThrow();
  });

  test('should default isPublic to false', async () => {
    const patternData = createTestPattern(testUser._id);
    delete patternData.isPublic;

    const pattern = new Pattern(patternData);
    await pattern.save();

    expect(pattern.isPublic).toBe(false);
  });

  test('should allow public patterns', async () => {
    const patternData = createTestPattern(testUser._id, { isPublic: true });
    
    const pattern = new Pattern(patternData);
    await pattern.save();

    expect(pattern.isPublic).toBe(true);
  });

  test('should populate user data', async () => {
    const patternData = createTestPattern(testUser._id);
    
    const pattern = new Pattern(patternData);
    await pattern.save();

    const populatedPattern = await Pattern.findById(pattern._id).populate('user');
    
    expect(populatedPattern.user.name).toBe(testUser.name);
    expect(populatedPattern.user.email).toBe(testUser.email);
  });
});