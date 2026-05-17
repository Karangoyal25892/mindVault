import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { loginUser, registerUser } from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        const user = await registerUser(name, email, password);
        const safeUser = {
            id: user._id,
            name: user.name,
            email: user.email,
        };

        res.status(201).json({
            message: 'User registered successfully',
            user: safeUser,
        });
    } catch (error) {
        next(error);
    }
};


export const login = async (req: Request, response: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await loginUser(email, password);
        const JWT_Token = jwt.sign({ userId: user._id.toString(), }, env.jwtSecret, { expiresIn: '1hour' });
        const refreshTokens = jwt.sign({ userId: user._id.toString(), }, env.jwtSecret, { expiresIn: '7d' });
        response.status(200).json({
            message: 'User logged in successfully',
            token: JWT_Token,
            refreshToken: refreshTokens,
        });
    } catch (error) {
        next(error);
    }
}

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({
            message: 'Protected profile route accessed',
        });

    } catch (error) {
        next(error);
    }
}


export const getrefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        const tokens = refreshToken ? jwt.verify(refreshToken, env.jwtSecret) : null;
        if (!tokens) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        const userId = (tokens as { userId: string }).userId;
        const newToken = jwt.sign({ userId }, env.jwtSecret, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Token refreshed successfully',
            token: newToken,
        });
    } catch (error) {
        next(error);
    }
}