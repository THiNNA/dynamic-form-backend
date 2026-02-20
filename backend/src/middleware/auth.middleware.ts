import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== env.API_KEY) {
    return next(new ApiError(401, 'Unauthorized: Invalid or missing API key'));
  }

  next();
}
