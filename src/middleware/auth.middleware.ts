import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/request.types';
import { verifyToken } from '../utils/jwt.util';

export const authenticateToken = (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
): void => {
  const authHeader = request.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    response.status(401).json({
      resultCode: 1,
      messages: ['Authentication token required'],
      data: {},
    });
    return;
  }

  try {
    const payload = verifyToken(token);
    request.user = payload;
    next();
  } catch (error) {
    response.status(403).json({
      resultCode: 1,
      messages: ['Invalid or expired token'],
      data: {},
    });
    return;
  }
};

