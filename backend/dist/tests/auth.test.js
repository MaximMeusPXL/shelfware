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
// tests/auth.test.ts
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = __importDefault(require("../src/server"));
const passport_1 = require("../src/config/passport");
// Mock the Prisma client
jest.mock('@prisma/client', () => {
    const mPrisma = {
        user: {
            findUnique: jest.fn().mockImplementation(({ where }) => {
                if (where.email === 'test@example.com') {
                    return Promise.resolve({
                        id: 'test-user-id',
                        email: 'test@example.com',
                        password: '$2b$10$testHashedPassword',
                        name: 'Test User',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
                if (where.id === 'test-user-id') {
                    return Promise.resolve({
                        id: 'test-user-id',
                        email: 'test@example.com',
                        name: 'Test User',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
                return Promise.resolve(null);
            }),
            create: jest.fn().mockResolvedValue({
                id: 'new-user-id',
                email: 'new@example.com',
                name: 'New User',
                createdAt: new Date(),
                updatedAt: new Date()
            }),
        },
        project: {
            findMany: jest.fn().mockResolvedValue([]),
            findUnique: jest.fn().mockResolvedValue(null),
        },
        $disconnect: jest.fn(),
    };
    return { PrismaClient: jest.fn(() => mPrisma) };
});
// Mock bcrypt
jest.mock('bcrypt', () => ({
    compare: jest.fn().mockImplementation((password, hash) => {
        // In tests, 'password123' will be considered valid
        return Promise.resolve(password === 'password123');
    }),
    hash: jest.fn().mockResolvedValue('$2b$10$hashedPassword')
}));
describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user and return token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send({
                email: 'new@example.com',
                password: 'password123',
                name: 'New User'
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('email', 'new@example.com');
            expect(response.body.user).not.toHaveProperty('password'); // Password should not be returned
            // Verify token can be decoded
            const decoded = jsonwebtoken_1.default.verify(response.body.token, passport_1.JWT_SECRET);
            expect(decoded).toHaveProperty('sub', 'new-user-id');
        }));
        it('should return 400 if email is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send({ password: 'password123' });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Email and password are required');
        }));
        it('should return 400 if password is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send({ email: 'new@example.com' });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Email and password are required');
        }));
        it('should return 400 if email already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the Prisma findUnique to return an existing user
            const { PrismaClient } = require('@prisma/client');
            const prismaMock = new PrismaClient();
            prismaMock.user.findUnique.mockResolvedValueOnce({
                id: 'existing-id',
                email: 'test@example.com',
                password: 'hashedPassword',
            });
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send({
                email: 'test@example.com',
                password: 'password123'
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Email is already in use');
        }));
    });
    describe('POST /api/auth/login', () => {
        // These tests will depend on how you've implemented Passport.js
        // You may need to make adjustments based on your implementation
        it('should return 401 with invalid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'wrongpassword'
            });
            expect(response.status).toBe(401);
        }));
        it('should return token with valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            // This test will likely need changes depending on your Passport setup
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'password123'
            });
            // Once your Passport authentication is properly mocked, this should pass
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('email', 'test@example.com');
        }));
    });
    describe('GET /api/auth/profile', () => {
        it('should return 401 without token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .get('/api/auth/profile');
            expect(response.status).toBe(401);
        }));
        it('should return user profile with valid token', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate a valid token for testing
            const token = jsonwebtoken_1.default.sign({ sub: 'test-user-id' }, passport_1.JWT_SECRET, { expiresIn: '1h' });
            const response = yield (0, supertest_1.default)(server_1.default)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 'test-user-id');
            expect(response.body).toHaveProperty('email', 'test@example.com');
            expect(response.body).not.toHaveProperty('password');
        }));
        it('should return 401 with invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid-token');
            expect(response.status).toBe(401);
        }));
    });
    // Add tests for token expiration, invalid token format, etc. if needed
});
