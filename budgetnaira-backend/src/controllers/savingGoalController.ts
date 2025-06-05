import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import SavingGoal, { ISavingGoal } from '../models/SavingGoal';
import { IUser } from '../models/User';

// Define interface to extend Express Request
interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Get all saving goals
// @route   GET /api/savings
// @access  Private
export const getSavingGoals = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Create query
    let query;
    
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Add user filter
    reqQuery.userId = req.user!.id;
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = SavingGoal.find(JSON.parse(queryStr)).populate('category');
    
    // Select fields
    if (req.query.select) {
      const fields = (req.query.select as string).split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await SavingGoal.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    // Execute query
    const savingGoals = await query;
    
    // Pagination result
    const pagination: any = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: savingGoals.length,
      pagination,
      data: savingGoals
    });
  }
);

// @desc    Get single saving goal
// @route   GET /api/savings/:id
// @access  Private
export const getSavingGoal = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const savingGoal = await SavingGoal.findById(req.params.id).populate('category');

    if (!savingGoal) {
      return next(
        new ErrorResponse(`Saving goal not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the saving goal
    if (savingGoal.userId.toString() !== req.user!.id) {
      return next(
        new ErrorResponse(`User not authorized to access this saving goal`, 401)
      );
    }

    res.status(200).json({
      success: true,
      data: savingGoal
    });
  }
);

// @desc    Create new saving goal
// @route   POST /api/savings
// @access  Private
export const createSavingGoal = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Add user to request body
    req.body.userId = req.user!.id;

    const savingGoal = await SavingGoal.create(req.body);

    res.status(201).json({
      success: true,
      data: savingGoal
    });
  }
);

// @desc    Update saving goal
// @route   PUT /api/savings/:id
// @access  Private
export const updateSavingGoal = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let savingGoal = await SavingGoal.findById(req.params.id);

    if (!savingGoal) {
      return next(
        new ErrorResponse(`Saving goal not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the saving goal
    if (savingGoal.userId.toString() !== req.user!.id) {
      return next(
        new ErrorResponse(`User not authorized to update this saving goal`, 401)
      );
    }

    savingGoal = await SavingGoal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: savingGoal
    });
  }
);

// @desc    Delete saving goal
// @route   DELETE /api/savings/:id
// @access  Private
export const deleteSavingGoal = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const savingGoal = await SavingGoal.findById(req.params.id);

    if (!savingGoal) {
      return next(
        new ErrorResponse(`Saving goal not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the saving goal
    if (savingGoal.userId.toString() !== req.user!.id) {
      return next(
        new ErrorResponse(`User not authorized to delete this saving goal`, 401)
      );
    }

    await savingGoal.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  }
);

// @desc    Add funds to saving goal
// @route   PUT /api/savings/:id/addfunds
// @access  Private
export const addFundsToSavingGoal = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return next(new ErrorResponse('Please provide a valid amount', 400));
    }

    let savingGoal = await SavingGoal.findById(req.params.id);

    if (!savingGoal) {
      return next(
        new ErrorResponse(`Saving goal not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the saving goal
    if (savingGoal.userId.toString() !== req.user!.id) {
      return next(
        new ErrorResponse(`User not authorized to update this saving goal`, 401)
      );
    }

    // Update current amount
    savingGoal.currentAmount += amount;
    
    // Check if goal is completed
    if (savingGoal.currentAmount >= savingGoal.targetAmount) {
      savingGoal.isCompleted = true;
    }

    await savingGoal.save();

    res.status(200).json({
      success: true,
      data: savingGoal
    });
  }
);

// @desc    Get saving goals overview
// @route   GET /api/savings/overview
// @access  Private
export const getSavingGoalsOverview = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Get all saving goals
    const allGoals = await SavingGoal.find({
      userId: req.user!.id
    }).populate('category');
    
    // Get active goals
    const activeGoals = allGoals.filter(goal => !goal.isCompleted);
    
    // Get completed goals
    const completedGoals = allGoals.filter(goal => goal.isCompleted);
    
    // Calculate totals
    const totalTargetAmount = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrentAmount = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalSavedPercentage = totalTargetAmount > 0 
      ? Math.round((totalCurrentAmount / totalTargetAmount) * 100) 
      : 0;
    
    // Calculate monthly contribution based on active goals
    const monthlySavingsTarget = activeGoals.reduce((sum, goal) => {
      const now = new Date();
      const remainingMonths = Math.max(1, 
        Math.ceil((goal.targetDate.getTime() - now.getTime()) / (30 * 24 * 60 * 60 * 1000))
      );
      const remainingAmount = goal.targetAmount - goal.currentAmount;
      const monthlyContribution = remainingAmount > 0 
        ? Math.ceil(remainingAmount / remainingMonths)
        : 0;
      
      return sum + monthlyContribution;
    }, 0);
    
    res.status(200).json({
      success: true,
      data: {
        activeGoalsCount: activeGoals.length,
        completedGoalsCount: completedGoals.length,
        totalTargetAmount,
        totalCurrentAmount,
        totalRemainingAmount: totalTargetAmount - totalCurrentAmount,
        totalSavedPercentage,
        monthlySavingsTarget,
        activeGoals,
        recentlyCompletedGoals: completedGoals.slice(0, 3)
      }
    });
  }
);