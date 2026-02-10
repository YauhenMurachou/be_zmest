import { Response } from 'express';
import { AuthenticatedRequest } from '../types/request.types';
import { isFollowing, followUser, unfollowUser } from '../services/follow.service';

export const checkFollowing = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  if (!request.user) {
    response.status(401).send(false);
    return;
  }

  const userId = Number(request.params.userId);

  if (Number.isNaN(userId)) {
    response.status(400).send(false);
    return;
  }

  const followed = await isFollowing(request.user.userId, userId);
  response.status(200).send(followed);
};

export const followUserHandler = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  if (!request.user) {
    response.status(401).json({
      resultCode: 1,
      messages: ['Unauthorized'],
      data: {},
    });
    return;
  }

  const userId = Number(request.params.userId);

  if (Number.isNaN(userId)) {
    response.status(400).json({
      resultCode: 1,
      messages: ['Invalid user ID'],
      data: {},
    });
    return;
  }

  try {
    await followUser(request.user.userId, userId);
    response.status(200).json({
      resultCode: 0,
      messages: [],
      data: {},
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to follow user';
    response.status(400).json({
      resultCode: 1,
      messages: [errorMessage],
      data: {},
    });
  }
};

export const unfollowUserHandler = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  if (!request.user) {
    response.status(401).json({
      resultCode: 1,
      messages: ['Unauthorized'],
      data: {},
    });
    return;
  }

  const userId = Number(request.params.userId);

  if (Number.isNaN(userId)) {
    response.status(400).json({
      resultCode: 1,
      messages: ['Invalid user ID'],
      data: {},
    });
    return;
  }

  try {
    await unfollowUser(request.user.userId, userId);
    response.status(200).json({
      resultCode: 0,
      messages: [],
      data: {},
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to unfollow user';
    response.status(400).json({
      resultCode: 1,
      messages: [errorMessage],
      data: {},
    });
  }
};

