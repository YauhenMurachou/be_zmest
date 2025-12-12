import { Request } from 'express';
import { JwtPayload } from './user.types';

export type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};


