import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import Budget, { IBudget } from '../models/Budget';
import Expense from '../models/Expense';
import { IUser } from '../models/User';

// Define interface to extend Express Request
interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
export const getBudgets = asyncHandler(
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
    query = Budget.find(JSON.parse(queryStr)).populate('category');
    
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
      query = query.sort('-startDate');
    }
    
    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Budget.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    // Execute query
    const budgets = await query;

    // Extend budgets with spent amounts
    const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
      const budgetObj = budget.toObject();
      
      // Calculate spent amount for this budget period and category
      const spent = await Expense.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user!.id),
            category: budget.category._id,
            date: { $gte: budget.startDate, $lte: budget.endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      return {
        ...budgetObj,
        spent: spent.length > 0 ? spent[0].total : 0,
        remaining: budgetObj.amount - (spent.length > 0 ? spent[0].total : 0)
      };
    }));
    
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
      count: budgetsWithSpent.length,
      pagination,
      data: budgetsWithSpent
    });
  }
);

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
export const getBudget = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const budget = await Budget.findById(req.params.id).populate('category');

    if (!budget) {
      return next(
        new ErrorResponse(`Budget not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the budget
    if (budget.userId.toString() !== req.user!.id) {
      return next(
        new ErrorResponse(`User not authorized to access this budget`, 401)
      );
    }

    // Calculate spent amount for this budget period and category
    const spent = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user!.id),
          category: budget.category._id,
          date: { $gte: budget.startDate, $lte: budget.endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const budgetObj = budget.toObject();
    
    const budgetWithSpent = {
      ...budgetObj,
      spent: spent.length > 0 ? spent[0].total : 0,
      remaining: budgetObj.amount - (spent.length > 0 ? spent[0].total : 0)
    };

    res.status(200).json({
      success: true,
      data: budgetWithSpent
    });
  }
);

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
export const createBudget = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Add user to request body
    req.body.userId = req.user!.id;

    const budget = await Budget.create(req.body);

    res.status(201).json({
      success: true,
      data: budget
    });
  }
);

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
export const updateBudget = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return next(
        new ErrorResponse(`Budget not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the budget
    if (budget.userId.toString() !== req.user!.id) {
      return next(
        new ErrorResponse(`User not authorized to update this budget`, 401)
      );
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: budget
    });
  }
);

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return next(
        new ErrorResponse(`Budget not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the budget
    if (budget.userId.toString() !== req.user!.id) {
      return next(
        new ErrorResponse(`User not authorized to delete this budget`, 401)
      );
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  }
);

// @desc    Get budget overview
// @route   GET /api/budgets/overview
// @access  Private
export const getBudgetOverview = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Get current date
    const now = new Date();
    
    // Get all active budgets
    const activeBudgets = await Budget.find({
      userId: req.user!.id,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('category');
    
    // Calculate total budget and spent amounts
    let totalBudget = 0;
    let totalSpent = 0;
    
    const budgetsWithStats = await Promise.all(activeBudgets.map(async (budget) => {
      // Calculate spent amount for this budget period and category
      const spent = await Expense.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user!.id),
            category: budget.category._id,
            date: { $gte: budget.startDate, $lte: budget.endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      const spentAmount = spent.length > 0 ? spent[0].total : 0;
      const remainingAmount = budget.amount - spentAmount;
      const percentSpent = Math.round((spentAmount / budget.amount) * 100);
      
      totalBudget += budget.amount;
      totalSpent += spentAmount;
      
      return {
        id: budget._id,
        name: budget.name,
        category: budget.category,
        amount: budget.amount,
        spent: spentAmount,
        remaining: remainingAmount,
        percentSpent: percentSpent
      };
    }));
    
    const totalPercentSpent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalBudget,
        totalSpent,
        totalRemaining: totalBudget - totalSpent,
        totalPercentSpent,
        budgets: budgetsWithStats
      }
    });
  }
);