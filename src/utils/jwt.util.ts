import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/user.types';

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

const secret = getSecret();

const getExpiresIn = (): number => {
  const envValue = process.env.JWT_EXPIRES_IN;
  if (!envValue) {
    return 7 * 24 * 60 * 60;
  }
  const numericValue = Number(envValue);
  if (!Number.isNaN(numericValue) && numericValue > 0) {
    return numericValue;
  }
  return 7 * 24 * 60 * 60;
};

const expiresIn = getExpiresIn();

export const generateToken = (payload: JwtPayload): string => {
  const options = { expiresIn };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, secret);
  
  if (
    typeof decoded === 'object' &&
    decoded !== null &&
    'userId' in decoded &&
    'email' in decoded &&
    typeof decoded.userId === 'number' &&
    typeof decoded.email === 'string'
  ) {
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  }
  
  throw new Error('Invalid token payload');
};


