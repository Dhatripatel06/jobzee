import { User } from '../../models/userSchema.js';
import { Job } from '../../models/jobSchema.js';
import { Application } from '../../models/applicationSchema.js';

export const createTestUser = async (userData = {}) => {
  const defaultUserData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: 1234567890,
    role: 'Job Seeker',
    password: 'password123',
  };
  
  const user = await User.create({ ...defaultUserData, ...userData });
  return user;
};

export const createTestEmployer = async (userData = {}) => {
  const defaultEmployerData = {
    name: 'Test Employer',
    email: 'employer@example.com',
    phone: 9876543210,
    role: 'Employer',
    password: 'password123',
  };
  
  const employer = await User.create({ ...defaultEmployerData, ...userData });
  return employer;
};

export const createTestJob = async (employerId, jobData = {}) => {
  const defaultJobData = {
    title: 'Test Job',
    description: 'This is a test job description with enough characters to pass validation',
    category: 'IT',
    country: 'USA',
    city: 'New York',
    location: '123 Test Street, Test Building',
    fixedSalary: 50000,
    postedBy: employerId,
  };
  
  const job = await Job.create({ ...defaultJobData, ...jobData });
  return job;
};

export const createTestApplication = async (applicantId, employerId, applicationData = {}) => {
  const defaultApplicationData = {
    name: 'Test Applicant',
    email: 'applicant@example.com',
    phone: 1112223333,
    address: '123 Applicant Street',
    coverLetter: 'This is a test cover letter',
    resume: {
      public_id: 'test_resume_id',
      url: 'https://test.com/resume.pdf',
    },
    applicantID: {
      user: applicantId,
      role: 'Job Seeker',
    },
    employerID: {
      user: employerId,
      role: 'Employer',
    },
  };
  
  const application = await Application.create({ ...defaultApplicationData, ...applicationData });
  return application;
};

export const getAuthToken = (user) => {
  return user.getJWTToken();
};
