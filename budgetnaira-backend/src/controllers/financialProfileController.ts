import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import FinancialProfile, { IFinancialProfile } from '../models/FinancialProfile';
import { IUser } from '../models/User';

// Define interface to extend Express Request
interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Get user's financial profile
// @route   GET /api/financial-profile
// @access  Private
export const getFinancialProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Find the financial profile for the logged-in user
    const profile = await FinancialProfile.findOne({ userId: req.user!.id });

    if (!profile) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Financial profile not created yet'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  }
);

// @desc    Create or update financial profile
// @route   POST /api/financial-profile
// @access  Private
export const createUpdateFinancialProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Find existing profile
    let profile = await FinancialProfile.findOne({ userId: req.user!.id });

    // If profile exists, update it
    if (profile) {
      profile = await FinancialProfile.findOneAndUpdate(
        { userId: req.user!.id },
        req.body,
        {
          new: true,
          runValidators: true
        }
      );
    } else {
      // Create new profile with user ID
      req.body.userId = req.user!.id;
      profile = await FinancialProfile.create(req.body);
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  }
);

// @desc    Add financial goal to profile
// @route   POST /api/financial-profile/goals
// @access  Private
export const addFinancialGoal = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { type, description, targetAmount, priority } = req.body;

    // Find profile
    const profile = await FinancialProfile.findOne({ userId: req.user!.id });

    if (!profile) {
      return next(new ErrorResponse('Please create a financial profile first', 400));
    }

    // Create new goal with _id
    const newGoal = {
      _id: new mongoose.Types.ObjectId(),
      type,
      description,
      targetAmount,
      priority: priority || 'medium'
    };

    // Add goal
    profile.financialGoals.push(newGoal);

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile
    });
  }
);

// @desc    Update financial goal
// @route   PUT /api/financial-profile/goals/:goalId
// @access  Private
export const updateFinancialGoal = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { goalId } = req.params;
    
    // Find profile
    const profile = await FinancialProfile.findOne({ userId: req.user!.id });

    if (!profile) {
      return next(new ErrorResponse('Financial profile not found', 404));
    }

    // Find goal index
    const goalIndex = profile.financialGoals.findIndex(
      (goal) => goal._id.toString() === goalId
    );

    if (goalIndex === -1) {
      return next(new ErrorResponse('Financial goal not found', 404));
    }

    // Update goal
    const goalToUpdate = profile.financialGoals[goalIndex];
    profile.financialGoals[goalIndex] = {
      ...goalToUpdate,
      ...req.body,
      _id: goalToUpdate._id // Preserve the original _id
    };

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile
    });
  }
);

// @desc    Remove financial goal
// @route   DELETE /api/financial-profile/goals/:goalId
// @access  Private
export const removeFinancialGoal = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { goalId } = req.params;
    
    // Find profile
    const profile = await FinancialProfile.findOne({ userId: req.user!.id });

    if (!profile) {
      return next(new ErrorResponse('Financial profile not found', 404));
    }

    // Remove goal
    profile.financialGoals = profile.financialGoals.filter(
      (goal) => goal._id.toString() !== goalId
    );

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile
    });
  }
);

// @desc    Update debt information
// @route   PUT /api/financial-profile/debt
// @access  Private
export const updateDebtInformation = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Find profile
    const profile = await FinancialProfile.findOne({ userId: req.user!.id });

    if (!profile) {
      return next(new ErrorResponse('Please create a financial profile first', 400));
    }

    // Update debt information
    profile.debtStatus = {
      ...profile.debtStatus,
      ...req.body
    };

    // Recalculate total debt amount
    if (req.body.loans) {
      profile.debtStatus.totalDebtAmount = req.body.loans.reduce(
        (total: number, loan: any) => total + loan.amount,
        0
      );
    }

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile.debtStatus
    });
  }
);

// @desc    Add loan to debt information
// @route   POST /api/financial-profile/debt/loans
// @access  Private
export const addLoan = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { type, amount, interestRate, monthlyPayment, remainingMonths } = req.body;

    // Find profile
    const profile = await FinancialProfile.findOne({ userId: req.user!.id });

    if (!profile) {
      return next(new ErrorResponse('Please create a financial profile first', 400));
    }

    // Create new loan with _id
    const newLoan = {
      _id: new mongoose.Types.ObjectId(),
      type,
      amount,
      interestRate,
      monthlyPayment,
      remainingMonths
    };

    // Add loan
    profile.debtStatus.loans.push(newLoan);

    // Update hasDebt and totalDebtAmount
    profile.debtStatus.hasDebt = true;
    profile.debtStatus.totalDebtAmount += amount;

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile.debtStatus
    });
  }
);

// @desc    Update loan information
// @route   PUT /api/financial-profile/debt/loans/:loanId
// @access  Private
// @desc    Update loan information
// @route   PUT /api/financial-profile/debt/loans/:loanId
// @access  Private
export const updateLoan = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const { loanId } = req.params;
      
      // Find profile
      const profile = await FinancialProfile.findOne({ userId: req.user!.id });
  
      if (!profile) {
        return next(new ErrorResponse('Financial profile not found', 404));
      }
  
      // Find loan index - using type assertion since we know the _id exists
      const loanIndex = profile.debtStatus.loans.findIndex(
        (loan: any) => loan._id.toString() === loanId
      );
  
      if (loanIndex === -1) {
        return next(new ErrorResponse('Loan not found', 404));
      }
  
      // Get original amount
      const originalAmount = profile.debtStatus.loans[loanIndex].amount;
  
      // Update loan - use type assertion here as well
      const loanToUpdate = profile.debtStatus.loans[loanIndex] as any;
      profile.debtStatus.loans[loanIndex] = {
        ...loanToUpdate,
        ...req.body,
        _id: loanToUpdate._id // Preserve the original _id
      };
  
      // Update totalDebtAmount if amount changed
      if (req.body.amount && req.body.amount !== originalAmount) {
        profile.debtStatus.totalDebtAmount = profile.debtStatus.totalDebtAmount - originalAmount + req.body.amount;
      }
  
      await profile.save();
  
      res.status(200).json({
        success: true,
        data: profile.debtStatus
      });
    }
  );
  
  // @desc    Remove loan
  // @route   DELETE /api/financial-profile/debt/loans/:loanId
  // @access  Private
  export const removeLoan = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const { loanId } = req.params;
      
      // Find profile
      const profile = await FinancialProfile.findOne({ userId: req.user!.id });
  
      if (!profile) {
        return next(new ErrorResponse('Financial profile not found', 404));
      }
  
      // Find loan - using type assertion
      const loan = (profile.debtStatus.loans as any[]).find(
        (loan) => loan._id.toString() === loanId
      );
  
      if (!loan) {
        return next(new ErrorResponse('Loan not found', 404));
      }
  
      // Update totalDebtAmount
      profile.debtStatus.totalDebtAmount -= loan.amount;
  
      // Remove loan - using type assertion
      profile.debtStatus.loans = (profile.debtStatus.loans as any[]).filter(
        (loan) => loan._id.toString() !== loanId
      );
  
      // Update hasDebt if no loans left
      if (profile.debtStatus.loans.length === 0) {
        profile.debtStatus.hasDebt = false;
      }
  
      await profile.save();
  
      res.status(200).json({
        success: true,
        data: profile.debtStatus
      });
    }
  );