import axios from 'axios';
import { IBudget } from './db';

interface SpendingPattern {
  category: string;
  averageAmount: number;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface BudgetRecommendation {
  category: string;
  recommendedAmount: number;
  reason: string;
  confidence: number;
}

export class AIService {
  private static instance: AIService;
  private apiUrl: string;

  private constructor() {
    this.apiUrl = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:5000/api/ai';
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async analyzeSpendingPatterns(userId: string, timeRange: 'week' | 'month' | 'year' = 'month'): Promise<SpendingPattern[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/spending-patterns`, {
        params: { userId, timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing spending patterns:', error);
      throw error;
    }
  }

  async getBudgetRecommendations(
    userId: string,
    currentBudgets: IBudget[],
    income: number
  ): Promise<BudgetRecommendation[]> {
    try {
      const response = await axios.post(`${this.apiUrl}/budget-recommendations`, {
        userId,
        currentBudgets,
        income
      });
      return response.data;
    } catch (error) {
      console.error('Error getting budget recommendations:', error);
      throw error;
    }
  }

  async categorizeExpense(
    description: string,
    amount: number,
    date: Date,
    receiptImage?: File
  ): Promise<{ category: string; confidence: number }> {
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('amount', amount.toString());
      formData.append('date', date.toISOString());
      if (receiptImage) {
        formData.append('receipt', receiptImage);
      }

      const response = await axios.post(`${this.apiUrl}/categorize-expense`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error categorizing expense:', error);
      throw error;
    }
  }

  async predictFutureExpenses(
    userId: string,
    category: string,
    timeRange: 'week' | 'month' | 'year' = 'month'
  ): Promise<{ predictedAmount: number; confidence: number }> {
    try {
      const response = await axios.get(`${this.apiUrl}/predict-expenses`, {
        params: { userId, category, timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error predicting future expenses:', error);
      throw error;
    }
  }
}

export const aiService = AIService.getInstance(); 