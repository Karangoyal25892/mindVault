import { NextFunction, Request, Response } from 'express';
import { addItemToQueue } from '../queues/documentProcessing.queue';
import { uploadDocument } from '../services/upload.service';
import { processDocumentQueue } from '../workers/document.processor';

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

        const doc = await uploadDocument({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path, userId
        });
        addItemToQueue(doc._id.toString());
        void processDocumentQueue();
        res.status(200).json({
            filename: file.originalname,
            success: true,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size,
            documentId: doc._id,
            status: doc.status
        });
    } catch (error) {
        next(error);
    }
}
