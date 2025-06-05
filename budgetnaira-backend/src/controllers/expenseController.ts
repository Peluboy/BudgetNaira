import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import Expense, { IExpense } from '../models/Expense';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

// Define interface to extend Express Request
interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
export const getExpenses = asyncHandler(
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
    query = Expense.find(JSON.parse(queryStr)).populate('category');
    
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
      query = query.sort('-date');
    }
    
    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Expense.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    // Execute query
    const expenses = await query;
    
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
      count: expenses.length,
      pagination,
      data: expenses
    });
  }
);

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
export const getExpense = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const expense = await Expense.findById(req.params.id).populate('category');

    if (!expense) {
      return next(
        new ErrorResponse(`Expense not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the expense
    if (expense.userId.toString() !== req.user!.id) {
      return next(
        new ErrorResponse(`User not authorized to access this expense`, 401)
      );
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  }
);

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Add user to request body
    req.body.userId = req.user!.id;

    const expense = await Expense.create(req.body);

    res.status(201).json({
      success: true,
      data: expense
    });
  }
);

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
        return next(
          new ErrorResponse(`Expense not found with id of ${req.params.id}`, 404)
        );
      }
  
      // Make sure user owns the expense
      if (expense.userId.toString() !== req.user!.id) {
        return next(
          new ErrorResponse(`User not authorized to update this expense`, 401)
        );
      }
  
      expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
  
      res.status(200).json({
        success: true,
        data: expense
      });
    }
  );
  
  // @desc    Delete expense
  // @route   DELETE /api/expenses/:id
  // @access  Private
  export const deleteExpense = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const expense = await Expense.findById(req.params.id);
  
      if (!expense) {
        return next(
          new ErrorResponse(`Expense not found with id of ${req.params.id}`, 404)
        );
      }
  
      // Make sure user owns the expense
      if (expense.userId.toString() !== req.user!.id) {
        return next(
          new ErrorResponse(`User not authorized to delete this expense`, 401)
        );
      }
  
      await expense.deleteOne();
  
      res.status(200).json({
        success: true,
        data: {}
      });
    }
  );
  
  // @desc    Get expense stats
  // @route   GET /api/expenses/stats
  // @access  Private
  export const getExpenseStats = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      // Date filters from query params
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : new Date(new Date().setMonth(new Date().getMonth() - 1)); // Default to last month
      
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : new Date();
  
      // Get total expenses for the period
      const totalExpenses = await Expense.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user!.id),
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);
  
      // Get expenses by category
      const expensesByCategory = await Expense.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user!.id),
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryDetails'
          }
        },
        {
          $unwind: '$categoryDetails'
        },
        {
          $project: {
            category: '$categoryDetails.name',
            total: 1,
            count: 1
          }
        },
        {
          $sort: { total: -1 }
        }
      ]);
  
      // Get expenses by month for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
      const expensesByMonth = await Expense.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user!.id),
            date: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
        }
      ]);
  
      res.status(200).json({
        success: true,
        data: {
          total: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
          count: totalExpenses.length > 0 ? totalExpenses[0].count : 0,
          byCategory: expensesByCategory,
          byMonth: expensesByMonth
        }
      });
    }
  );

  // @desc    Split an expense
// @desc    Split an expense
// @route   POST /api/expenses/:id/split
// @access  Private
export const splitExpense = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { participants, accountDetails } = req.body;
    
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return next(
        new ErrorResponse(`Expense not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the expense
    if (expense.userId.toString() !== req.user!.id) {
      return next(
        new ErrorResponse(`User not authorized to update this expense`, 401)
      );
    }

    // Update the expense with split information and account details
    expense.isSplit = true;
    expense.participants = participants;
    
    // Only add account details if provided
    if (accountDetails) {
      expense.accountDetails = accountDetails;
    }
    
    await expense.save();

    res.status(200).json({
      success: true,
      data: expense
    });
  }
);

// @desc    Mark a split expense as settled by a participant
// @route   PUT /api/expenses/:id/settle/:participantId
// @access  Private
export const settleSplitExpense = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { participantId } = req.params;
    
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return next(
        new ErrorResponse(`Expense not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the expense
    if (expense.userId.toString() !== req.user!.id) {
      return next(
        new ErrorResponse(`User not authorized to update this expense`, 401)
      );
    }

    // Find the participant and mark as settled
    const participantIndex = expense.participants.findIndex(
      p => p.id === participantId
    );

    if (participantIndex === -1) {
      return next(
        new ErrorResponse(`Participant not found with id of ${participantId}`, 404)
      );
    }

    expense.participants[participantIndex].settled = true;
    expense.participants[participantIndex].settledDate = new Date();
    
    await expense.save();

    res.status(200).json({
      success: true,
      data: expense
    });
  }
);

// @desc    Get expense overview
// @route   GET /api/expenses/overview
// @access  Private
export const getExpenseOverview = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Get current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get total expenses for current month
    const totalExpenses = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user!.id),
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get expenses by category for current month
    const expensesByCategory = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user!.id),
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      {
        $unwind: '$categoryDetails'
      },
      {
        $project: {
          category: '$categoryDetails.name',
          total: 1,
          count: 1
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Get daily expenses for current month
    const dailyExpenses = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user!.id),
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
        totalCount: totalExpenses.length > 0 ? totalExpenses[0].count : 0,
        expensesByCategory,
        dailyExpenses
      }
    });
  }
);

// @desc    Get expenses by date range
// @route   GET /api/expenses/range
// @access  Private
export const getExpensesByDateRange = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();

    // Get expenses within date range
    const expenses = await Expense.find({
      userId: req.user!.id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('category').sort('-date');

    // Get total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Get expenses by category
    const expensesByCategory = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user!.id),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      {
        $unwind: '$categoryDetails'
      },
      {
        $project: {
          category: '$categoryDetails.name',
          total: 1,
          count: 1
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Get daily expenses
    const dailyExpenses = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user!.id),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        expenses,
        totalExpenses,
        expensesByCategory,
        dailyExpenses
      }
    });
  }
);