import express from 'express';
import { create, getNotes, deleteNote } from '../controllers/note.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
router.post('/', authMiddleware, create);
router.get('/', authMiddleware, getNotes);
router.delete('/:id', authMiddleware, deleteNote);
export default router ;