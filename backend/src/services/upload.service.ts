import { Document } from "../models/document";

type documentPayLoad = {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    userId: string;
}


export const uploadDocument = async (payload: documentPayLoad) => {
    try {
        const doc = await Document.create({
            filename: payload.filename,
            originalName: payload.originalName,
            mimetype: payload.mimetype,
            size: payload.size,
            path: payload.path,
            owner: payload.userId
        });
        return doc;
    } catch (error) {
        throw error;
    }
}