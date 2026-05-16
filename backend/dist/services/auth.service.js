"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = require("../models/user");
const registerUser = async (name, email, password) => {
    try {
        const existingUser = await user_1.User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await user_1.User.create({ name, email, password: hashedPassword });
        return user;
    }
    catch (error) {
        throw error;
    }
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    try {
        const user = await user_1.User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        return user;
    }
    catch (error) {
        throw error;
    }
};
exports.loginUser = loginUser;
