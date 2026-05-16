import { Request, Response, NextFunction } from 'express';
import { loginUser, registerUser } from '../services/auth.service';
import { env } from '../config/env';
import jwt from 'jsonwebtoken';


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
        console.log(error);
        res.status(500).json({
            message: error instanceof Error
                ? error.message
                : 'Error registering user',
        });
    }
};


export const login = async (req: Request, response: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await loginUser(email, password);
        const JWT_Token = jwt.sign(user._id.toString(), env.jwtSecret, { expiresIn: '1h' });
        response.status(200).json({
            message: 'User logged in successfully',
            token: JWT_Token,
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({
            message: error instanceof Error
                ? error.message
                : 'Error logging in user',
        });
    }
}