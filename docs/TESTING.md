# Testing Guide

- [Overview](#overview)
- [Running Tests](#running-tests)
  - [Backend Tests](#backend-tests)
- [Test Structure](#test-structure)
- [Mock Strategy](#mock-strategy)
  - [Mocking Prisma](#mocking-prisma)
  - [Mocking Authentication](#mocking-authentication)
- [Testing Authentication Endpoints](#testing-authentication-endpoints)
  - [Registration Tests](#registration-tests)
  - [Login Tests](#login-tests)
- [Testing Protected Routes](#testing-protected-routes)
- [Testing Project Ownership](#testing-project-ownership)
- [Manual Testing](#manual-testing)
  - [API Testing with cURL](#api-testing-with-curl)
- [Writing New Tests](#writing-new-tests)
- [Best Practices](#best-practices)

This document explains how to run and write tests for the PXL Shelfware Tracker application, including testing with authentication.

## Overview

The test suite includes:
1. **Backend API Tests**: Testing endpoints with and without authentication
2. **Authentication Tests**: Specific tests for auth endpoints
3. **Mock Strategy**: How the database and authentication are mocked

## Running Tests

### Backend Tests

To run all backend tests:

```bash
cd backend
npm test
```

To run specific test files:

```bash
npm test -- tests/auth.test.ts
```

## Test Structure

The backend tests are organized into two main files:

1. **server.test.ts**: Tests for API endpoints (projects, health checks)
2. **auth.test.ts**: Tests specifically for authentication endpoints

## Mock Strategy

The tests use Jest mocks to simulate database interactions and authentication without requiring a real database.

### Mocking Prisma

```typescript
jest.mock('@prisma/client', () => {
  const mPrisma = {
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.email === 'test@example.com') {
          return Promise.resolve({
            id: 'test-user-id',
            email: 'test@example.com',
            password: '$2b$10$testHashedPassword',
            name: 'Test User',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        // Additional mock implementations...
      }),
      create: jest.fn().mockResolvedValue({
        id: 'new-user-id',
        email: 'new@example.com',
        name: 'New User',
        createdAt: new Date(),
        updatedAt: new Date()
      }),
    },
    project: {
      findMany: jest.fn().mockImplementation((params) => {
        const projects = [
          { id: '1', title: 'Test Project', status: 'Active', userId: 'test-user-id', createdAt: new Date() },
          { id: '2', title: 'Another Project', status: 'Planning', userId: 'other-user-id', createdAt: new Date() }
        ];
        
        // Filter by userId if provided
        if (params?.where?.userId) {
          return Promise.resolve(projects.filter(p => p.userId === params.where.userId));
        }
        
        return Promise.resolve(projects);
      }),
      findUnique: jest.fn().mockImplementation(({ where: { id } }) => {
        if (id === '1') {
          return Promise.resolve({ id: '1', title: 'Test Project', status: 'Active', userId: 'test-user-id' });
        }
        return Promise.resolve(null);
      }),
      // Other project methods...
    },
    $queryRaw: jest.fn().mockResolvedValue([1]), // Used in /ready endpoint
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});
```

### Mocking Authentication

For bcrypt password comparison:

```typescript
jest.mock('bcrypt', () => ({
  compare: jest.fn().mockImplementation((password, hash) => {
    // In tests, 'password123' will be considered valid
    return Promise.resolve(password === 'password123');
  }),
  hash: jest.fn().mockResolvedValue('$2b$10$hashedPassword')
}));
```

For JWT tokens:

```typescript
// Helper to create test tokens
const generateTestToken = (userId = 'test-user-id') => {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '1h' });
};
```

## Testing Authentication Endpoints

The authentication endpoints are tested in `auth.test.ts`:

### Registration Tests

```typescript
describe('POST /api/auth/register', () => {
  it('should register a new user and return token', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ 
        email: 'new@example.com', 
        password: 'password123', 
        name: 'New User' 
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'new@example.com');
    expect(response.body.user).not.toHaveProperty('password');
    
    // Verify token can be decoded
    const decoded = jwt.verify(response.body.token, JWT_SECRET);
    expect(decoded).toHaveProperty('sub', 'new-user-id');
  });

  it('should return 400 if email is missing', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ password: 'password123' });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Email and password are required');
  });
});
```

### Login Tests

```typescript
describe('POST /api/auth/login', () => {
  it('should return token with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ 
        email: 'test@example.com', 
        password: 'password123' 
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('should return 401 with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ 
        email: 'test@example.com', 
        password: 'wrongpassword' 
      });
    
    expect(response.status).toBe(401);
  });
});
```

## Testing Protected Routes

When testing routes that require authentication:

```typescript
describe('GET /api/projects', () => {
  it('should return all projects when not authenticated', async () => {
    const response = await request(app).get('/api/projects');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return only user projects when authenticated', async () => {
    const token = generateTestToken();
    const response = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Should only return projects for the authenticated user
    response.body.forEach(project => {
      expect(project.userId).toBe('test-user-id');
    });
  });
});

describe('GET /api/projects/:id', () => {
  it('should return 401 if not authenticated', async () => {
    const response = await request(app).get('/api/projects/1');
    expect(response.status).toBe(401);
  });

  it('should return a project if found and user is authenticated', async () => {
    const token = generateTestToken();
    const response = await request(app)
      .get('/api/projects/1')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', '1');
  });

  it('should return 403 if authenticated but not the owner', async () => {
    const token = generateTestToken('wrong-user-id');
    const response = await request(app)
      .get('/api/projects/1')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(403);
  });
});
```

## Testing Project Ownership

The tests check that users can only access their own projects:

```typescript
describe('PUT /api/projects/:id', () => {
  it('should return 403 when updating a project the user doesn\'t own', async () => {
    // Override the project.findUnique method to return a project with a different userId
    const { PrismaClient } = require('@prisma/client');
    const prismaMock = new PrismaClient();
    prismaMock.project.findUnique.mockResolvedValueOnce({
      id: '1',
      title: 'Test Project',
      status: 'Active',
      userId: 'different-user-id' // Different from the token's user ID
    });

    const token = generateTestToken('test-user-id');
    const payload = {
      title: 'Updated Project',
      status: 'Active'
    };
    
    const response = await request(app)
      .put('/api/projects/1')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('You do not have permission to modify this project');
  });
});
```

## Manual Testing

### API Testing with cURL

Test the registration endpoint:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

Login to get a token:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Get user profile using token:
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Create a project:
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Test Project","status":"In Progress","description":"A test project"}'
```

## Writing New Tests

When adding new tests, follow these patterns:

1. For unauthenticated endpoints:
   ```typescript
   it('should return the expected response', async () => {
     const response = await request(app).get('/your-endpoint');
     expect(response.status).toBe(200);
     // Additional assertions...
   });
   ```

2. For authenticated endpoints:
   ```typescript
   it('should require authentication', async () => {
     // Test without token
     const noAuthResponse = await request(app).get('/your-protected-endpoint');
     expect(noAuthResponse.status).toBe(401);
     
     // Test with token
     const token = generateTestToken();
     const authResponse = await request(app)
       .get('/your-protected-endpoint')
       .set('Authorization', `Bearer ${token}`);
     expect(authResponse.status).toBe(200);
   });
   ```

3. For ownership checks:
   ```typescript
   it('should check ownership', async () => {
     // Set up a project with a different owner
     // Test access with a token from another user
     // Expect 403 Forbidden
   });
   ```

## Best Practices

1. **Isolate Tests**: Each test should be independent and not rely on the state from other tests.
2. **Mock External Dependencies**: Database calls, authentication, etc. should be mocked.
3. **Test Edge Cases**: Include tests for invalid inputs, unauthorized access, etc.
4. **Clear Test Names**: Use descriptive names for your test cases.
5. **Test Driven Development**: Consider writing tests before implementing features.