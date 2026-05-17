import { Document } from "../models/document";


export const uploadDocument = async ({ content, filename, originalName, mimetype, size, path, userId }: { content: string; filename: string; originalName: string; mimetype: string; size: number; path: string; userId: string; }) => {
    try {
        const doc = await Document.create({ filename, originalName, mimetype, size, path, extractedText: content, owner: userId });
        return doc;
    } catch (error) {
        throw error;
    }
}