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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_1 = require("../config/passport");
const prisma = new client_1.PrismaClient();
// Register a new user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        // Check if required fields are present
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Check if email is already in use
        const existingUser = yield prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already in use' });
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create a new user
        const newUser = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
            },
        });
        // Remove password from response
        const { password: _ } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ sub: newUser.id }, passport_1.JWT_SECRET, {
            expiresIn: '7d',
        });
        res.status(201).json({
            user: userWithoutPassword,
            token,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});
exports.register = register;
// Login an existing user
const login = (req, res) => {
    // Passport's local strategy will have already authenticated the user
    // and attached it to req.user
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({ sub: user.id }, passport_1.JWT_SECRET, {
        expiresIn: '7d',
    });
    res.json({
        user,
        token,
    });
};
exports.login = login;
// Get the authenticated user's profile
const getProfile = (req, res) => {
    // Passport's JWT strategy will have already authenticated the user
    // and attached it to req.user
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(user);
};
exports.getProfile = getProfile;
