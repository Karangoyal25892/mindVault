"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const env_1 = require("../config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const user = await (0, auth_service_1.registerUser)(name, email, password);
        const safeUser = {
            id: user._id,
            name: user.name,
            email: user.email,
        };
        res.status(201).json({
            message: 'User registered successfully',
            user: safeUser,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: error instanceof Error
                ? error.message
                : 'Error registering user',
        });
    }
};
exports.register = register;
const login = async (req, response, next) => {
    try {
        const { email, password } = req.body;
        const user = await (0, auth_service_1.loginUser)(email, password);
        const JWT_Token = jsonwebtoken_1.default.sign(user._id.toString(), env_1.env.jwtSecret, { expiresIn: '1h' });
        response.status(200).json({
            message: 'User logged in successfully',
            token: JWT_Token,
        });
    }
    catch (error) {
        console.log(error);
        response.status(500).json({
            message: error instanceof Error
                ? error.message
                : 'Error logging in user',
        });
    }
};
exports.login = login;
