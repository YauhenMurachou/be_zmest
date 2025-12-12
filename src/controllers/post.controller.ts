import { Response } from 'express';
import { AuthenticatedRequest } from '../types/request.types';
import {
  createPost,
  findPostByIdWithAuthor,
  findAllPosts,
  findPostsByAuthorId,
  updatePost,
  deletePost,
} from '../services/post.service';
import { PostCreateInput, PostUpdateInput } from '../types/post.types';

export const createPostHandler = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  if (!request.user) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const input: PostCreateInput = request.body;
  const post = await createPost(input, request.user.userId);
  const postWithAuthor = await findPostByIdWithAuthor(post.id);

  if (!postWithAuthor) {
    response.status(500).json({ error: 'Failed to retrieve created post' });
    return;
  }

  response.status(201).json({ post: postWithAuthor });
};

export const getPostById = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  const postId = Number(request.params.id);

  if (Number.isNaN(postId)) {
    response.status(400).json({ error: 'Invalid post ID' });
    return;
  }

  const post = await findPostByIdWithAuthor(postId);

  if (!post) {
    response.status(404).json({ error: 'Post not found' });
    return;
  }

  response.status(200).json({ post });
};

export const getAllPosts = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  const limit = request.query.limit ? Number(request.query.limit) : 50;
  const offset = request.query.offset ? Number(request.query.offset) : 0;

  const validLimit = Number.isNaN(limit) || limit < 1 ? 50 : Math.min(limit, 100);
  const validOffset = Number.isNaN(offset) || offset < 0 ? 0 : offset;

  const posts = await findAllPosts(validLimit, validOffset);
  response.status(200).json({ posts, limit: validLimit, offset: validOffset });
};

export const getPostsByAuthor = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  const authorId = Number(request.params.authorId);

  if (Number.isNaN(authorId)) {
    response.status(400).json({ error: 'Invalid author ID' });
    return;
  }

  const limit = request.query.limit ? Number(request.query.limit) : 50;
  const offset = request.query.offset ? Number(request.query.offset) : 0;

  const validLimit = Number.isNaN(limit) || limit < 1 ? 50 : Math.min(limit, 100);
  const validOffset = Number.isNaN(offset) || offset < 0 ? 0 : offset;

  const posts = await findPostsByAuthorId(authorId, validLimit, validOffset);
  response.status(200).json({ posts, limit: validLimit, offset: validOffset });
};

export const updatePostHandler = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  if (!request.user) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const postId = Number(request.params.id);

  if (Number.isNaN(postId)) {
    response.status(400).json({ error: 'Invalid post ID' });
    return;
  }

  const input: PostUpdateInput = request.body;
  const post = await updatePost(postId, input, request.user.userId);
  const postWithAuthor = await findPostByIdWithAuthor(post.id);

  if (!postWithAuthor) {
    response.status(500).json({ error: 'Failed to retrieve updated post' });
    return;
  }

  response.status(200).json({ post: postWithAuthor });
};

export const deletePostHandler = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  if (!request.user) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const postId = Number(request.params.id);

  if (Number.isNaN(postId)) {
    response.status(400).json({ error: 'Invalid post ID' });
    return;
  }

  await deletePost(postId, request.user.userId);
  response.status(204).send();
};

