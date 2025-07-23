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
exports.JWT_SECRET = void 0;
// backend/src/config/passport.ts
const client_1 = require("@prisma/client");
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_jwt_1 = require("passport-jwt");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
// Environment variables should be properly configured
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
exports.JWT_SECRET = JWT_SECRET;
// Local Strategy for username/password login
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: 'email',
    passwordField: 'password',
}, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user by email
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        // If user doesn't exist or password doesn't match
        if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
            return done(null, false, { message: 'Invalid email or password' });
        }
        // Remove the password from the user object before returning
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        return done(null, userWithoutPassword);
    }
    catch (error) {
        return done(error);
    }
})));
passport_1.default.use(new passport_jwt_1.Strategy({
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
}, (payload, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user by id in the JWT payload
        const user = yield prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user) {
            return done(null, false);
        }
        // Remove the password from the user object before returning
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        return done(null, userWithoutPassword);
    }
    catch (error) {
        return done(error);
    }
})));
exports.default = passport_1.default;
