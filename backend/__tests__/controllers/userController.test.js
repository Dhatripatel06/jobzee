import request from 'supertest';
import app from '../../app.js';
import { connectDB, disconnectDB, clearDB } from '../setup/testDb.js';
import { User } from '../../models/userSchema.js';

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
  },
}));

describe('User Authentication Tests', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET_KEY = 'test-secret-key';
    process.env.JWT_EXPIRE = '7d';
    process.env.COOKIE_EXPIRE = '7';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  describe('POST /api/v1/user/register', () => {
    it('should register a new job seeker successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: 1234567890,
        role: 'Job Seeker',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/v1/user/register')
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.role).toBe(userData.role);
      expect(response.body.user.password).toBeUndefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should register a new employer successfully', async () => {
      const userData = {
        name: 'Jane Employer',
        email: 'jane@company.com',
        phone: 9876543210,
        role: 'Employer',
        password: 'securepass123',
      };

      const response = await request(app)
        .post('/api/v1/user/register')
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('Employer');
    });

    it('should fail if required fields are missing', async () => {
      const incompleteData = {
        name: 'John Doe',
        email: 'john@example.com',
        // Missing phone, role, and password
      };

      const response = await request(app)
        .post('/api/v1/user/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail if email already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'duplicate@example.com',
        phone: 1234567890,
        role: 'Job Seeker',
        password: 'password123',
      };

      // First registration
      await request(app).post('/api/v1/user/register').send(userData);

      // Second registration with same email
      const response = await request(app)
        .post('/api/v1/user/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail with invalid email format', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: 1234567890,
        role: 'Job Seeker',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/v1/user/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail if password is too short', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: 1234567890,
        role: 'Job Seeker',
        password: 'short',
      };

      const response = await request(app)
        .post('/api/v1/user/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should hash the password before saving', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: 1234567890,
        role: 'Job Seeker',
        password: 'password123',
      };

      await request(app).post('/api/v1/user/register').send(userData);

      const user = await User.findOne({ email: userData.email }).select('+password');
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash pattern
    });
  });

  describe('POST /api/v1/user/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        phone: 1234567890,
        role: 'Job Seeker',
        password: 'password123',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'Job Seeker',
      };

      const response = await request(app)
        .post('/api/v1/user/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
        role: 'Job Seeker',
      };

      const response = await request(app)
        .post('/api/v1/user/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid Email Or Password');
    });

    it('should fail with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
        role: 'Job Seeker',
      };

      const response = await request(app)
        .post('/api/v1/user/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with wrong role', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'Employer', // Wrong role
      };

      const response = await request(app)
        .post('/api/v1/user/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('role not found');
    });

    it('should fail if required fields are missing', async () => {
      const loginData = {
        email: 'test@example.com',
        // Missing password and role
      };

      const response = await request(app)
        .post('/api/v1/user/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/user/getuser', () => {
    it('should get user info when authenticated', async () => {
      // Register and get token
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: 1234567890,
        role: 'Job Seeker',
        password: 'password123',
      };

      const registerResponse = await request(app)
        .post('/api/v1/user/register')
        .send(userData);

      const cookies = registerResponse.headers['set-cookie'];

      const response = await request(app)
        .get('/api/v1/user/getuser')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/v1/user/getuser')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not Authorized');
    });
  });

  describe('GET /api/v1/user/logout', () => {
    it('should logout successfully when authenticated', async () => {
      // Register and get token
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: 1234567890,
        role: 'Job Seeker',
        password: 'password123',
      };

      const registerResponse = await request(app)
        .post('/api/v1/user/register')
        .send(userData);

      const cookies = registerResponse.headers['set-cookie'];

      const response = await request(app)
        .get('/api/v1/user/logout')
        .set('Cookie', cookies)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged Out');
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/v1/user/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/user/update', () => {
    it('should update user profile successfully', async () => {
      // Register user
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: 1234567890,
        role: 'Job Seeker',
        password: 'password123',
      };

      const registerResponse = await request(app)
        .post('/api/v1/user/register')
        .send(userData);

      const cookies = registerResponse.headers['set-cookie'];

      // Update profile
      const updateData = {
        name: 'Updated Name',
        phone: 9999999999,
      };

      const response = await request(app)
        .put('/api/v1/user/update')
        .set('Cookie', cookies)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe(updateData.name);
      expect(response.body.user.phone).toBe(updateData.phone);
    });

    it('should fail to update with duplicate email', async () => {
      // Create first user
      await User.create({
        name: 'User One',
        email: 'user1@example.com',
        phone: 1111111111,
        role: 'Job Seeker',
        password: 'password123',
      });

      // Register second user
      const userData = {
        name: 'User Two',
        email: 'user2@example.com',
        phone: 2222222222,
        role: 'Job Seeker',
        password: 'password123',
      };

      const registerResponse = await request(app)
        .post('/api/v1/user/register')
        .send(userData);

      const cookies = registerResponse.headers['set-cookie'];

      // Try to update with existing email
      const updateData = {
        email: 'user1@example.com',
      };

      const response = await request(app)
        .put('/api/v1/user/update')
        .set('Cookie', cookies)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email already in use');
    });
  });
});
