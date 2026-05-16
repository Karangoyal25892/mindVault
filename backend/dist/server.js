"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
global.crypto = crypto_1.default;
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const connectDB_1 = require("./database/connectDB");
const PORT = env_1.env.port;
const startServer = async () => {
    try {
        console.log('Starting server...');
        await (0, connectDB_1.connectDB)();
        app_1.default.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
