import express from 'express';
import { create, getNotes } from '../controllers/note.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
router.post('/', authMiddleware, create);
router.get('/', authMiddleware, getNotes);
export default router ;