import { Router } from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation.middleware';
import { registerSchema, loginSchema } from '../utils/validation.util';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getCurrentUser);

export default router;

