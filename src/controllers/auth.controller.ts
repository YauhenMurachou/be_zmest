import { Response } from 'express';
import { AuthenticatedRequest } from '../types/request.types';
import { createUser, authenticateUser } from '../services/user.service';
import { UserCreateInput, UserLoginInput } from '../types/user.types';

export const register = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  try {
    const input: UserCreateInput = request.body;
    const user = await createUser(input);
    response.status(201).json({
      resultCode: 0,
      messages: [],
      data: { user },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    response.status(400).json({
      resultCode: 1,
      messages: [errorMessage],
      data: {},
    });
  }
};

export const login = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  try {
    const input: UserLoginInput = request.body;
    const result = await authenticateUser(input);
    response
      .set('Authorization', `Bearer ${result.token}`)
      .status(200)
      .json({
        resultCode: 0,
        messages: [],
        data: {
          userId: result.user.id,
          token: result.token,
        },
      });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid email or password';
    response.status(401).json({
      resultCode: 1,
      messages: [errorMessage],
      data: {},
    });
  }
};

export const logout = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  response.status(200).json({
    resultCode: 0,
    messages: [],
    data: {},
  });
};

export const getCurrentUser = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  if (!request.user) {
    response.status(401).json({
      resultCode: 1,
      messages: ['Unauthorized'],
      data: {},
    });
    return;
  }

  const { findUserById } = await import('../services/user.service');
  const user = await findUserById(request.user.userId);

  if (!user) {
    response.status(404).json({
      resultCode: 1,
      messages: ['User not found'],
      data: {},
    });
    return;
  }

  response.status(200).json({
    resultCode: 0,
    messages: [],
    data: {
      id: user.id,
      email: user.email,
      login: user.username,
    },
  });
};

