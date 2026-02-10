import { Request, Response } from 'express';
import { listUsers } from '../services/user.service';
import { AuthenticatedRequest } from '../types/request.types';

export const getUsers = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  const pageParam = request.query.page;
  const countParam = request.query.count;
  const termParam = request.query.term;

  const page = pageParam ? Number(pageParam) : 1;
  const count = countParam ? Number(countParam) : 10;
  const term =
    typeof termParam === 'string' && termParam.trim().length > 0
      ? termParam
      : undefined;

  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const safeCount = Number.isNaN(count) || count < 1 ? 10 : Math.min(count, 100);

  const viewerId = request.user ? request.user.userId : null;

  const { items, totalCount } = await listUsers(
    safePage,
    safeCount,
    term,
    viewerId,
  );

  response.status(200).json({
    items,
    totalCount,
    error: null,
  });
};

