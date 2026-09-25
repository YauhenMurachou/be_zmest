import { Router } from 'express';
import { getUsers } from '../controllers/users.controller';
import { optionalAuthenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalAuthenticateToken, getUsers);

export default router;

