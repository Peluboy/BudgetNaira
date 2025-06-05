import { Request, Response, NextFunction } from 'express';
import FinancialEvent from '../models/FinancialEvent';
import ErrorResponse from '../utils/errorResponse';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user: IUser;
}

// @desc    Get all financial events for a user
// @route   GET /api/v1/financial-events
// @access  Private
export const getFinancialEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    const events = await FinancialEvent.find({ user: authReq.user.id });
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new financial event
// @route   POST /api/v1/financial-events
// @access  Private
export const createFinancialEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    req.body.user = authReq.user.id;
    const event = await FinancialEvent.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Update financial event
// @route   PUT /api/v1/financial-events/:id
// @access  Private
export const updateFinancialEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    let event = await FinancialEvent.findById(req.params.id);

    if (!event) {
      return next(new ErrorResponse(`Event not found`, 404));
    }

    // Make sure user owns event
    if (event.user.toString() !== authReq.user.id) {
      return next(new ErrorResponse(`Not authorized`, 401));
    }

    event = await FinancialEvent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete financial event
// @route   DELETE /api/v1/financial-events/:id
// @access  Private
export const deleteFinancialEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    const event = await FinancialEvent.findById(req.params.id);

    if (!event) {
      return next(new ErrorResponse(`Event not found`, 404));
    }

    if (event.user.toString() !== authReq.user.id) {
      return next(new ErrorResponse(`Not authorized`, 401));
    }

    await event.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
}; 