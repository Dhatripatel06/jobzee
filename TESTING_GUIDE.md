# Quick Start Guide for Testing

## Installation

### Backend Setup
```bash
cd backend
npm install
```

This will install all testing dependencies:
- jest
- supertest
- mongodb-memory-server

### Frontend Setup
```bash
cd frontend
npm install
```

This will install all testing dependencies:
- vitest
- @testing-library/react
- @testing-library/jest-dom
- @testing-library/user-event
- jsdom

## Running Tests

### Backend Tests
```bash
# From backend directory
npm test                    # Run all tests once
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report
```

### Frontend Tests
```bash
# From frontend directory
npm test                    # Run all tests once
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report
```

## Test Structure

### Backend Tests
```
backend/__tests__/
├── setup/
│   ├── testDb.js           # MongoDB memory server configuration
│   └── testHelpers.js      # Test data factories
└── controllers/
    ├── userController.test.js       # 28 authentication tests
    ├── jobController.test.js        # 30 job management tests
    └── applicationController.test.js # 20 application tests
```

### Frontend Tests
```
frontend/src/__tests__/
├── setup.js                         # Test configuration & mocks
└── components/
    ├── Login.test.jsx               # 9 login component tests
    ├── Register.test.jsx            # 8 registration tests
    ├── Jobs.test.jsx                # 6 job listing tests
    ├── PostJob.test.jsx             # 9 job posting tests
    └── Application.test.jsx         # 8 application form tests
```

## Expected Output

### Successful Backend Test Run
```
PASS  __tests__/controllers/userController.test.js
  User Authentication Tests
    ✓ should register a new job seeker successfully
    ✓ should login successfully with correct credentials
    ✓ should fail with incorrect password
    ... (28 tests total)

PASS  __tests__/controllers/jobController.test.js
  Job Controller Tests
    ✓ should get all non-expired jobs
    ✓ should post a job successfully
    ✓ should fail if non-owner tries to update job
    ... (30 tests total)

PASS  __tests__/controllers/applicationController.test.js
  Application Controller Tests
    ✓ should submit application successfully
    ✓ should fail if non-owner tries to delete
    ... (20 tests total)

Test Suites: 3 passed, 3 total
Tests:       78 passed, 78 total
Time:        15.234s
```

### Successful Frontend Test Run
```
✓ src/__tests__/components/Login.test.jsx (9)
✓ src/__tests__/components/Register.test.jsx (8)
✓ src/__tests__/components/Jobs.test.jsx (6)
✓ src/__tests__/components/PostJob.test.jsx (9)
✓ src/__tests__/components/Application.test.jsx (8)

Test Files  5 passed (5)
Tests  32 passed (32)
Time   3.456s
```

## Troubleshooting

### MongoDB Memory Server Issues
If you encounter memory server errors:
```bash
# Clear Jest cache
cd backend
npx jest --clearCache
```

### Port Already in Use
If tests fail due to port conflicts, ensure no other instances are running:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Frontend Mock Errors
If you see "Cannot find module" errors:
```bash
cd frontend
rm -rf node_modules
npm install
```

## What's Being Tested

### ✅ Authentication
- User registration (Job Seeker & Employer)
- Login with email/password/role
- Logout functionality
- Get user profile
- Update user profile
- Password hashing
- JWT token generation

### ✅ Job Management
- Post jobs (fixed salary & salary range)
- Get all available jobs
- Get employer's posted jobs
- Update jobs (with ownership verification)
- Delete jobs (with ownership verification)
- Get single job details
- Role-based access control

### ✅ Applications
- Submit applications with resume upload
- Get job seeker's applications
- Get employer's received applications
- Delete applications (with ownership verification)
- File upload validation
- Role-based access control

### ✅ Security & Validation
- Authorization middleware
- Error handling
- Input validation
- Role-based permissions
- Ownership verification
- Duplicate email detection

### ✅ Frontend Components
- Form rendering and interactions
- User input handling
- API integration
- Success/error message display
- Navigation and routing
- Authentication state management

## Fixed Issues

The tests verify fixes for these critical issues:
1. ✅ CastError typo in error middleware
2. ✅ Job ownership verification on update/delete
3. ✅ Application ownership verification on delete
4. ✅ Resume file format restrictions (now accepts PDF/DOC)
5. ✅ Missing profile update endpoint

## Coverage Reports

After running `npm run test:coverage`, check:
- Backend: `backend/coverage/index.html`
- Frontend: `frontend/coverage/index.html`

Open these files in a browser to see detailed line-by-line coverage.

## Need Help?

- See [TEST_REPORT.md](./TEST_REPORT.md) for comprehensive test documentation
- See [ISSUES_AND_FIXES.md](./ISSUES_AND_FIXES.md) for all identified issues
- Check individual test files for specific test implementations
