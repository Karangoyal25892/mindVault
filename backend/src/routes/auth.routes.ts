import express from 'express';
import { getProfile, getrefreshToken, login, register } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/profile', authMiddleware, getProfile);
router.post('/refreshtoken', getrefreshToken);
export default router;