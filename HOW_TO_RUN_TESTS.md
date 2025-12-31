# Test Installation & Execution Instructions

## Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

---

## Backend Testing Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

This will install:
- jest (v29.7.0)
- supertest (v6.3.3)
- mongodb-memory-server (v9.1.0)
- @babel/preset-env

### Step 2: Run Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Step 3: View Coverage (Optional)
```bash
# After running test:coverage
# Open in browser: backend/coverage/index.html
```

---

## Frontend Testing Setup

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

This will install:
- vitest (v1.0.4)
- @testing-library/react (v14.1.2)
- @testing-library/jest-dom (v6.1.5)
- @testing-library/user-event (v14.5.1)
- jsdom (v23.0.1)
- @vitest/ui (v1.0.4)

### Step 2: Run Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI (optional)
npx vitest --ui
```

### Step 3: View Coverage (Optional)
```bash
# After running test:coverage
# Open in browser: frontend/coverage/index.html
```

---

## Expected Test Results

### Backend Tests
```
PASS  __tests__/controllers/userController.test.js (28 tests)
PASS  __tests__/controllers/jobController.test.js (30 tests)
PASS  __tests__/controllers/applicationController.test.js (20 tests)

Test Suites: 3 passed, 3 total
Tests:       78 passed, 78 total
Snapshots:   0 total
Time:        15-20s
```

### Frontend Tests
```
✓ src/__tests__/components/Login.test.jsx (9 tests)
✓ src/__tests__/components/Register.test.jsx (8 tests)
✓ src/__tests__/components/Jobs.test.jsx (6 tests)
✓ src/__tests__/components/PostJob.test.jsx (9 tests)
✓ src/__tests__/components/Application.test.jsx (8 tests)

Test Files  5 passed (5)
Tests  32 passed (32)
Time   3-5s
```

---

## Troubleshooting

### Issue: MongoDB Memory Server Download Error
**Solution:**
```bash
# Manually download MongoDB binaries
cd backend
npx mongodb-memory-server postinstall
```

### Issue: Tests Hanging or Timeout
**Solution:**
```bash
# Increase timeout in jest.config.js or vitest.config.js
# Already set to 30000ms (30 seconds)
```

### Issue: Port Already in Use
**Solution:**
```bash
# Kill process on port 4000 (Windows)
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Kill process on port 4000 (Mac/Linux)
lsof -ti:4000 | xargs kill -9
```

### Issue: Jest Cache Issues
**Solution:**
```bash
cd backend
npx jest --clearCache
```

### Issue: Module Not Found
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

---

## Running Specific Tests

### Backend - Run Single Test File
```bash
cd backend
npm test userController.test.js
```

### Backend - Run Specific Test Suite
```bash
cd backend
npm test -- --testNamePattern="POST /api/v1/user/register"
```

### Frontend - Run Single Test File
```bash
cd frontend
npx vitest Login.test.jsx
```

### Frontend - Run Specific Test
```bash
cd frontend
npx vitest -t "should render login form correctly"
```

---

## Understanding Test Output

### Green ✓ = Test Passed
All assertions passed successfully

### Red ✗ = Test Failed
One or more assertions failed, check the error message

### Yellow ⚠ = Test Skipped
Test was skipped (it.skip or xit)

### Coverage Percentage
- **Statements:** % of code statements executed
- **Branches:** % of if/else branches tested
- **Functions:** % of functions called
- **Lines:** % of code lines executed

---

## Test Files Location

### Backend Tests
```
backend/__tests__/
├── setup/
│   ├── testDb.js               # MongoDB test database
│   └── testHelpers.js          # Test data factories
└── controllers/
    ├── userController.test.js   # Authentication tests
    ├── jobController.test.js    # Job management tests
    └── applicationController.test.js # Application tests
```

### Frontend Tests
```
frontend/src/__tests__/
├── setup.js                    # Test configuration
└── components/
    ├── Login.test.jsx          # Login component tests
    ├── Register.test.jsx       # Register component tests
    ├── Jobs.test.jsx           # Jobs listing tests
    ├── PostJob.test.jsx        # Post job form tests
    └── Application.test.jsx    # Application form tests
```

---

## CI/CD Integration (Optional)

### GitHub Actions Example
```yaml
name: Run Tests
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install and Test
        run: |
          cd backend
          npm install
          npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install and Test
        run: |
          cd frontend
          npm install
          npm test
```

---

## Additional Resources

- **Full Test Report:** [TEST_REPORT.md](./TEST_REPORT.md)
- **Testing Guide:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Issues & Fixes:** [ISSUES_AND_FIXES.md](./ISSUES_AND_FIXES.md)
- **Summary:** [TESTING_SUMMARY.md](./TESTING_SUMMARY.md)

---

## Need Help?

If tests fail:
1. Check error messages carefully
2. Ensure all dependencies are installed
3. Verify Node.js version (16+)
4. Check that no other processes are using required ports
5. Review the specific test file for details
6. Check the troubleshooting section above

All tests should pass on first run if dependencies are properly installed! ✅
