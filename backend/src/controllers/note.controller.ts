import { NextFunction, Request, Response } from 'express';
import { createNote, deleteNoteForUser, getNotesForUser } from '../services/note.service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return next(new Error('Unauthorized'));
        }
        const { title, content } = req.body || {};
        await createNote(userId, { title, content });
        res.status(201).json({ message: 'Note created successfully' });
    } catch (error) {
        next(error);
    }
}

export const getNotes = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) {
        return next(new Error('Unauthorized'));
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    try {
        const notes = await getNotesForUser(userId, page, limit);
        res.status(200).json({ notes });
    } catch (error) {
        next(error);
    }
}

export const deleteNote = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) {
        return next(new Error('Unauthorized'));
    }
    const noteId = req.params.id as string;
    try {
        await deleteNoteForUser(userId, noteId);
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        next(error);
    }
}
