# PXL Shelfware Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack application designed to help developers and creators track their personal projects, side ventures, and brilliant ideas that might otherwise end up on the "shelf". Never forget about your half-finished projects again!

![Screenshot](assets/screenshot1.png)

## Motivation

How many great ideas or side projects have you started, only to forget the details, lose the links, or abandon them halfway? Shelfware Tracker provides a simple, centralized place to manage your project portfolio, keeping all the essential information organized and accessible.

## Features

- Project management dashboard
- Status tracking (Planning, In Progress, Completed, Abandoned)
- User authentication with JWT
- Links to GitHub, deployed apps, and documentation
- Hardware/component information storage (JSON)
- Search and filter capabilities
- RESTful API
- Responsive design (desktop and mobile)
- Light/dark theme

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

### 1. Database Setup (using Docker)

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
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Seed the database with initial data
npm run seed

# Add test users (optional)
npm run seed-users

# Start the development server
npm run dev
```

The backend should now be running at http://localhost:3001.

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:5173.

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
│   │   └── seed-users.ts # User seeding script
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

## Documentation

For more detailed documentation, see:

- [Authentication System](./docs/AUTHENTICATION.md) - Details on the JWT authentication implementation
- [API Documentation](./docs/API.md) - Complete API reference
- [Testing Guide](./docs/TESTING.md) - Guide to running and writing tests

## Running Tests

Backend tests:
```bash
cd backend
npm test
```
