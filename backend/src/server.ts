// src/server.ts

// --- Imports ---
// Import necessary libraries: express for the web server, PrismaClient for database access,
// cors for allowing browser requests, and prom-client for monitoring.
// { Request, Response, NextFunction } are TypeScript types for Express route handlers.
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client'; // Prisma's main class to interact with the database.
import cors from 'cors';
import promClient from 'prom-client'; // Library for Prometheus metrics.

// --- Prometheus Setup (Monitoring) ---
// Start collecting default Node.js performance metrics.
promClient.collectDefaultMetrics();

// Define custom metrics to track request duration (Histogram) and total requests (Counter).
// labelNames help categorize metrics (e.g., by route or status code).
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [50, 100, 200, 500, 1000, 2500, 5000]
});
const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code']
});

// --- Prisma Client Setup ---
// Create an instance of the Prisma Client to connect to the database.
// Prisma reads your `schema.prisma` file to know the database structure.
const prisma = new PrismaClient({
  datasources: {
    db: { // 'db' typically matches the datasource name in schema.prisma
      // Use the database connection URL from environment variable `DATABASE_URL` if available,
      // otherwise, use a default local PostgreSQL connection string.
      url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/shelfware?schema=public"
    }
  }
});

// Create an Express application instance.
const app = express();

// Define the server port. Use environment variable or default to 3001.
// `parseInt(..., 10)` converts the string value to a base-10 number.
// `: number` is a TypeScript type annotation.
const PORT: number = parseInt(process.env.BACKEND_PORT || '3001', 10);

// Define allowed origins for CORS (Cross-Origin Resource Sharing).
// Use environment variable or default to common local development frontend URLs.
const CORS_ORIGIN: string | string[] = process.env.CORS_ORIGIN || [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001'
];

// --- Middlewares ---
// Middlewares are functions that run on incoming requests before the route handler.

// Enable CORS using the defined origins and allowed methods/headers.
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Parse incoming request bodies as JSON and make them available on `req.body`.
app.use(express.json());

// --- Prometheus Request Tracking Middleware ---
// Custom middleware to record metrics for each request.
app.use((req: Request, res: Response, next: NextFunction) => {
  const end = httpRequestDurationMicroseconds.startTimer(); // Start timer
  res.on('finish', () => { // When the response is sent
    // Normalize the route path (e.g., /api/projects/123 -> /api/projects/:id) for consistent metrics.
    const route = req.route ? req.route.path : req.path.replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|^\/[0-9]+$/g, '/:id');
    const labels = { method: req.method, route: route, code: res.statusCode.toString() };
    end(labels); // Record duration with labels
    httpRequestsTotal.inc(labels); // Increment request counter with labels
  });
  next(); // Pass control to the next middleware or route handler.
});

// --- Health & Readiness Routes ---
// These endpoints are often used by orchestration systems (like Kubernetes).

// `/health`: Liveness probe - checks if the server process is running.
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' }); // Simple "I'm alive" response.
});

// `/ready`: Readiness probe - checks if the server is ready to handle requests (including DB connection).
// `async` keyword allows using `await` inside the function for asynchronous operations (like DB queries).
app.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check database connection by executing a simple query using Prisma.
    // `await` pauses execution until the promise from `$queryRaw` resolves.
    await prisma.$queryRaw`SELECT 1`; // Raw SQL query via Prisma.
    res.status(200).json({ status: 'READY', checks: { database: 'OK' } });
  } catch (error) {
    console.error("Readiness check failed:", error);
    res.status(503).json({ // 503 Service Unavailable
      status: 'UNAVAILABLE',
      checks: { database: 'FAILING' },
      error: 'Database connection failed'
    });
  }
});

// --- Prometheus Metrics Route ---
// `/metrics`: Exposes the collected metrics in a format Prometheus can understand.
app.get('/metrics', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', promClient.register.contentType); // Set correct content type
    res.end(await promClient.register.metrics()); // Send metrics data
  } catch (error) {
    console.error("Failed to retrieve metrics:", error);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// --- API Routes ---
// Define the main API endpoints for interacting with 'project' data.

// Root route - Simple check to see if the API is running.
app.get('/', (req: Request, res: Response) => {
  res.send('Shelfware API is running');
});

// GET /api/projects: Retrieve all projects.
// `async`/`await` is used because database operations are asynchronous.
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    // Use Prisma Client to find all records in the 'project' table.
    // `prisma.project` refers to the Project model defined in schema.prisma.
    // `findMany` retrieves multiple records.
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' } // Optional: order results by creation date, descending.
    });
    res.json(projects); // Send the list of projects as a JSON response.
  } catch (error) {
    console.error("Failed to retrieve projects:", error);
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

// GET /api/projects/:id: Retrieve a single project by its ID.
// `:id` is a route parameter. Its value is available in `req.params.id`.
app.get('/api/projects/:id', async (req: Request, res: Response) => {
  const { id } = req.params; // Extract the ID from the URL parameters.
  try {
    // Use Prisma Client to find a unique project where the 'id' matches.
    const project = await prisma.project.findUnique({
      where: { id } // Specify the condition for finding the record.
    });
    if (!project) { // If no project is found with that ID
      return res.status(404).json({ error: 'Project not found' }); // Send 404 Not Found.
    }
    res.json(project); // Send the found project as JSON.
  } catch (error) {
    console.error("Failed to retrieve project:", error);
    // Specific error handling for Prisma (e.g., P2023 = invalid ID format).
    if (error instanceof Error && 'code' in error && error.code === 'P2023') {
         return res.status(400).json({ error: 'Invalid project ID format' });
    }
    res.status(500).json({ error: 'Failed to retrieve project' });
  }
});

// POST /api/projects: Create a new project.
app.post('/api/projects', async (req: Request, res: Response) => {
  // Extract project data from the request body (parsed by `express.json()` middleware).
  const { title, status, description, githubUrl, deployedUrl, docsUrl, hardwareInfo } = req.body;

  // Basic validation.
  if (!title || !status) {
    return res.status(400).json({ error: 'Title and status are required' });
  }

  try {
    // Use Prisma Client to create a new project record in the database.
    const newProject = await prisma.project.create({
      data: { // Provide the data for the new record. Fields match schema.prisma.
        title,
        status,
        description,
        githubUrl,
        deployedUrl,
        docsUrl,
        hardwareInfo
      },
    });
    res.status(201).json(newProject); // Send 201 Created status and the new project data.
  } catch (error) {
    console.error("Failed to create project:", error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id: Update an existing project by ID.
app.put('/api/projects/:id', async (req: Request, res: Response) => {
  const { id } = req.params; // Get ID from URL.
  const { title, status, description, githubUrl, deployedUrl, docsUrl, hardwareInfo } = req.body; // Get updated data from body.

  if (!title || !status) {
    return res.status(400).json({ error: 'Title and status are required' });
  }

  try {
    // Use Prisma Client to update the project matching the ID.
    const updatedProject = await prisma.project.update({
      where: { id }, // Specify which project to update.
      data: { // Provide the new data.
        title,
        status,
        description,
        githubUrl,
        deployedUrl,
        docsUrl,
        hardwareInfo
      }
    });
    res.json(updatedProject); // Send the updated project data.
  } catch (error) {
    console.error("Failed to update project:", error);
    // Handle specific Prisma errors: P2025 = Record to update not found.
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        return res.status(404).json({ error: 'Project not found' });
    }
    // P2023 = Invalid ID format.
    if (error instanceof Error && 'code' in error && error.code === 'P2023') {
        return res.status(400).json({ error: 'Invalid project ID format' });
    }
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id: Delete a project by ID.
app.delete('/api/projects/:id', async (req: Request, res: Response) => {
  const { id } = req.params; // Get ID from URL.

  try {
    // Use Prisma Client to delete the project matching the ID.
    await prisma.project.delete({
      where: { id } // Specify which project to delete.
    });
    res.status(204).send(); // Send 204 No Content status on successful deletion.
  } catch (error) {
    console.error("Failed to delete project:", error);
    // Handle specific Prisma errors: P2025 = Record to delete not found.
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        return res.status(404).json({ error: 'Project not found' });
    }
    // P2023 = Invalid ID format.
    if (error instanceof Error && 'code' in error && error.code === 'P2023') {
        return res.status(400).json({ error: 'Invalid project ID format' });
    }
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// --- Global Error Handling Middleware ---
// A catch-all middleware for errors not handled by specific route handlers.
// Note the extra `err` parameter - this signature identifies it as error-handling middleware.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", err);
    // Avoid sending detailed error messages/stack traces in production for security.
    const errorMessage = process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : err.message;
    res.status(500).json({ error: errorMessage });
});

// --- Start Server ---
// Start the Express server and listen for incoming connections.
// '0.0.0.0' makes the server listen on all available network interfaces (important for Docker).
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running at http://0.0.0.0:${PORT}`);
  console.log(`Using database: ${process.env.DATABASE_URL ? 'DATABASE_URL env var' : 'Default local PostgreSQL'}`);
  console.log(`CORS enabled for: ${Array.isArray(CORS_ORIGIN) ? CORS_ORIGIN.join(', ') : CORS_ORIGIN}`);
  // Log endpoint URLs for easy access during development.
  console.log(`Health endpoint: http://localhost:${PORT}/health`);
  console.log(`Readiness endpoint: http://localhost:${PORT}/ready`);
  console.log(`Metrics endpoint: http://localhost:${PORT}/metrics`);
});