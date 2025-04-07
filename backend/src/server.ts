// src/server.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();
const PORT = parseInt(process.env.BACKEND_PORT || '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// --- Middlewares ---
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- Routes ---
// Root route
app.get('/', (req, res) => {
  res.send('Shelfware API is running');
});

// Get all projects
app.get('/api/projects', (req, res) => {
  prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  })
  .then(projects => {
    res.json(projects);
  })
  .catch(error => {
    console.error("Failed to retrieve projects:", error);
    res.status(500).json({ error: 'Failed to retrieve projects' });
  });
});

// Get a single project by ID
app.get('/api/projects/:id', (req, res) => {
  const id = req.params.id;
  
  prisma.project.findUnique({
    where: { id }
  })
  .then(project => {
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  })
  .catch(error => {
    console.error("Failed to retrieve project:", error);
    res.status(500).json({ error: 'Failed to retrieve project' });
  });
});

// Create a new project
app.post('/api/projects', (req, res) => {
  const { title, status, description, githubUrl, deployedUrl, docsUrl, hardwareInfo } = req.body;
  
  if (!title || !status) {
    return res.status(400).json({ error: 'Title and status are required' });
  }

  prisma.project.create({
    data: {
      title,
      status,
      description,
      githubUrl,
      deployedUrl,
      docsUrl,
      hardwareInfo
    },
  })
  .then(newProject => {
    res.status(201).json(newProject);
  })
  .catch(error => {
    console.error("Failed to create project:", error);
    res.status(500).json({ error: 'Failed to create project' });
  });
});

// Update a project
app.put('/api/projects/:id', (req, res) => {
  const id = req.params.id;
  
  const { title, status, description, githubUrl, deployedUrl, docsUrl, hardwareInfo } = req.body;
  
  if (!title || !status) {
    return res.status(400).json({ error: 'Title and status are required' });
  }
  
  prisma.project.findUnique({
    where: { id }
  })
  .then(existingProject => {
    if (!existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return null;
    }
    
    return prisma.project.update({
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
  })
  .then(updatedProject => {
    if (updatedProject) {
      res.json(updatedProject);
    }
  })
  .catch(error => {
    console.error("Failed to update project:", error);
    res.status(500).json({ error: 'Failed to update project' });
  });
});

// Delete a project
app.delete('/api/projects/:id', (req, res) => {
  const id = req.params.id;
  
  prisma.project.findUnique({
    where: { id }
  })
  .then(existingProject => {
    if (!existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return null;
    }
    
    return prisma.project.delete({
      where: { id }
    });
  })
  .then(deletedProject => {
    if (deletedProject) {
      res.status(204).send();
    }
  })
  .catch(error => {
    console.error("Failed to delete project:", error);
    res.status(500).json({ error: 'Failed to delete project' });
  });
});

// --- Start Server ---
// Use 0.0.0.0 to listen on all interfaces - important for Docker
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running at http://0.0.0.0:${PORT}`);
});