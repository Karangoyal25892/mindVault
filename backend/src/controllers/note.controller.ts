import { NextFunction, Request, Response } from 'express';
import { createNote, getNotesForUser } from '../services/note.service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as { userId: string };;
        const { title, content } = req.body || {};
        await createNote(user.userId, { title, content });
        res.status(201).json({
            message: 'Note created successfully',
        });
    } catch (error) {
        next(error);
    }
}

export const getNotes = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { userId: string };
    const userId = user.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    await getNotesForUser(userId).then(notes => {
        res.status(200).json({ notes });
    }).catch(error => {
        next(error);
    });
}