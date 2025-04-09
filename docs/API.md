# API Documentation

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Authentication Endpoints](#authentication-endpoints)
  - [Register User](#register-user)
  - [Login](#login)
  - [Get User Profile](#get-user-profile)
- [Project Endpoints](#project-endpoints)
  - [Get All Projects](#get-all-projects)
  - [Get Project by ID](#get-project-by-id)
  - [Create Project](#create-project)
  - [Update Project](#update-project)
  - [Delete Project](#delete-project)
- [Health \& Monitoring Endpoints](#health--monitoring-endpoints)
  - [Health Check](#health-check)
  - [Readiness Check](#readiness-check)
  - [Metrics](#metrics)
- [Status Codes](#status-codes)
- [Examples](#examples)
  - [curl Examples](#curl-examples)


This document provides a comprehensive reference for the PXL Shelfware Tracker API endpoints.

## <a name='BaseURL'></a>Base URL

All API endpoints are relative to:

```
http://localhost:3001/api
```

For production, this would be your deployed API URL.

## <a name='Authentication'></a>Authentication

Most endpoints require authentication using JWT tokens. To authenticate:

1. Obtain a token by registering or logging in
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

## <a name='ResponseFormat'></a>Response Format

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

## <a name='AuthenticationEndpoints'></a>Authentication Endpoints

### <a name='RegisterUser'></a>Register User

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

### <a name='Login'></a>Login

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

### <a name='GetUserProfile'></a>Get User Profile

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

## <a name='ProjectEndpoints'></a>Project Endpoints

### <a name='GetAllProjects'></a>Get All Projects

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

### <a name='GetProjectbyID'></a>Get Project by ID

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

### <a name='CreateProject'></a>Create Project

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

### <a name='UpdateProject'></a>Update Project

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

### <a name='DeleteProject'></a>Delete Project

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

## <a name='HealthMonitoringEndpoints'></a>Health & Monitoring Endpoints

### <a name='HealthCheck'></a>Health Check

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

### <a name='ReadinessCheck'></a>Readiness Check

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

### <a name='Metrics'></a>Metrics

Exposes Prometheus metrics for monitoring.

```
GET /metrics
```

**Response (200 OK)**
Returns Prometheus-formatted metrics.

## <a name='StatusCodes'></a>Status Codes

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

## <a name='Examples'></a>Examples

### <a name='curlExamples'></a>curl Examples

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