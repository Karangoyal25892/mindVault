import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from '../types/auth.types';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token missing' });
    }
    const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload;
    if (!decoded) {
        return res.status(403).json({ message: 'Invalid access token' });
    }
    req.user = decoded as AuthPayload;
    next();
}