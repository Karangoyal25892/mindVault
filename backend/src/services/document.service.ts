import { Document } from "../models/document";

export const getDocumentById = async (id: string, userId: string) => {
    try {
        const doc = await Document.findOne({ _id: id, owner: userId });
        return doc;
    } catch (error) {
        throw error;
    }
}