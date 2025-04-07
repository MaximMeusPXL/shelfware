// src/server.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Routes ---
// Root route
app.get('/', (req, res) => {
  res.send('Shelfware API is running');
});

// Get all projects
app.get('/api/projects', async (req, res) => {
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

// Create a new project
app.post('/api/projects', async (req, res) => {
    try {
        // Basic validation example
        const { title, status, description, githubUrl, deployedUrl, docsUrl, hardwareInfo } = req.body;
        if (!title || !status) {
            return res.status(400).json({ error: 'Title and status are required' });
        }

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

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});