# PXL Shelfware Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack application designed to help developers and creators track their personal projects, side ventures, and brilliant ideas that might otherwise end up on the "shelf". Never forget about your half-finished projects again!

![Screenshot](assets/screenshot1.png)

## Motivation

How many great ideas or side projects have you started, only to forget the details, lose the links, or abandon them halfway? Shelfware Tracker provides a simple, centralized place to manage your project portfolio, keeping all the essential information organized and accessible.

## Features

- ✅ Project management dashboard
- ✅ Status tracking (Planning, In Progress, Completed, Abandoned)
- ✅ User authentication with JWT
- ✅ Project links to GitHub, deployed apps, and documentation
- ✅ Hardware/component information storage (JSON)
- ✅ Search and filter capabilities
- ✅ RESTful API
- ✅ Responsive design
- ✅ Light/dark theme

## Contents

- [Motivation](#motivation)
- [Features](#features)
- [Contents](#contents)
- [Tech Stack](#tech-stack)
  - [Backend](#backend)
  - [Database](#database)
  - [Frontend](#frontend)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Database Setup](#1-database-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Verifying Setup](#4-verifying-setup)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Project Endpoints](#project-endpoints)
  - [Health \& Monitoring](#health--monitoring)
- [Testing the API](#testing-the-api)
  - [Using cURL](#using-curl)
- [Project Structure](#project-structure)
- [Dependency Information](#dependency-information)
  - [Backend Dependencies](#backend-dependencies)
  - [Frontend Dependencies](#frontend-dependencies)
- [Documentation](#documentation)
- [Running Tests](#running-tests)
  - [Backend Tests](#backend-tests)
- [License](#license)


## Tech Stack

### Backend
- [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/) for database interaction
- [Passport.js](https://www.passportjs.org/) for authentication
- [JWT](https://jwt.io/) for secure tokens
- [Prometheus Client](https://github.com/siimon/prom-client) for metrics

### Database
- [PostgreSQL](https://www.postgresql.org/)

### Frontend
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Router](https://reactrouter.com/) for navigation
- [Axios](https://axios-http.com/) for API communication
- CSS for styling

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for database setup)

### 1. Database Setup

The quickest way to get started is using Docker to set up PostgreSQL:

```bash
# Start the PostgreSQL container
docker compose up -d
```

This will start a PostgreSQL instance with the following configuration:
- Port: 5432
- Username: postgres
- Password: postgres
- Database: shelfware

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
```

Edit the `.env` file to ensure it contains the correct database connection string:
```
# If using Docker setup
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shelfware?schema=public"

# If using manual PostgreSQL setup, replace with your password
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/shelfware?schema=public"

# JWT Secret (generate a random string for production)
JWT_SECRET="generate-a-secure-random-string-for-production"

# Server port
BACKEND_PORT=3001

# CORS setting (allows requests from the frontend)
CORS_ORIGIN=http://localhost:5173
```

Then continue with setup:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with demo data
npm run seed

# Start the development server
npm run dev
```

The backend should now be running at http://localhost:3001.

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Optional: Create .env file for frontend
echo "VITE_API_URL=http://localhost:3001" > .env

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:5173.

### 4. Verifying Setup

To verify everything is working correctly:

1. Open http://localhost:3001/health in your browser - should show `{"status":"UP"}`
2. Open http://localhost:3001/ready in your browser - should show `{"status":"READY","checks":{"database":"OK"}}`
3. Open http://localhost:5173 in your browser - should display the PXL Shelfware Tracker application
4. Try logging in with a test user (if you ran `npm run seed-users`):
   - Email: demo@example.com
   - Password: password123

## Authentication

The application implements token-based authentication using JWT. Demo accounts are created if you run the user seeding script:

```bash
# From the backend directory
npm run seed-users
```

This creates the following test accounts:
- Email: demo@example.com
- Password: password123

- Email: admin@example.com
- Password: admin123

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login and get JWT token |
| GET | /api/auth/profile | Get the current user's profile |

### Project Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | Get all projects (authenticated users see only their own) |
| GET | /api/projects/:id | Get a specific project by ID |
| POST | /api/projects | Create a new project |
| PUT | /api/projects/:id | Update an existing project |
| DELETE | /api/projects/:id | Delete a project |

### Health & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Liveness check (application is running) |
| GET | /ready | Readiness check (database is connected) |
| GET | /metrics | Prometheus metrics |

## Testing the API

### Using cURL

Register a new user:
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

Create a project (replace YOUR_TOKEN with the token from login):
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"API Test Project","description":"Created via API","status":"Planning","hardwareInfo":{"platform":"Node.js","database":"PostgreSQL"}}'
```

## Project Structure

```
shelfware/
├── backend/              # Node.js/Express API Server
│   ├── prisma/           # Prisma schema, migrations, seed script
│   │   ├── migrations/
│   │   ├── schema.prisma # Database schema
│   │   ├── seed.ts       # Project seeding script
│   ├── src/
│   │   ├── config/       # Configuration (passport, JWT)
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Authentication middleware
│   │   ├── routes/       # Route definitions
│   │   └── server.ts     # Main server file
│   ├── tests/            # Unit and integration tests
│   └── .env.example      # Environment variables template
│
├── frontend/             # React Frontend Application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── assets/       # Images and other assets
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context (authentication)
│   │   ├── interfaces/   # TypeScript interfaces
│   │   ├── pages/        # Application pages
│   │   ├── services/     # API communication
│   │   └── utils/        # Helper functions
│   └── index.html        # HTML entry point
│
├── compose.yml           # Docker Compose configuration
└── README.md             # This file
```

## Dependency Information

### Backend Dependencies

The backend uses the following key dependencies:

```bash
# Core dependencies
npm install express @types/express                 # Web framework
npm install typescript ts-node @types/node         # TypeScript support
npm install prisma @prisma/client                  # ORM for database access
npm install passport passport-jwt passport-local    # Authentication
npm install jsonwebtoken bcrypt                    # JWT and password hashing
npm install cors @types/cors                       # CORS support
npm install prom-client                            # Prometheus metrics

# Development dependencies
npm install --save-dev nodemon                     # Auto-reload during development
npm install --save-dev jest ts-jest @types/jest    # Testing framework
npm install --save-dev supertest @types/supertest  # API testing
```

### Frontend Dependencies

The frontend uses the following key dependencies:

```bash
# Core dependencies
npm install react react-dom                        # React library
npm install react-router-dom                       # Routing
npm install axios                                  # HTTP client

# Development dependencies
npm install --save-dev vite                        # Build tool
npm install --save-dev typescript @types/react     # TypeScript support
```

## Documentation

For more detailed documentation, see:

- [Authentication System](./docs/AUTHENTICATION.md) - Details on the JWT authentication implementation
- [API Documentation](./docs/API.md) - Complete API reference
- [Testing Guide](./docs/TESTING.md) - Guide to running and writing tests

## Running Tests

### Backend Tests

```bash
# Make sure you're in the backend directory
cd backend

# Install testing dependencies (if not already installed)
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest

# Run all tests
npm test

# Run a specific test file
npm test -- tests/auth.test.ts

# Run tests with coverage report
npm test -- --coverage
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
