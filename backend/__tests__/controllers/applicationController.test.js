import request from 'supertest';
import app from '../../app.js';
import { connectDB, disconnectDB, clearDB } from '../setup/testDb.js';
import { createTestJob, createTestApplication } from '../setup/testHelpers.js';
import { Application } from '../../models/applicationSchema.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock cloudinarynpm run build

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
  },
  uploader: {
    upload: jest.fn().mockResolvedValue({
      public_id: 'test_resume_123',
      secure_url: 'https://test.cloudinary.com/resume.pdf',
    }),
  },
}));

describe('Application Controller Tests', () => {
  let jobSeeker, employer, employerCookies, jobSeekerCookies, testJob, jobSeeker2, jobSeeker2Cookies;

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

    // Create employer
    const employerRes = await request(app)
      .post('/api/v1/user/register')
      .send({
        name: 'Test Employer',
        email: 'employer@example.com',
        phone: 9876543210,
        role: 'Employer',
        password: 'password123',
      });
    employerCookies = employerRes.headers['set-cookie'];
    employer = employerRes.body.user;

    // Create job seeker
    const jobSeekerRes = await request(app)
      .post('/api/v1/user/register')
      .send({
        name: 'Test Job Seeker',
        email: 'jobseeker@example.com',
        phone: 1234567890,
        role: 'Job Seeker',
        password: 'password123',
      });
    jobSeekerCookies = jobSeekerRes.headers['set-cookie'];
    jobSeeker = jobSeekerRes.body.user;

    // Create second job seeker
    const jobSeeker2Res = await request(app)
      .post('/api/v1/user/register')
      .send({
        name: 'Test Job Seeker 2',
        email: 'jobseeker2@example.com',
        phone: 5555555555,
        role: 'Job Seeker',
        password: 'password123',
      });
    jobSeeker2Cookies = jobSeeker2Res.headers['set-cookie'];
    jobSeeker2 = jobSeeker2Res.body.user;

    // Create test job
    testJob = await createTestJob(employer._id);
  });

  describe('POST /api/v1/application/post', () => {
    it('should submit application successfully with PDF resume', async () => {
      const applicationData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: 1234567890,
        address: '123 Test Street',
        coverLetter: 'I am interested in this position',
        jobId: testJob._id.toString(),
      };

      const response = await request(app)
        .post('/api/v1/application/post')
        .set('Cookie', jobSeekerCookies)
        .field('name', applicationData.name)
        .field('email', applicationData.email)
        .field('phone', applicationData.phone)
        .field('address', applicationData.address)
        .field('coverLetter', applicationData.coverLetter)
        .field('jobId', applicationData.jobId)
        .attach('resume', Buffer.from('fake pdf content'), 'resume.pdf')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.application.name).toBe(applicationData.name);
      expect(response.body.application.resume.public_id).toBeDefined();
      expect(response.body.application.resume.url).toBeDefined();
    });

    it('should fail if employer tries to submit application', async () => {
      const applicationData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: 1234567890,
        address: '123 Test Street',
        coverLetter: 'I am interested in this position',
        jobId: testJob._id.toString(),
      };

      const response = await request(app)
        .post('/api/v1/application/post')
        .set('Cookie', employerCookies)
        .field('name', applicationData.name)
        .field('email', applicationData.email)
        .field('phone', applicationData.phone)
        .field('address', applicationData.address)
        .field('coverLetter', applicationData.coverLetter)
        .field('jobId', applicationData.jobId)
        .attach('resume', Buffer.from('fake pdf content'), 'resume.pdf')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Employer not allowed');
    });

    it('should fail if no resume file provided', async () => {
      const applicationData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: 1234567890,
        address: '123 Test Street',
        coverLetter: 'I am interested in this position',
        jobId: testJob._id.toString(),
      };

      const response = await request(app)
        .post('/api/v1/application/post')
        .set('Cookie', jobSeekerCookies)
        .field('name', applicationData.name)
        .field('email', applicationData.email)
        .field('phone', applicationData.phone)
        .field('address', applicationData.address)
        .field('coverLetter', applicationData.coverLetter)
        .field('jobId', applicationData.jobId)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Resume File Required');
    });

    it('should fail if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/application/post')
        .set('Cookie', jobSeekerCookies)
        .field('name', 'John Doe')
        .attach('resume', Buffer.from('fake pdf content'), 'resume.pdf')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail if job ID is invalid', async () => {
      const applicationData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: 1234567890,
        address: '123 Test Street',
        coverLetter: 'I am interested in this position',
        jobId: 'invalid-job-id',
      };

      const response = await request(app)
        .post('/api/v1/application/post')
        .set('Cookie', jobSeekerCookies)
        .field('name', applicationData.name)
        .field('email', applicationData.email)
        .field('phone', applicationData.phone)
        .field('address', applicationData.address)
        .field('coverLetter', applicationData.coverLetter)
        .field('jobId', applicationData.jobId)
        .attach('resume', Buffer.from('fake pdf content'), 'resume.pdf')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/application/post')
        .field('name', 'John Doe')
        .attach('resume', Buffer.from('fake pdf content'), 'resume.pdf')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/application/jobseeker/getall', () => {
    it('should get all applications for job seeker', async () => {
      // Create applications for job seeker
      await createTestApplication(jobSeeker._id, employer._id);
      await createTestApplication(jobSeeker._id, employer._id);
      await createTestApplication(jobSeeker2._id, employer._id);

      const response = await request(app)
        .get('/api/v1/application/jobseeker/getall')
        .set('Cookie', jobSeekerCookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.applications).toHaveLength(2);
      expect(response.body.applications.every(
        app => app.applicantID.user === jobSeeker._id
      )).toBe(true);
    });

    it('should fail if employer tries to access', async () => {
      const response = await request(app)
        .get('/api/v1/application/jobseeker/getall')
        .set('Cookie', employerCookies)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Employer not allowed');
    });

    it('should return empty array if no applications', async () => {
      const response = await request(app)
        .get('/api/v1/application/jobseeker/getall')
        .set('Cookie', jobSeekerCookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.applications).toHaveLength(0);
    });
  });

  describe('GET /api/v1/application/employer/getall', () => {
    it('should get all applications for employer', async () => {
      // Create applications
      await createTestApplication(jobSeeker._id, employer._id);
      await createTestApplication(jobSeeker2._id, employer._id);

      const response = await request(app)
        .get('/api/v1/application/employer/getall')
        .set('Cookie', employerCookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.applications).toHaveLength(2);
      expect(response.body.applications.every(
        app => app.employerID.user === employer._id
      )).toBe(true);
    });

    it('should fail if job seeker tries to access', async () => {
      const response = await request(app)
        .get('/api/v1/application/employer/getall')
        .set('Cookie', jobSeekerCookies)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Job Seeker not allowed');
    });

    it('should return empty array if no applications', async () => {
      const response = await request(app)
        .get('/api/v1/application/employer/getall')
        .set('Cookie', employerCookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.applications).toHaveLength(0);
    });
  });

  describe('DELETE /api/v1/application/delete/:id', () => {
    it('should delete application successfully by owner', async () => {
      const application = await createTestApplication(jobSeeker._id, employer._id);

      const response = await request(app)
        .delete(`/api/v1/application/delete/${application._id}`)
        .set('Cookie', jobSeekerCookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Deleted Successfully');

      const deletedApp = await Application.findById(application._id);
      expect(deletedApp).toBeNull();
    });

    it('should fail if non-owner job seeker tries to delete', async () => {
      const application = await createTestApplication(jobSeeker._id, employer._id);

      const response = await request(app)
        .delete(`/api/v1/application/delete/${application._id}`)
        .set('Cookie', jobSeeker2Cookies)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not authorized');

      const appStillExists = await Application.findById(application._id);
      expect(appStillExists).not.toBeNull();
    });

    it('should fail if employer tries to delete', async () => {
      const application = await createTestApplication(jobSeeker._id, employer._id);

      const response = await request(app)
        .delete(`/api/v1/application/delete/${application._id}`)
        .set('Cookie', employerCookies)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail if application does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/v1/application/delete/${fakeId}`)
        .set('Cookie', jobSeekerCookies)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const application = await createTestApplication(jobSeeker._id, employer._id);

      const response = await request(app)
        .delete(`/api/v1/application/delete/${application._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
