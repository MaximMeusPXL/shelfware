// src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import promClient from 'prom-client'; // Import prom-client

// --- Prometheus Setup ---
// Enable default metrics collection (CPU, memory, event loop lag, etc.)
promClient.collectDefaultMetrics();

// Create custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [50, 100, 200, 500, 1000, 2500, 5000] // Buckets in milliseconds
});

const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code']
});

// --- Prisma Client Setup ---
// Initialize Prisma client with a fallback connection string if DATABASE_URL is not defined
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/shelfware?schema=public"
    }
  }
});

const app = express();

// Parse PORT as a number with default value 3001
const PORT = parseInt(process.env.BACKEND_PORT || '3001', 10);

// Default CORS to allow localhost development on common ports
const CORS_ORIGIN = process.env.CORS_ORIGIN || [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001'
];

// --- Middlewares ---
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- Prometheus Request Tracking Middleware ---
// This should come *after* static file middleware (if any) but *before* your main routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    // Normalize path to avoid high cardinality issues with IDs in URLs
    // Example: /api/projects/123 -> /api/projects/:id
    const route = req.route ? req.route.path : req.path.replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|^\/[0-9]+$/g, '/:id');

    const labels = {
        method: req.method,
        // Use req.route.path if available for better accuracy, otherwise normalize req.path
        route: route,
        code: res.statusCode.toString()
    };
    // Measure duration
    end(labels);
    // Increment counter
    httpRequestsTotal.inc(labels);
  });
  next();
});


// --- Health & Readiness Routes ---

/**
 * @route GET /health
 * @description Liveness probe. Checks if the server process is running.
 * Does *not* check external dependencies like the database.
 * Returns 200 OK if the server is up.
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

/**
 * @route GET /ready
 * @description Readiness probe. Checks if the server is ready to handle requests.
 * Includes checks for critical dependencies (e.g., database connection).
 * Returns 200 OK if ready, 503 Service Unavailable otherwise.
 */
app.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check database connection - Prisma doesn't have a direct .ping()
    // Running a simple, fast query is a common way to check.
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'READY', checks: { database: 'OK' } });
  } catch (error) {
    console.error("Readiness check failed:", error);
    res.status(503).json({
        status: 'UNAVAILABLE',
        checks: { database: 'FAILING' },
        error: 'Database connection failed'
    });
  }
});

// --- Prometheus Metrics Route ---

/**
 * @route GET /metrics
 * @description Exposes metrics in Prometheus format.
 */
app.get('/metrics', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (error) {
    console.error("Failed to retrieve metrics:", error);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});


// --- API Routes ---
// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Shelfware API is running');
});

// Get all projects
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    console.error("Failed to retrieve projects:", error);
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

// Get a single project by ID
app.get('/api/projects/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id }
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error("Failed to retrieve project:", error);
    // Handle potential Prisma errors like invalid ID format
    if (error instanceof Error && 'code' in error && error.code === 'P2023') {
         return res.status(400).json({ error: 'Invalid project ID format' });
    }
    res.status(500).json({ error: 'Failed to retrieve project' });
  }
});

// Create a new project
app.post('/api/projects', async (req: Request, res: Response) => {
  const { title, status, description, githubUrl, deployedUrl, docsUrl, hardwareInfo } = req.body;

  if (!title || !status) {
    return res.status(400).json({ error: 'Title and status are required' });
  }

  try {
    const newProject = await prisma.project.create({
      data: {
        title,
        status,
        description,
        githubUrl,
        deployedUrl,
        docsUrl,
        hardwareInfo
      },
    });
    res.status(201).json(newProject);
  } catch (error) {
    console.error("Failed to create project:", error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update a project
app.put('/api/projects/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, status, description, githubUrl, deployedUrl, docsUrl, hardwareInfo } = req.body;

  if (!title || !status) {
    return res.status(400).json({ error: 'Title and status are required' });
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title,
        status,
        description,
        githubUrl,
        deployedUrl,
        docsUrl,
        hardwareInfo
      }
    });
    res.json(updatedProject);
  } catch (error) {
    console.error("Failed to update project:", error);
    // Handle case where project to update is not found (Prisma throws P2025)
     if (error instanceof Error && 'code' in error && error.code === 'P2025') {
         return res.status(404).json({ error: 'Project not found' });
    }
     // Handle potential Prisma errors like invalid ID format
    if (error instanceof Error && 'code' in error && error.code === 'P2023') {
         return res.status(400).json({ error: 'Invalid project ID format' });
    }
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete a project
app.delete('/api/projects/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.project.delete({
      where: { id }
    });
    res.status(204).send(); // No content on successful delete
  } catch (error) {
    console.error("Failed to delete project:", error);
     // Handle case where project to delete is not found (Prisma throws P2025)
     if (error instanceof Error && 'code' in error && error.code === 'P2025') {
         return res.status(404).json({ error: 'Project not found' });
    }
     // Handle potential Prisma errors like invalid ID format
    if (error instanceof Error && 'code' in error && error.code === 'P2023') {
         return res.status(400).json({ error: 'Invalid project ID format' });
    }
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// --- Global Error Handling Middleware (Optional but Recommended) ---
// Catches errors not handled in specific routes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", err);
    // Avoid leaking stack traces in production
    const errorMessage = process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : err.message;
    res.status(500).json({ error: errorMessage });
});


// --- Start Server ---
// Use 0.0.0.0 to listen on all interfaces - important for Docker
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running at http://0.0.0.0:${PORT}`);
  console.log(`Using database: ${process.env.DATABASE_URL ? 'DATABASE_URL env var' : 'Default local PostgreSQL'}`);
  console.log(`CORS enabled for: ${Array.isArray(CORS_ORIGIN) ? CORS_ORIGIN.join(', ') : CORS_ORIGIN}`);
  console.log(`Health endpoint: http://localhost:${PORT}/health`);
  console.log(`Readiness endpoint: http://localhost:${PORT}/ready`);
  console.log(`Metrics endpoint: http://localhost:${PORT}/metrics`);
});