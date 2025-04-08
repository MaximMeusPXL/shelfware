// tests/server.test.ts
import request from 'supertest';
import app from '../src/server';

// MOCKING PRISMA
// We use jest.mock to simulate database interactions so that our tests
// do not depend on an actual PostgreSQL instance.
jest.mock('@prisma/client', () => {
  const mPrisma = {
    $queryRaw: jest.fn().mockResolvedValue([1]), // used in /ready endpoint
    project: {
      // GET /api/projects returns an array with one sample project.
      findMany: jest.fn().mockResolvedValue([
        { id: '1', title: 'Test Project', status: 'Active', createdAt: new Date() },
      ]),
      // GET /api/projects/:id returns a project if id === '1'; otherwise, null.
      findUnique: jest.fn().mockImplementation(({ where: { id } }) => {
        if (id === '1') {
          return Promise.resolve({ id: '1', title: 'Test Project', status: 'Active', createdAt: new Date() });
        }
        return Promise.resolve(null);
      }),
      // POST /api/projects simulates creation of a new project.
      create: jest.fn().mockResolvedValue({ id: 'new-project', title: 'New Project', status: 'Active' }),
      // PUT /api/projects/:id simulates updating a project.
      update: jest.fn().mockResolvedValue({ id: '1', title: 'Updated Project', status: 'Active' }),
      // DELETE /api/projects/:id simulates deletion.
      delete: jest.fn().mockResolvedValue({ id: '1', title: 'Deleted Project', status: 'Active' }),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

// Group our tests for clarity
describe('API Endpoints Unit Tests', () => {
  describe('GET /health', () => {
    it('should return a 200 status and a status message "UP"', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'UP' });
    });
  });

  describe('GET /', () => {
    it('should return the running API message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Shelfware API is running');
    });
  });

  describe('GET /metrics', () => {
    it('should return Prometheus metrics data', async () => {
      const response = await request(app).get('/metrics');
      expect(response.status).toBe(200);
      // Verify that one of our metric names is present in the output.
      expect(response.text).toContain('http_request_duration_ms');
    });
  });

  describe('GET /ready', () => {
    it('should indicate readiness when the DB query is successful', async () => {
      const response = await request(app).get('/ready');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'READY');
    });

    it('should return 503 when the DB query fails', async () => {
      // Override the $queryRaw method for this test to simulate a DB failure.
      const { PrismaClient } = require('@prisma/client');
      const prismaMock = new PrismaClient();
      prismaMock.$queryRaw.mockRejectedValueOnce(new Error("DB failure"));

      const response = await request(app).get('/ready');
      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('status', 'UNAVAILABLE');
    });
  });

  describe('GET /api/projects', () => {
    it('should return a list of projects', async () => {
      const response = await request(app).get('/api/projects');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id', '1');
      expect(response.body[0]).toHaveProperty('title', 'Test Project');
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return a project if found', async () => {
      const response = await request(app).get('/api/projects/1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('title', 'Test Project');
    });

    it('should return 404 if project not found', async () => {
      const response = await request(app).get('/api/projects/unknown');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Project not found');
    });
  });

  describe('POST /api/projects', () => {
    it('should return 400 if "title" is missing', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ status: 'Active' });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title and status are required');
    });

    it('should return 400 if "status" is missing', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ title: 'Test Project' });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title and status are required');
    });

    it('should create a new project when required fields are provided', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ title: 'New Project', status: 'Active' });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 'new-project');
      expect(response.body).toHaveProperty('title', 'New Project');
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update a project when valid data is provided', async () => {
      const payload = {
        title: 'Updated Project',
        status: 'Active',
        description: 'Updated description',
        githubUrl: 'https://github.com/example/repo',
        deployedUrl: 'https://example.com',
        docsUrl: 'https://docs.example.com',
        hardwareInfo: 'Raspberry Pi'
      };
      const response = await request(app)
        .put('/api/projects/1')
        .send(payload);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', '1');
      expect(response.body.title).toEqual('Updated Project');
    });

    it('should return 400 when "title" is missing', async () => {
      const payload = {
        status: 'Active',
        description: 'Missing title'
      };
      const response = await request(app)
        .put('/api/projects/1')
        .send(payload);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title and status are required');
    });

    it('should return 400 when "status" is missing', async () => {
      const payload = {
        title: 'Updated Project',
        description: 'Missing status'
      };
      const response = await request(app)
        .put('/api/projects/1')
        .send(payload);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title and status are required');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete a project and return 204', async () => {
      const response = await request(app).delete('/api/projects/1');
      expect(response.status).toBe(204);
    });

    it('should return 404 when attempting to delete a non-existent project', async () => {
      // Override the project.delete method for this test to simulate a "not found" error.
      const { PrismaClient } = require('@prisma/client');
      const prismaMock = new PrismaClient();
      // Simulate a rejection with an error object that has a code property.
      prismaMock.project.delete.mockRejectedValueOnce(
        Object.assign(new Error('Not found'), { code: 'P2025' })
      );

      const response = await request(app).delete('/api/projects/unknown');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Project not found');
    });
  });
});
