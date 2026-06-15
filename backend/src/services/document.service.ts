import { Document } from "../models/document";

type DocumentUpdatePayload = {
    status?: string;
    processingError?: string;
    extractedText?: string;
    processedAt?: Date;
};

export const getDocumentById = async (id: string, userId: string) => {
    try {
        const doc = await Document.findOne({ _id: id, owner: userId });
        return doc;
    } catch (error) {
        throw error;
    }
}

export const updateDocument = async (id: string, updates: DocumentUpdatePayload) => {
    try {
        const doc = await Document.findOneAndUpdate(
            { _id: id },
            updates,
            { returnDocument: 'after' }
        );
        return doc;
    } catch (error) {
        throw error;
    }
};


export const getDocumentForProcessing = async (id: string) => {
    try {
        const doc = await Document.findOne({ _id: id });
        return doc;
    } catch (error) {
        throw error;
    }
}