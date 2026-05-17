import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { uploadDocument } from '../services/upload.service';
const pdfParse = require('pdf-parse');

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return next(new Error('Unauthorized'));
        }
        const file = req.file;
        if (!file) {
            return next(new Error('No file uploaded'));
        }
        const fileData = fs.readFileSync(file.path);
        const pdfData = await pdfParse(fileData);
        await uploadDocument({
            content: pdfData.text, filename: file.filename,
            originalName: file.originalname, mimetype: file.mimetype, size: file.size,
            path: file.path, userId
        });
        res.status(200).json({
            filename: file.originalname,
            success: true,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
        });
    } catch (error) {
        next(error);
    }
}
