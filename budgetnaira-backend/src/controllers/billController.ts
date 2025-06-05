import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import Bill, { IBill } from '../models/Bill';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Create a new bill
// @route   POST /api/bills
// @access  Private
export const createBill = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { title, totalAmount, participants } = req.body;

  if (!participants || participants.length === 0) {
    return next(new ErrorResponse('At least one participant is required', 400));
  }

  const bill = await Bill.create({
    title,
    totalAmount,
    createdBy: req.user!.id,
    participants
  });

  res.status(201).json({ success: true, data: bill });
});

// @desc    Get all bills for the user
// @route   GET /api/bills
// @access  Private
export const getBills = asyncHandler(async (req: AuthRequest, res: Response) => {
  const bills = await Bill.find({ 
    $or: [
      { createdBy: req.user!.id },
      { 'participants.userId': req.user!.id }
    ]
  });

  res.status(200).json({ success: true, count: bills.length, data: bills });
});

// @desc    Update payment status for a participant
// @route   PUT /api/bills/:id/pay
// @access  Private
export const updatePayment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const bill = await Bill.findById(req.params.id);

  if (!bill) return next(new ErrorResponse('Bill not found', 404));

  const participant = bill.participants.find(p => p.userId.toString() === req.user!.id);

  if (!participant) return next(new ErrorResponse('Not a participant of this bill', 403));

  participant.amountPaid = participant.amountOwed;
  participant.hasPaid = true;

  bill.updatedAt = new Date();

  await bill.save();

  res.status(200).json({ success: true, data: bill });
});

// @desc    Send payment reminders
// @route   POST /api/bills/:id/remind
// @access  Private
export const sendReminders = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const bill = await Bill.findById(req.params.id).populate('participants.userId');

  if (!bill) return next(new ErrorResponse('Bill not found', 404));
  if (bill.createdBy.toString() !== req.user!.id) {
    return next(new ErrorResponse('Not authorized to send reminders for this bill', 403));
  }

  const unpaid = bill.participants.filter(p => !p.hasPaid);

  // Replace with real notification logic (e.g., email, SMS, push)
  unpaid.forEach(p => {
    console.log(`Reminder sent to ${p.userId}`);
  });

  res.status(200).json({ success: true, count: unpaid.length, message: 'Reminders sent' });
});
