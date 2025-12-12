import { Router } from 'express';
import {
  createPostHandler,
  getPostById,
  getAllPosts,
  getPostsByAuthor,
  updatePostHandler,
  deletePostHandler,
} from '../controllers/post.controller';
import { validateBody } from '../middleware/validation.middleware';
import { postCreateSchema, postUpdateSchema } from '../utils/validation.util';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateToken, validateBody(postCreateSchema), createPostHandler);
router.get('/', getAllPosts);
router.get('/author/:authorId', getPostsByAuthor);
router.get('/:id', getPostById);
router.put('/:id', authenticateToken, validateBody(postUpdateSchema), updatePostHandler);
router.delete('/:id', authenticateToken, deletePostHandler);

export default router;

