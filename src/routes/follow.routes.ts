import { Router } from 'express';
import {
  checkFollowing,
  followUserHandler,
  unfollowUserHandler,
} from '../controllers/follow.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/:userId', authenticateToken, checkFollowing);
router.post('/:userId', authenticateToken, followUserHandler);
router.delete('/:userId', authenticateToken, unfollowUserHandler);

export default router;

