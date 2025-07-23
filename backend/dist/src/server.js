"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const prom_client_1 = __importDefault(require("prom-client"));
const passport_1 = __importDefault(require("./config/passport"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const authMiddleware_1 = require("./middleware/authMiddleware");
//import corsMiddleware from 'cors-anywhere';
// --- Prometheus Setup (Monitoring) ---
prom_client_1.default.collectDefaultMetrics();
const httpRequestDurationMicroseconds = new prom_client_1.default.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [50, 100, 200, 500, 1000, 2500, 5000]
});
const httpRequestsTotal = new prom_client_1.default.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code']
});
// --- Prisma Client Setup ---
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/shelfware?schema=public"
        }
    }
});
// Create an Express application instance.
const app = (0, express_1.default)();
// Define the server port. Use environment variable or default to 3001.
const PORT = parseInt(process.env.BACKEND_PORT || '3001', 10);
const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3001'
];
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : defaultOrigins;
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS blocked for origin: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
// Initialize Passport
app.use(passport_1.default.initialize());
// --- Prometheus Request Tracking Middleware ---
app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        const route = req.route ? req.route.path : req.path.replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|^\/[0-9]+$/g, '/:id');
        const labels = { method: req.method, route: route, code: res.statusCode.toString() };
        end(labels);
        httpRequestsTotal.inc(labels);
    });
    next();
});
// --- Health & Readiness Routes ---
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});
app.get('/ready', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.$queryRaw `SELECT 1`;
        res.status(200).json({ status: 'READY', checks: { database: 'OK' } });
    }
    catch (error) {
        console.error("Readiness check failed:", error);
        res.status(503).json({
            status: 'UNAVAILABLE',
            checks: { database: 'FAILING' },
            error: 'Database connection failed'
        });
    }
}));
// --- Prometheus Metrics Route ---
app.get('/metrics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.set('Content-Type', prom_client_1.default.register.contentType);
        res.end(yield prom_client_1.default.register.metrics());
    }
    catch (error) {
        console.error("Failed to retrieve metrics:", error);
        res.status(500).json({ error: 'Failed to retrieve metrics' });
    }
}));
// --- Authentication Routes ---
app.use('/api/auth', authRoutes_1.default);
// --- API Routes ---
// Root route
app.get('/', (req, res) => {
    res.send('Shelfware API is running');
});
// GET /api/projects: Retrieve all projects.
// Uses optionalAuth to attach user but doesn't require login
app.get('/api/projects', authMiddleware_1.optionalAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // If user is authenticated, filter by their user ID
        const whereClause = req.user
            ? { userId: req.user.id }
            : {};
        const projects = yield prisma.project.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        res.json(projects);
    }
    catch (error) {
        console.error("Failed to retrieve projects:", error);
        res.status(500).json({ error: 'Failed to retrieve projects' });
    }
}));
// GET /api/projects/:id: Retrieve a single project by its ID.
// Uses requireAuth to ensure only authenticated users can access
app.get('/api/projects/:id', authMiddleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const project = yield prisma.project.findUnique({
            where: { id }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Check if project belongs to the authenticated user
        if (project.userId && project.userId !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to access this project' });
        }
        res.json(project);
    }
    catch (error) {
        console.error("Failed to retrieve project:", error);
        if (error instanceof Error && 'code' in error && error.code === 'P2023') {
            return res.status(400).json({ error: 'Invalid project ID format' });
        }
        res.status(500).json({ error: 'Failed to retrieve project' });
    }
}));
// POST /api/projects: Create a new project.
// Requires authentication
app.post('/api/projects', authMiddleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, status, description, githubUrl, deployedUrl, docsUrl, hardwareInfo } = req.body;
    if (!title || !status) {
        return res.status(400).json({ error: 'Title and status are required' });
    }
    try {
        const newProject = yield prisma.project.create({
            data: {
                title,
                status,
                description,
                githubUrl,
                deployedUrl,
                docsUrl,
                hardwareInfo,
                // Associate with the authenticated user
                userId: req.user.id
            },
        });
        res.status(201).json(newProject);
    }
    catch (error) {
        console.error("Failed to create project:", error);
        res.status(500).json({ error: 'Failed to create project' });
    }
}));
// PUT /api/projects/:id: Update an existing project by ID.
// Requires authentication
app.put('/api/projects/:id', authMiddleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, status, description, githubUrl, deployedUrl, docsUrl, hardwareInfo } = req.body;
    if (!title || !status) {
        return res.status(400).json({ error: 'Title and status are required' });
    }
    try {
        // First check if the project exists and belongs to the user
        const existingProject = yield prisma.project.findUnique({
            where: { id }
        });
        if (!existingProject) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Check if project belongs to the authenticated user
        if (existingProject.userId && existingProject.userId !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to modify this project' });
        }
        const updatedProject = yield prisma.project.update({
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
    }
    catch (error) {
        console.error("Failed to update project:", error);
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Project not found' });
        }
        if (error instanceof Error && 'code' in error && error.code === 'P2023') {
            return res.status(400).json({ error: 'Invalid project ID format' });
        }
        res.status(500).json({ error: 'Failed to update project' });
    }
}));
// DELETE /api/projects/:id: Delete a project by ID.
// Requires authentication
app.delete('/api/projects/:id', authMiddleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // First check if the project exists and belongs to the user
        const existingProject = yield prisma.project.findUnique({
            where: { id }
        });
        if (!existingProject) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Check if project belongs to the authenticated user
        if (existingProject.userId && existingProject.userId !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to delete this project' });
        }
        yield prisma.project.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("Failed to delete project:", error);
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Project not found' });
        }
        if (error instanceof Error && 'code' in error && error.code === 'P2023') {
            return res.status(400).json({ error: 'Invalid project ID format' });
        }
        res.status(500).json({ error: 'Failed to delete project' });
    }
}));
// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    const errorMessage = process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : err.message;
    res.status(500).json({ error: errorMessage });
});
// --- Start Server ---
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Backend server running at http://0.0.0.0:${PORT}`);
        console.log(`Using database: ${process.env.DATABASE_URL ? 'DATABASE_URL env var' : 'Default local PostgreSQL'}`);
        console.log(`CORS enabled for: ${Array.isArray(allowedOrigins) ? allowedOrigins.join(', ') : String(allowedOrigins)}`);
        console.log(`Health endpoint: http://localhost:${PORT}/health`);
        console.log(`Readiness endpoint: http://localhost:${PORT}/ready`);
        console.log(`Metrics endpoint: http://localhost:${PORT}/metrics`);
    });
}
exports.default = app;
