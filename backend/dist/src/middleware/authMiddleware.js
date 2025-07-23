"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAuth = void 0;
const passport_1 = __importDefault(require("../config/passport"));
// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    passport_1.default.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'You must be logged in to access this resource'
            });
        }
        // User is authenticated, attach to request
        req.user = user;
        next();
    })(req, res, next);
};
exports.requireAuth = requireAuth;
// Optional authentication - doesn't block but attaches user if token is valid
const optionalAuth = (req, res, next) => {
    passport_1.default.authenticate('jwt', { session: false }, (err, user) => {
        if (err) {
            return next(err);
        }
        if (user) {
            req.user = user;
        }
        next();
    })(req, res, next);
};
exports.optionalAuth = optionalAuth;
