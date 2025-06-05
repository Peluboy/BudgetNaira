import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import { IUser } from '../models/User';
import { IBudget } from '../models/Budget';
import { generateFinancialAdvice } from '../utils/aiFinancialAdvisor';

// Define interface to extend Express Request
interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Get budget recommendations
// @route   POST /api/ai/budget-recommendations
// @access  Private
export const getBudgetRecommendations = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { userId, currentBudgets, income } = req.body;

    // Validate request
    if (!userId || !income) {
      return next(new ErrorResponse('Please provide userId and income', 400));
    }

    // Get financial advice for budgeting
    const advice = await generateFinancialAdvice(userId, 'budgeting');

    // Transform advice into budget recommendations
    const recommendations = advice.recommendations.map(rec => ({
      category: rec.title,
      recommendedAmount: parseFloat(rec.description.match(/₦([\d,]+)/)?.[1]?.replace(/,/g, '') || '0'),
      reason: rec.description,
      confidence: rec.priorityLevel === 'high' ? 0.9 : rec.priorityLevel === 'medium' ? 0.7 : 0.5
    }));

    res.status(200).json({
      success: true,
      data: recommendations
    });
  }
); 