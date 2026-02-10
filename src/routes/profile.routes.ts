import { Router } from 'express';
import {
  getProfile,
  getStatus,
  updateStatusHandler,
  updateProfileHandler,
  updatePhotoHandler,
} from '../controllers/profile.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/:userId', getProfile);
router.get('/status/:userId', getStatus);
router.put('/status', authenticateToken, updateStatusHandler);
router.put('/', authenticateToken, updateProfileHandler);
router.put('/photo', authenticateToken, updatePhotoHandler);

export default router;

