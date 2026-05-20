import { NextFunction, Request, Response } from "express";
import { summarizeDocument } from "../services/ai.service";
import { getDocumentById } from "../services/document.service";

export const summarize = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const documentId = req.params.id as string;
        const userId = req.user?.userId;
        if (!userId || !documentId) {
            return next(new Error('Unauthorized'));
        }
        const doc = await getDocumentById(documentId, userId);
        if (!doc) {
            return next(new Error('Document not found'));
        }
        const summary = await summarizeDocument(doc.extractedText);
        res.json({ documentId, summary });
    } catch (error) {
        next(error);
    }
};
