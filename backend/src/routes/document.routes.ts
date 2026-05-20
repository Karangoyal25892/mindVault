import express from 'express';
import { summarize } from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
router.post('/:id/summarize', authMiddleware, summarize);

export default router;