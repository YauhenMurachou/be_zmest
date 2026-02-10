import { Response } from 'express';
import { AuthenticatedRequest } from '../types/request.types';
import {
  getProfileByUserId,
  getStatusByUserId,
  updateProfile,
  updateStatus,
} from '../services/profile.service';
import { ProfileUpdateInput } from '../types/profile.types';

export const getProfile = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  const userId = Number(request.params.userId);

  if (Number.isNaN(userId)) {
    response.status(400).json({
      resultCode: 1,
      messages: ['Invalid user ID'],
      data: {},
    });
    return;
  }

  const profile = await getProfileByUserId(userId);

  if (!profile) {
    response.status(404).json({
      resultCode: 1,
      messages: ['User not found'],
      data: {},
    });
    return;
  }

  response.status(200).json(profile);
};

export const getStatus = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  const userId = Number(request.params.userId);

  if (Number.isNaN(userId)) {
    response.status(400).send('');
    return;
  }

  const status = await getStatusByUserId(userId);
  response.status(200).send(status);
};

export const updateStatusHandler = async (
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

  const { status } = request.body as { status?: string };

  if (typeof status !== 'string' || status.length > 300) {
    response.status(400).json({
      resultCode: 1,
      messages: ['Invalid status'],
      data: {},
    });
    return;
  }

  await updateStatus(request.user.userId, status);

  response.status(200).json({
    resultCode: 0,
    messages: [],
    data: {},
  });
};

export const updateProfileHandler = async (
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

  const input = request.body as ProfileUpdateInput;

  await updateProfile(request.user.userId, input);

  response.status(200).json({
    resultCode: 0,
    messages: [],
    data: {},
  });
};

export const updatePhotoHandler = async (
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

  // TODO: Implement real photo upload handling (multipart/form-data).
  // For now, respond with success without storing the photo.

  response.status(200).json({
    resultCode: 0,
    messages: [],
    data: {},
  });
};

