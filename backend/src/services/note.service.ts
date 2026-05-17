import { Note } from '../models/note';

export const createNote = async (userId: string, noteData: { title: string, content: string }) => {
    try {
        const note = await Note.create({ ...noteData, owner: userId });
        return note;
    } catch (error) {
        throw error;
    }
}

export const getNotesForUser = async (userId: string, page: number, limit: number) => {
    try {
        const notes = await Note.find({ owner: userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        return notes;
    }

    catch (error) {
        throw error;
    }
}

export const deleteNoteForUser = async (userId: string, noteId: string) => {
    try {
        const note = await Note.findOneAndDelete({ _id: noteId, owner: userId });
        if (!note) {
            throw new Error('Note not found or unauthorized');
        }
        return note;
    } catch (error) {
        throw error;
    }
}

