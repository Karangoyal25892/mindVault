import { NextFunction, Request, Response } from "express";
import { ZodError } from 'zod';

const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            errors: error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))
        });
    }
    res.status(500).json({
        "success": false,
        message: error instanceof Error
            ? error.message
            : 'Internal Server Error',
    });
}

export default errorMiddleware;