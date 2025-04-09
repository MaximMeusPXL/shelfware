# Testing Guide

- [Overview](#overview)
- [Running Tests](#running-tests)
  - [Backend Tests](#backend-tests)
- [Test Structure](#test-structure)
- [Mock Strategy](#mock-strategy)
  - [Mocking Prisma](#mocking-prisma)


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
        // to be continued...