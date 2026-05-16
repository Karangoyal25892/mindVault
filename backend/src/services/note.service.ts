import { Note } from '../models/note';

export const createNote = async (user: string, noteData: { title: string, content: string }) => {
    try {
        const note = await Note.create({ ...noteData, owner: user });
        return note;
    } catch (error) {
        throw error;
    }
}


export const getNotesForUser = async (userId: string) => {
    try {
        const notes = await Note.find({ owner: userId }).sort({ createdAt: -1 });
        return notes;
    }

    catch (error) {
        throw error;
    }

}
