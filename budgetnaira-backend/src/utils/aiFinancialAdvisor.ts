
import { IFinancialProfile } from '../models/FinancialProfile';
import User, { IUser } from '../models/User';
import Expense from '../models/Expense';
import Budget from '../models/Budget';
import SavingGoal from '../models/SavingGoal';
import mongoose from 'mongoose';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

interface DeepSeekMessage {
  role: string;
  content: string;
}

interface DeepSeekChoice {
  message: DeepSeekMessage;
}

// interface DeepSeekApiResponse {
//   choices: DeepSeekChoice[];
// }

type AdviceType = 'savings' | 'debt' | 'investment' | 'budgeting' | 'emergency_fund' | 'general';

interface AdviceResponse {
  title: string;
  summary: string;
  recommendations: {
    title: string;
    description: string;
    actionItems: string[];
    priorityLevel: 'high' | 'medium' | 'low';
  }[];
  dataPoints: {
    name: string;
    value: string;
    insight: string;
  }[];
  aiVersion: string;
}

const nigerianFinancialContext = {
  inflation: 33.7,
  treasuryBillRate: 14.5,
  savingsInterestRate: 4.2,
  mutualFunds: [
    { name: 'Money Market Funds', averageReturn: 14, riskLevel: 'low' },
    { name: 'Fixed Income Funds', averageReturn: 16, riskLevel: 'medium-low' },
    { name: 'Balanced Funds', averageReturn: 19, riskLevel: 'medium' },
    { name: 'Equity Funds', averageReturn: 22, riskLevel: 'high' }
  ],
  stockMarketPerformance: 'volatile with moderate growth potential',
  realEstatePerformance: 'strong in major urban areas, especially Lagos and Abuja',
  fxRestrictions: 'significant restrictions on foreign currency transactions',
  pensionFunds: 'regulated with positive long-term performance',
  taxInfo: {
    incomeTax: 'Progressive, ranging from 7% to 24%',
    investmentTax: 'Withholding tax of 10% on dividends and interest'
  }
};

interface UserFinancialData {
  user: IUser;
  profile: IFinancialProfile;
  expensesSummary: {
    totalMonthlyExpenses: number;
    expensesByCategory: { category: string; amount: number; percentage: number }[];
    monthlyTrend: { month: string; amount: number }[];
  };
  budgetsSummary: {
    totalBudgets: number;
    adherenceRate: number;
    problemAreas: string[];
  };
  savingsSummary: {
    totalSavings: number;
    savingsRate: number;
    savingGoals: { name: string; currentAmount: number; targetAmount: number; targetDate: string }[];
  };
  debtSummary: {
    totalDebt: number;
    monthlyDebtPayments: number;
    debtToIncomeRatio: number;
  };
}

export const generateFinancialAdvice = async (
  userId: string,
  adviceType: AdviceType = 'general'
): Promise<AdviceResponse> => {
  try {
    const userData = await collectUserFinancialData(userId);

    const aiContext = {
      userData,
      nigerianContext: nigerianFinancialContext,
      adviceType
    };
    const aiResponse = await callAiService(aiContext);
    return aiResponse;
  } catch (error) {
    console.error('Error generating financial advice:', error);
    console.error("AI service error:", JSON.stringify(error, null, 2));
    throw new Error("Failed to get advice from AI");
  }
};

const collectUserFinancialData = async (userId: string): Promise<UserFinancialData> => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const profile = await mongoose.model('FinancialProfile').findOne({ userId }) as IFinancialProfile;
  if (!profile) throw new Error('Financial profile not found');

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const expenses = await Expense.find({ userId, date: { $gte: sixMonthsAgo } }).populate('category');
  const totalMonthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0) / 6;

  const expensesByCategory: { category: string; amount: number; percentage: number }[] = [];
  const monthlyTrend: { month: string; amount: number }[] = [];

  const budgets = await Budget.find({ userId }).populate('category');
  const savingGoals = await SavingGoal.find({ userId }).populate('category');

  return {
    user,
    profile,
    expensesSummary: {
      totalMonthlyExpenses,
      expensesByCategory,
      monthlyTrend
    },
    budgetsSummary: {
      totalBudgets: budgets.length,
      adherenceRate: 0,
      problemAreas: []
    },
    savingsSummary: {
      totalSavings: savingGoals.reduce((sum, goal) => sum + goal.currentAmount, 0),
      savingsRate: profile.savingsRate,
      savingGoals: savingGoals.map(goal => ({
        name: goal.name,
        currentAmount: goal.currentAmount,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate.toISOString()
      }))
    },
    debtSummary: {
      totalDebt: profile.debtStatus.totalDebtAmount,
      monthlyDebtPayments: profile.debtStatus.loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0),
      debtToIncomeRatio: profile.debtStatus.totalDebtAmount / (profile.monthlyIncome * 12)
    }
  };
};

const token = "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";
const endpoint = "https://models.github.ai/inference";
const model = "deepseek/DeepSeek-V3-0324";

export async function callAiService(context: any): Promise<AdviceResponse> {
  try {
    const prompt = `
You are a financial advisor specializing in Nigerian personal finance.
User Data: ${JSON.stringify(context.userData, null, 2)}
Advice Type: ${context.adviceType}
Nigerian Context: ${JSON.stringify(context.nigerianContext, null, 2)}

Generate a response with the following JSON structure:
{
  "title": "Short headline for the advice",
  "summary": "2-3 sentence overview",
  "recommendations": [
    {
      "title": "Step title",
      "description": "Explanation of this recommendation",
      "actionItems": ["Do this", "Do that"],
      "priorityLevel": "high" | "medium" | "low"
    }
  ],
  "dataPoints": [
    {
      "name": "Key stat",
      "value": "e.g. ₦200,000",
      "insight": "Insight on this stat"
    }
  ],
  "aiVersion": "BudgetNaira Advisor v1.0"
}
`;

if (!token) {
  throw new Error("DEEPSEEK_API_KEY is not defined in environment variables.");
}

const client = ModelClient(
  endpoint,
  new AzureKeyCredential(token)
);

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You are a helpful financial advisor." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        model: model
      }
    });
    
    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const messageContent = response.body.choices[0]?.message?.content;

    if (!messageContent) {
      throw new Error("Empty AI response");
    }

    let cleanContent = messageContent;
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7); 
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3);
    }
    
    const parsed = JSON.parse(cleanContent.trim());
    return parsed as AdviceResponse;
  } catch (error) {
    console.error("Get AI service error:", JSON.stringify(error, null, 2));
    throw new Error("Failed to get advice from AI");
  }
}
