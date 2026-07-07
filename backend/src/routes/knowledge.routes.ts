import express from 'express';
import { ask, index, search, semanticSearch } from '../controllers/knowledge.controller';

const router = express.Router();
router.post('/index', index);
router.post('/search', search);
router.post('/semantic-search', semanticSearch);
router.post('/ask', ask);
export default router;