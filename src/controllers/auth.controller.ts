import { Response } from 'express';
import { AuthenticatedRequest } from '../types/request.types';
import { createUser, authenticateUser } from '../services/user.service';
import { UserCreateInput, UserLoginInput } from '../types/user.types';

export const register = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  const input: UserCreateInput = request.body;
  const user = await createUser(input);
  response.status(201).json({ user });
};

export const login = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  const input: UserLoginInput = request.body;
  const result = await authenticateUser(input);
  response.status(200).json(result);
};

export const getCurrentUser = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  if (!request.user) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { findUserById } = await import('../services/user.service');
  const user = await findUserById(request.user.userId);

  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }

  response.status(200).json({ user });
};

