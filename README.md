# PXL Shelfware Tracker

A full-stack PXL sample application for tracking your personal projects and side ventures. Never forget about your half-finished projects again!

## Overview

Shelfware Tracker helps developers and creators keep track of their side projects, including:
- Project status (Planning, In Progress, Completed, Abandoned)
- Project descriptions and details
- GitHub, deployment, and documentation links
- Hardware requirements or configurations

The application provides a clean, responsive interface for managing your project portfolio, with features for searching, filtering, and organizing your work.

## Features

- **Project Management**: Create, view, edit, and delete projects
- **Status Tracking**: Track the current status of each project
- **Search & Filter**: Find projects by title or filter by status
- **Responsive Design**: Use on desktop or mobile devices
- **Project Details**: Store comprehensive information about each project
- **Hardware Info**: Keep track of hardware requirements in JSON format

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM

### Database
- PostgreSQL database
- Mariadb (planned)
- Mongodb (planned)

### Frontend
- React
- TypeScript
- React Router for navigation
- Axios for API communication
- CSS for styling

## Project Structure

```
shelfware/
├── backend/             # Express server
│   ├── src/
│   │   ├── server.ts    # Express application
│   ├── prisma/          # Prisma schema and migrations
│   └── ...
│
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── services/    # API services
│   │   ├── interfaces/  # TypeScript interfaces
│   │   └── utils/       # Utility functions
│   └── ...
```

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with database connection details:
   ```
   DATABASE_URL="postgresql://postgress:pxlpxlpxl@db:5432/shelfware?schema=public"
   BACKEND_PORT=3001
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

## Screenshots

![screenshot](screenshot1.png)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/projects | Get all projects |
| GET    | /api/projects/:id | Get project by ID |
| POST   | /api/projects | Create a new project |
| PUT    | /api/projects/:id | Update a project |
| DELETE | /api/projects/:id | Delete a project |

## Project Model

```typescript
interface Project {
  id: number;
  title: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'Abandoned';
  description?: string;
  githubUrl?: string;
  deployedUrl?: string;
  docsUrl?: string;
  hardwareInfo?: any; // JSON data
  createdAt: Date;
  updatedAt: Date;
}
```

## Future Enhancements

- User authentication for personal project tracking
- Project tagging/categorization
- File attachments
- Task/milestone tracking within projects
- Team collaboration features
- Dark mode theme

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

*[Tom Cool/tomcoolpxl]*
