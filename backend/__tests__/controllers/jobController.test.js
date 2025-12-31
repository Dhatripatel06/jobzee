import request from 'supertest';
import app from '../../app.js';
import { connectDB, disconnectDB, clearDB } from '../setup/testDb.js';
import { createTestUser, createTestEmployer, createTestJob } from '../setup/testHelpers.js';
import { Job } from '../../models/jobSchema.js';

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
  },
}));

describe('Job Controller Tests', () => {
  let jobSeeker, employer, employerCookies, jobSeekerCookies, employer2, employer2Cookies;

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

    // Create test users
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

    // Create second employer
    const employer2Res = await request(app)
      .post('/api/v1/user/register')
      .send({
        name: 'Test Employer 2',
        email: 'employer2@example.com',
        phone: 5555555555,
        role: 'Employer',
        password: 'password123',
      });
    employer2Cookies = employer2Res.headers['set-cookie'];
    employer2 = employer2Res.body.user;
  });

  describe('GET /api/v1/job/getall', () => {
    it('should get all non-expired jobs', async () => {
      // Create test jobs
      await createTestJob(employer._id, {
        title: 'Software Engineer',
        expired: false,
      });
      await createTestJob(employer._id, {
        title: 'Product Manager',
        expired: false,
      });
      await createTestJob(employer._id, {
        title: 'Expired Job',
        expired: true,
      });

      const response = await request(app)
        .get('/api/v1/job/getall')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.jobs).toHaveLength(2);
      expect(response.body.jobs.every(job => !job.expired)).toBe(true);
    });

    it('should return empty array when no jobs exist', async () => {
      const response = await request(app)
        .get('/api/v1/job/getall')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.jobs).toHaveLength(0);
    });
  });

  describe('POST /api/v1/job/post', () => {
    it('should post a job successfully with fixed salary', async () => {
      const jobData = {
        title: 'Software Engineer',
        description: 'Looking for an experienced software engineer to join our team',
        category: 'IT',
        country: 'USA',
        city: 'New York',
        location: '123 Tech Street, Manhattan',
        fixedSalary: 100000,
      };

      const response = await request(app)
        .post('/api/v1/job/post')
        .set('Cookie', employerCookies)
        .send(jobData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.job.title).toBe(jobData.title);
      expect(response.body.job.fixedSalary).toBe(jobData.fixedSalary);
      expect(response.body.job.postedBy).toBe(employer._id);
    });

    it('should post a job successfully with salary range', async () => {
      const jobData = {
        title: 'Software Engineer',
        description: 'Looking for an experienced software engineer to join our team',
        category: 'IT',
        country: 'USA',
        city: 'New York',
        location: '123 Tech Street, Manhattan',
        salaryFrom: 80000,
        salaryTo: 120000,
      };

      const response = await request(app)
        .post('/api/v1/job/post')
        .set('Cookie', employerCookies)
        .send(jobData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.job.salaryFrom).toBe(jobData.salaryFrom);
      expect(response.body.job.salaryTo).toBe(jobData.salaryTo);
    });

    it('should fail if job seeker tries to post a job', async () => {
      const jobData = {
        title: 'Software Engineer',
        description: 'Looking for an experienced software engineer to join our team',
        category: 'IT',
        country: 'USA',
        city: 'New York',
        location: '123 Tech Street, Manhattan',
        fixedSalary: 100000,
      };

      const response = await request(app)
        .post('/api/v1/job/post')
        .set('Cookie', jobSeekerCookies)
        .send(jobData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Job Seeker not allowed');
    });

    it('should fail if required fields are missing', async () => {
      const jobData = {
        title: 'Software Engineer',
        // Missing description, category, etc.
      };

      const response = await request(app)
        .post('/api/v1/job/post')
        .set('Cookie', employerCookies)
        .send(jobData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail if neither fixed nor ranged salary provided', async () => {
      const jobData = {
        title: 'Software Engineer',
        description: 'Looking for an experienced software engineer to join our team',
        category: 'IT',
        country: 'USA',
        city: 'New York',
        location: '123 Tech Street, Manhattan',
      };

      const response = await request(app)
        .post('/api/v1/job/post')
        .set('Cookie', employerCookies)
        .send(jobData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('fixed salary or ranged salary');
    });

    it('should fail if both fixed and ranged salary provided', async () => {
      const jobData = {
        title: 'Software Engineer',
        description: 'Looking for an experienced software engineer to join our team',
        category: 'IT',
        country: 'USA',
        city: 'New York',
        location: '123 Tech Street, Manhattan',
        fixedSalary: 100000,
        salaryFrom: 80000,
        salaryTo: 120000,
      };

      const response = await request(app)
        .post('/api/v1/job/post')
        .set('Cookie', employerCookies)
        .send(jobData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot Enter Fixed and Ranged Salary together');
    });

    it('should fail without authentication', async () => {
      const jobData = {
        title: 'Software Engineer',
        description: 'Looking for an experienced software engineer to join our team',
        category: 'IT',
        country: 'USA',
        city: 'New York',
        location: '123 Tech Street, Manhattan',
        fixedSalary: 100000,
      };

      const response = await request(app)
        .post('/api/v1/job/post')
        .send(jobData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/job/getmyjobs', () => {
    it('should get all jobs posted by employer', async () => {
      // Create jobs for employer
      await createTestJob(employer._id, { title: 'Job 1' });
      await createTestJob(employer._id, { title: 'Job 2' });
      await createTestJob(employer2._id, { title: 'Job 3' });

      const response = await request(app)
        .get('/api/v1/job/getmyjobs')
        .set('Cookie', employerCookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.myJobs).toHaveLength(2);
      expect(response.body.myJobs.every(job => job.postedBy === employer._id)).toBe(true);
    });

    it('should fail if job seeker tries to access', async () => {
      const response = await request(app)
        .get('/api/v1/job/getmyjobs')
        .set('Cookie', jobSeekerCookies)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Job Seeker not allowed');
    });
  });

  describe('PUT /api/v1/job/update/:id', () => {
    it('should update job successfully by owner', async () => {
      const job = await createTestJob(employer._id);

      const updateData = {
        title: 'Updated Title',
        description: 'Updated description with enough characters to pass validation',
      };

      const response = await request(app)
        .put(`/api/v1/job/update/${job._id}`)
        .set('Cookie', employerCookies)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.job.title).toBe(updateData.title);
      expect(response.body.job.description).toBe(updateData.description);
    });

    it('should fail if non-owner employer tries to update', async () => {
      const job = await createTestJob(employer._id);

      const updateData = {
        title: 'Updated Title',
      };

      const response = await request(app)
        .put(`/api/v1/job/update/${job._id}`)
        .set('Cookie', employer2Cookies)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not authorized');
    });

    it('should fail if job does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/v1/job/update/${fakeId}`)
        .set('Cookie', employerCookies)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail if job seeker tries to update', async () => {
      const job = await createTestJob(employer._id);

      const response = await request(app)
        .put(`/api/v1/job/update/${job._id}`)
        .set('Cookie', jobSeekerCookies)
        .send({ title: 'Updated Title' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/job/delete/:id', () => {
    it('should delete job successfully by owner', async () => {
      const job = await createTestJob(employer._id);

      const response = await request(app)
        .delete(`/api/v1/job/delete/${job._id}`)
        .set('Cookie', employerCookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Deleted Successfully');

      const deletedJob = await Job.findById(job._id);
      expect(deletedJob).toBeNull();
    });

    it('should fail if non-owner employer tries to delete', async () => {
      const job = await createTestJob(employer._id);

      const response = await request(app)
        .delete(`/api/v1/job/delete/${job._id}`)
        .set('Cookie', employer2Cookies)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not authorized');

      const jobStillExists = await Job.findById(job._id);
      expect(jobStillExists).not.toBeNull();
    });

    it('should fail if job does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/v1/job/delete/${fakeId}`)
        .set('Cookie', employerCookies)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/job/:id', () => {
    it('should get single job successfully', async () => {
      const job = await createTestJob(employer._id);

      const response = await request(app)
        .get(`/api/v1/job/${job._id}`)
        .set('Cookie', jobSeekerCookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.job._id).toBe(job._id.toString());
      expect(response.body.job.title).toBe(job.title);
    });

    it('should fail with invalid job ID', async () => {
      const response = await request(app)
        .get('/api/v1/job/invalid-id')
        .set('Cookie', jobSeekerCookies)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid ID');
    });

    it('should fail if job does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/v1/job/${fakeId}`)
        .set('Cookie', jobSeekerCookies)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
