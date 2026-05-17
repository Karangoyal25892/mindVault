import express from 'express';
import { uploadFile } from '../controllers/upload.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import uploadMiddleware from '../middleware/upload.middleware';

const router = express.Router();
router.post('/', authMiddleware, uploadMiddleware.single('file'), uploadFile);

export default router;