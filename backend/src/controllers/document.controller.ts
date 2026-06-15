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
        if (doc.status !== 'PROCESSED') {
            return res.json({
                documentId,
                status: doc.status,
                message: "Document still processing"
            });
        }
        if (!doc.extractedText) {
            return next(new Error("Extracted text not available"));
        }
        const summary = await summarizeDocument(doc.extractedText);
        res.json({ documentId, summary });
    } catch (error) {
        next(error);
    }
};

export const getDocumentStatus = async (req: Request, res: Response, next: NextFunction) => {
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
        res.json({ documentId, status: doc.status });
    } catch (error) {
        next(error);
    }
}
