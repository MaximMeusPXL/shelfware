# PXL Shelfware Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack PXL sample application designed to help developers and creators track their personal projects, side ventures, and brilliant ideas that might otherwise end up on the "shelf". Never forget about your half-finished projects again!

## Motivation

How many great ideas or side projects have you started, only to forget the details, lose the links, or abandon them halfway? Shelfware Tracker provides a simple, centralized place to manage your project portfolio, keeping all the essential information organized and accessible.

## Screenshots

![Screenshot of Shelfware Tracker](screenshot1.png)

## Overview

Shelfware Tracker helps you keep tabs on your projects, including:

- Project status (e.g., Planning, In Progress, Completed, Shelved, Abandoned)
- Descriptions, notes, and key details
- Links to GitHub repositories, live deployments, and documentation
- Hardware requirements or specific configurations (stored as JSON)

The application features a clean, responsive interface for managing your projects, with capabilities for searching and filtering.

## Features

- **Project Management**: Create, view, edit, and delete projects.
- **Status Tracking**: Assign and update the status of each project.
- **Link Storage**: Keep track of relevant URLs (GitHub, Deployed App, Docs).
- **Hardware Info**: Store structured hardware details using JSON.
- **Search & Filter**: Easily find projects by title or filter by status (Future Enhancement).
- **Responsive Design**: Accessible on both desktop and mobile devices.
- **API**: A clear backend API for data management.

## Tech Stack

### Backend
- [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/) for database interaction
- [Prometheus Client](https://github.com/siimon/prom-client) for metrics

### Database
- [PostgreSQL](https://www.postgresql.org/)
- *Planned Support:* MariaDB, MongoDB

### Frontend
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Router](https://reactrouter.com/) for navigation
- [Axios](https://axios-http.com/) for API communication
- Standard CSS / CSS Modules for styling (or specify your styling library e.g., Tailwind CSS)

## Project Structure
```
shelfware/
├── backend/              # Node.js/Express API Server
│   ├── prisma/           # Prisma schema, migrations, seed script
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts       # Seeding script
│   ├── src/
│   │   └── server.ts     # Express app setup, routes, middleware
│   ├── .env.example      # Example environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # React Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── interfaces/   # TypeScript interfaces/types
│   │   ├── pages/        # Application pages/views
│   │   ├── services/     # API communication layer (Axios)
│   │   ├── App.tsx       # Main application component
│   │   └── main.tsx      # Application entry point
│   ├── package.json
│   └── tsconfig.json
│
├── compose.yml           # Docker Compose for database (and optionally apps)
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for database setup)
- A running PostgreSQL instance (Docker setup provided below)

### 1. Database Setup (using Docker)

This command starts a PostgreSQL container using the configuration in docker-compose.yml.

```bash
# Make sure Docker Desktop is running
docker compose up -d postgres # Or just `docker compose up -d` if postgres is the only service
```

Wait a few seconds for the database container to initialize.

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example and configure it
cp .env.example .env
# --> Edit .env and set your DATABASE_URL, BACKEND_PORT, CORS_ORIGIN etc.
# Example .env content:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shelfware?schema=public"
# BACKEND_PORT=3001
# CORS_ORIGIN=http://localhost:5173 # Adjust if your frontend runs elsewhere

# Seed the database with initial data
npx prisma db seed

# Start the development server
npm run dev
```

The backend should now be running (typically on http://localhost:3001).

### 3. Frontend Setup

```bash
cd ../frontend # Navigate back to root, then into frontend

# Install dependencies
npm install

# Create .env file if needed for frontend variables (e.g., API URL)
# e.g., VITE_API_BASE_URL=http://localhost:3001

# Start the development server
npm run dev
```

The frontend development server will start. Open your browser to the URL shown (typically http://localhost:5173).

### Running the Full Stack with Docker Compose (Optional)

If your compose.yml is configured to build and run the backend and frontend services as well, you might be able to simply run:

```bash
# From the root directory
docker compose up --build
```

This would handle starting the database, backend, and frontend together. Ensure your Dockerfiles and docker-compose.yml are set up correctly for this.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Liveness probe (checks if the server is running) |
| GET | /ready | Readiness probe (checks DB connection, etc.) |
| GET | /metrics | Exposes application metrics for Prometheus scraping |
| GET | /api/projects | Get a list of all projects |
| GET | /api/projects/:id | Get details of a specific project by its ID |
| POST | /api/projects | Create a new project |
| PUT | /api/projects/:id | Update an existing project by its ID |
| DELETE | /api/projects/:id | Delete a project by its ID |

## Monitoring

- `/health`: Used by orchestrators or monitoring tools to check if the application process is alive (liveness). Returns 200 OK if the server is up.
- `/ready`: Used to check if the application is ready to accept traffic (readiness), including checking dependencies like the database connection. Returns 200 OK if ready, 503 Service Unavailable otherwise.
- `/metrics`: Exposes operational metrics (like request counts, latency, memory usage) in a format compatible with Prometheus. Configure Prometheus to scrape this endpoint for monitoring and alerting.

## Project Data Model (Prisma)

The core data structure for a project is defined in `backend/prisma/schema.prisma`. It generally includes fields like:

```typescript
// backend/prisma/schema.prisma (simplified representation)
model Project {
  id          String   @id @default(cuid()) // Or uuid()
  title       String
  status      String   // for now
  description String?
  githubUrl   String?
  deployedUrl String?
  docsUrl     String?
  hardwareInfo Json?    // Store arbitrary JSON data
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Note: The frontend might use a slightly different TypeScript interface (e.g., in `frontend/src/interfaces/`) derived from this model.

## Future Enhancements

- User authentication (e.g., using JWT, OAuth) for personal project lists.
- Project tagging or categorization for better organization.
- Advanced filtering and sorting options on the frontend.
- File attachments per project (e.g., mockups, diagrams).
- Implement database support for MariaDB and MongoDB.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Tom Cool / tomcoolpxl
