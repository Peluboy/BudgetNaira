import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import FinancialAdvice from '../models/FinancialAdvice';
import FinancialProfile from '../models/FinancialProfile';
import { generateFinancialAdvice } from '../utils/aiFinancialAdvisor';
import { IUser } from '../models/User';

// Define interface to extend Express Request
interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Get all financial advice for user
// @route   GET /api/financial-advice
// @access  Private
export const getFinancialAdvice = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Filter by type if provided
    const filter: any = { userId: req.user!.id };
    
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // Get advice ordered by newest first
    const advice = await FinancialAdvice.find(filter).sort({ generatedAt: -1 });

    res.status(200).json({
      success: true,
      count: advice.length,
      data: advice
    });
  }
);

// @desc    Get single financial advice
// @route   GET /api/financial-advice/:id
// @access  Private
export const getSingleAdvice = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const advice = await FinancialAdvice.findById(req.params.id);

    if (!advice) {
      return next(new ErrorResponse(`Financial advice not found with id ${req.params.id}`, 404));
    }

    // Make sure user owns the advice
    if (advice.userId.toString() !== req.user!.id) {
      return next(new ErrorResponse('Not authorized to access this advice', 401));
    }

    // Mark as read if not already
    if (!advice.isRead) {
      advice.isRead = true;
      await advice.save();
    }

    res.status(200).json({
      success: true,
      data: advice
    });
  }
);

// @desc    Generate new financial advice
// @route   POST /api/financial-advice
// @access  Private
export const createFinancialAdvice = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { type = 'general' } = req.body;
    
    // Check if user has a financial profile
    const profile = await FinancialProfile.findOne({ userId: req.user!.id });
    
    if (!profile) {
      return next(new ErrorResponse('Please complete your financial profile first', 400));
    }
    
    // Generate advice using AI
    const aiAdvice = await generateFinancialAdvice(req.user!.id, type);
    console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY);

    // Create new advice document
    const advice = await FinancialAdvice.create({
      userId: req.user!.id,
      type,
      title: aiAdvice.title,
      summary: aiAdvice.summary,
      recommendations: aiAdvice.recommendations,
      dataPoints: aiAdvice.dataPoints,
      aiVersion: aiAdvice.aiVersion || 'BudgetNaira Advisor v1.0'
    });

    res.status(201).json({
      success: true,
      data: advice
    });
  }
);

// @desc    Provide feedback on advice
// @route   POST /api/financial-advice/:id/feedback
// @access  Private
export const provideAdviceFeedback = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return next(new ErrorResponse('Please provide a valid rating between 1 and 5', 400));
    }
    
    const advice = await FinancialAdvice.findById(req.params.id);

    if (!advice) {
      return next(new ErrorResponse(`Financial advice not found with id ${req.params.id}`, 404));
    }

    // Make sure user owns the advice
    if (advice.userId.toString() !== req.user!.id) {
      return next(new ErrorResponse('Not authorized to provide feedback on this advice', 401));
    }
    
    // Update feedback
    advice.feedbackRating = rating;
    advice.feedbackComment = comment;
    await advice.save();

    res.status(200).json({
      success: true,
      data: advice
    });
  }
);

// @desc    Delete advice
// @route   DELETE /api/financial-advice/:id
// @access  Private
export const deleteAdvice = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const advice = await FinancialAdvice.findById(req.params.id);

    if (!advice) {
      return next(new ErrorResponse(`Financial advice not found with id ${req.params.id}`, 404));
    }

    // Make sure user owns the advice
    if (advice.userId.toString() !== req.user!.id) {
      return next(new ErrorResponse('Not authorized to delete this advice', 401));
    }

    await advice.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  }
);

// @desc    Get financial health dashboard
// @route   GET /api/financial-advice/dashboard
// @access  Private
export const getFinancialDashboard = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user has a financial profile
    const profile = await FinancialProfile.findOne({ userId: req.user!.id });
    
    if (!profile) {
      return next(new ErrorResponse('Please complete your financial profile first', 400));
    }
    
    // Calculate financial health metrics
    
    // 1. Emergency Fund Ratio 
    // Ideal: 3-6 months of expenses saved
    const emergencyFundGoal = profile.financialGoals.find(g => g.type === 'emergency_fund');
    // Added a fallback value since currentAmount doesn't exist in the model
    const emergencyFundCurrent = (emergencyFundGoal as any)?.currentAmount || 0;
    const emergencyFundTarget = emergencyFundGoal?.targetAmount || 0;
    const emergencyFundRatio = emergencyFundTarget > 0 
      ? Math.min(1, emergencyFundCurrent / emergencyFundTarget)
      : 0;
    
    // 2. Debt-to-Income Ratio
    // Total monthly debt payments / monthly income
    const monthlyDebtPayments = profile.debtStatus.loans.reduce(
      (sum, loan) => sum + loan.monthlyPayment, 0
    );
    const debtToIncomeRatio = monthlyDebtPayments / profile.monthlyIncome;
    
    // 3. Savings Rate
    // Monthly savings / monthly income
    const savingsRate = profile.savingsRate;
    
    // 4. Overall Financial Health Score (simplistic calculation)
    // 100 points total:
    // - Up to 30 points for emergency fund (30 * ratio)
    // - Up to 30 points for low debt (30 * (1 - min(debtToIncomeRatio, 0.5) / 0.5))
    // - Up to 30 points for savings rate (30 * min(savingsRate, 0.3) / 0.3)
    // - 10 points if they have financial goals set
    
    const emergencyFundScore = 30 * emergencyFundRatio;
    const debtScore = 30 * (1 - Math.min(debtToIncomeRatio, 0.5) / 0.5);
    const savingsScore = 30 * Math.min(savingsRate, 0.3) / 0.3;
    const goalsScore = profile.financialGoals.length > 0 ? 10 : 0;
    
    const overallScore = Math.round(emergencyFundScore + debtScore + savingsScore + goalsScore);
    
    // Get financial status based on score
    let financialStatus;
    if (overallScore >= 80) {
      financialStatus = 'Excellent';
    } else if (overallScore >= 60) {
      financialStatus = 'Good';
    } else if (overallScore >= 40) {
      financialStatus = 'Fair';
    } else {
      financialStatus = 'Needs Improvement';
    }
    
    // Get latest advice
    const latestAdvice = await FinancialAdvice.findOne({ userId: req.user!.id })
      .sort({ generatedAt: -1 })
      .limit(1);
    
    res.status(200).json({
      success: true,
      data: {
        financialHealthScore: overallScore,
        financialStatus,
        metrics: {
          emergencyFundRatio,
          debtToIncomeRatio,
          savingsRate
        },
        latestAdvice: latestAdvice ? {
          id: latestAdvice._id,
          title: latestAdvice.title,
          summary: latestAdvice.summary,
          type: latestAdvice.type,
          generatedAt: latestAdvice.generatedAt
        } : null,
        improvement: {
          topPriority: getTopPriority(profile, overallScore)
        }
      }
    });
  }
);

// Helper function to determine top financial priority
const getTopPriority = (profile: any, score: number) => {
  // If debt-to-income ratio is high, prioritize debt reduction
  const monthlyDebtPayments = profile.debtStatus.loans.reduce(
    (sum: number, loan: any) => sum + loan.monthlyPayment, 0
  );
  const debtToIncomeRatio = monthlyDebtPayments / profile.monthlyIncome;
  
  if (debtToIncomeRatio > 0.4) {
    return {
      area: 'Debt Reduction',
      message: 'Your debt payments are consuming too much of your income. Focus on reducing high-interest debt.'
    };
  }
  
  // If no emergency fund, prioritize that
  const emergencyFundGoal = profile.financialGoals.find((g: any) => g.type === 'emergency_fund');
  if (!emergencyFundGoal) {
    return {
      area: 'Emergency Fund',
      message: 'You need to establish an emergency fund of 3-6 months of expenses.'
    };
  }
  
  // If savings rate is too low
  if (profile.savingsRate < 0.15) {
    return {
      area: 'Increase Savings',
      message: 'Your current savings rate is too low. Aim to save at least 15-20% of your income.'
    };
  }
  
  // Default recommendation
  return {
    area: 'Financial Education',
    message: 'Continue to build your financial knowledge and consider investment opportunities.'
  };
};