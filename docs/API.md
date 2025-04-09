# API Documentation

This document provides a comprehensive reference for the PXL Shelfware Tracker API endpoints.

## Base URL

All API endpoints are relative to:

```
http://localhost:3001/api
```

For production, this would be your deployed API URL.

## Authentication

Most endpoints require authentication using JWT tokens. To authenticate:

1. Obtain a token by registering or logging in
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

## Response Format

All responses are in JSON format.

**Success Response**
```json
{
  "id": "clXXXXXXXXXXXXX",
  "title": "Project Example",
  "status": "In Progress",
  // Other fields...
}
```

**Error Response**
```json
{
  "error": "Error message",
  "message": "Additional details (optional)"
}
```

## Authentication Endpoints

### Register User

Creates a new user account and returns a JWT token.

```
POST /auth/register
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name" // Optional
}
```

**Response (201 Created)**
```json
{
  "user": {
    "id": "clXXXXXXXXXXXXX",
    "email": "user@example.com",
    "name": "User Name"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**
- `400 Bad Request`: Email or password missing
- `400 Bad Request`: Email already in use

### Login

Authenticates a user and returns a JWT token.

```
POST /auth/login
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK)**
```json
{
  "user": {
    "id": "clXXXXXXXXXXXXX",
    "email": "user@example.com",
    "name": "User Name"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**
- `401 Unauthorized`: Invalid credentials

### Get User Profile

Returns the authenticated user's profile.

```
GET /auth/profile
```

**Headers**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK)**
```json
{
  "id": "clXXXXXXXXXXXXX",
  "email": "user@example.com",
  "name": "User Name"
}
```

**Error Responses**
- `401 Unauthorized`: Missing or invalid token

## Project Endpoints

### Get All Projects

For authenticated users, returns only their projects. 

```
GET /projects
```

**Headers (Optional)**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK)**
```json
[
  {
    "id": "clXXXXXXXXXXXXX",
    "title": "Project 1",
    "description": "Project description",
    "status": "In Progress",
    "githubUrl": "https://github.com/user/project1",
    "deployedUrl": "https://project1.example.com",
    "docsUrl": "https://docs.project1.example.com",
    "hardwareInfo": { 
      "cpu": "Intel i7", 
      "ram": "16GB" 
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "userId": "clXXXXXXXXXXXXX"
  }
  // More projects...
]
```

### Get Project by ID

Returns a specific project. Authentication is required, and users can only access their own projects.

```
GET /projects/:id
```

**Headers**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK)**
```json
{
  "id": "clXXXXXXXXXXXXX",
  "title": "Project 1",
  "description": "Project description",
  "status": "In Progress",
  "githubUrl": "https://github.com/user/project1",
  "deployedUrl": "https://project1.example.com",
  "docsUrl": "https://docs.project1.example.com",
  "hardwareInfo": { 
    "cpu": "Intel i7", 
    "ram": "16GB" 
  },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "userId": "clXXXXXXXXXXXXX"
}
```

**Error Responses**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to access this project
- `404 Not Found`: Project not found

### Create Project

Creates a new project for the authenticated user.

```
POST /projects
```

**Headers**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body**
```json
{
  "title": "New Project",
  "status": "Planning",
  "description": "Project description",
  "githubUrl": "https://github.com/user/project",
  "deployedUrl": "https://project.example.com",
  "docsUrl": "https://docs.project.example.com",
  "hardwareInfo": {
    "cpu": "Intel i7",
    "ram": "16GB"
  }
}
```

**Response (201 Created)**
```json
{
  "id": "clXXXXXXXXXXXXX",
  "title": "New Project",
  "status": "Planning",
  "description": "Project description",
  "githubUrl": "https://github.com/user/project",
  "deployedUrl": "https://project.example.com",
  "docsUrl": "https://docs.project.example.com",
  "hardwareInfo": {
    "cpu": "Intel i7",
    "ram": "16GB"
  },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "userId": "clXXXXXXXXXXXXX"
}
```

**Error Responses**
- `400 Bad Request`: Missing required fields (title and status)
- `401 Unauthorized`: Not authenticated

### Update Project

Updates an existing project. Authentication is required, and users can only update their own projects.

```
PUT /projects/:id
```

**Headers**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body**
```json
{
  "title": "Updated Project",
  "status": "In Progress",
  "description": "Updated description",
  "githubUrl": "https://github.com/user/updated-project",
  "deployedUrl": "https://updated-project.example.com",
  "docsUrl": "https://docs.updated-project.example.com",
  "hardwareInfo": {
    "cpu": "Intel i9",
    "ram": "32GB"
  }
}
```

**Response (200 OK)**
```json
{
  "id": "clXXXXXXXXXXXXX",
  "title": "Updated Project",
  "status": "In Progress",
  "description": "Updated description",
  "githubUrl": "https://github.com/user/updated-project",
  "deployedUrl": "https://updated-project.example.com",
  "docsUrl": "https://docs.updated-project.example.com",
  "hardwareInfo": {
    "cpu": "Intel i9",
    "ram": "32GB"
  },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-03T00:00:00.000Z",
  "userId": "clXXXXXXXXXXXXX"
}
```

**Error Responses**
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to modify this project
- `404 Not Found`: Project not found

### Delete Project

Deletes a project. Authentication is required, and users can only delete their own projects.

```
DELETE /projects/:id
```

**Headers**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (204 No Content)**
No response body is returned on successful deletion.

**Error Responses**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to delete this project
- `404 Not Found`: Project not found

## Health & Monitoring Endpoints

### Health Check

Checks if the application is running.

```
GET /health
```

**Response (200 OK)**
```json
{
  "status": "UP"
}
```

### Readiness Check

Checks if the application is ready to handle requests (including database connection).

```
GET /ready
```

**Response (200 OK)**
```json
{
  "status": "READY",
  "checks": { 
    "database": "OK" 
  }
}
```

**Error Response (503 Service Unavailable)**
```json
{
  "status": "UNAVAILABLE",
  "checks": { 
    "database": "FAILING" 
  },
  "error": "Database connection failed"
}
```

### Metrics

Exposes Prometheus metrics for monitoring.

```
GET /metrics
```

**Response (200 OK)**
Returns Prometheus-formatted metrics.

## Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - The request was successful |
| 201 | Created - A resource was successfully created |
| 204 | No Content - The request was successful (used for DELETE) |
| 400 | Bad Request - Invalid request format or parameters |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Authenticated but not authorized |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Something went wrong on the server |
| 503 | Service Unavailable - Service temporary unavailable (e.g., database down) |

## Examples

### curl Examples

Register a user:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"User Name"}'
```

Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Create a project:
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"API Test Project","description":"Created via API","status":"Planning"}'
```

Get all projects:
```bash
curl -X GET http://localhost:3001/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Delete a project:
```bash
curl -X DELETE http://localhost:3001/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```