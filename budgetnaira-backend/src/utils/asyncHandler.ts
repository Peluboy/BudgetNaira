import { Request, Response, NextFunction } from 'express';

// Create a wrapper for async functions to catch errors
const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;