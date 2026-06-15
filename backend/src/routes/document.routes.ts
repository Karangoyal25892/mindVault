import express from 'express';
import { getDocumentStatus, summarize } from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
router.post('/:id/summarize', authMiddleware, summarize);
router.get('/:id/status', authMiddleware, getDocumentStatus);
export default router;