import React, { useEffect, useState } from 'react';
import { FaHeartbeat, FaChartLine, FaPiggyBank, FaCreditCard, FaChartPie } from 'react-icons/fa';
import { budgetService, expenseService } from '../../services/api';

interface FinancialHealthScoreProps {
  userId: string;
}

interface HealthMetrics {
  budgetAdherence: number;
  savingsRate: number;
  emergencyFundStatus: number;
  debtToIncomeRatio: number;
  investmentDiversity: number;
  overallScore: number;
}

const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({ userId }) => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthMetrics();
  }, [userId]);

  const fetchHealthMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch budget and expense data
      const [budgetRes, expenseRes] = await Promise.all([
        budgetService.getOverview(),
        expenseService.getOverview()
      ]);

      const budgetData = budgetRes.data.data;
      const expenseData = expenseRes.data.data;

      // Calculate metrics
      const budgetAdherence = calculateBudgetAdherence(budgetData);
      const savingsRate = calculateSavingsRate(expenseData);
      const emergencyFundStatus = calculateEmergencyFundStatus(expenseData);
      const debtToIncomeRatio = calculateDebtToIncomeRatio(expenseData);
      const investmentDiversity = calculateInvestmentDiversity(expenseData);

      // Calculate overall score
      const overallScore = calculateOverallScore({
        budgetAdherence,
        savingsRate,
        emergencyFundStatus,
        debtToIncomeRatio,
        investmentDiversity
      });

      setMetrics({
        budgetAdherence,
        savingsRate,
        emergencyFundStatus,
        debtToIncomeRatio,
        investmentDiversity,
        overallScore
      });
    } catch (err) {
      setError('Failed to fetch financial health metrics');
      console.error('Error fetching health metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateBudgetAdherence = (budgetData: any) => {
    // Implementation depends on your data structure
    return 85; // Example value
  };

  const calculateSavingsRate = (expenseData: any) => {
    // Implementation depends on your data structure
    return 75; // Example value
  };

  const calculateEmergencyFundStatus = (expenseData: any) => {
    // Implementation depends on your data structure
    return 90; // Example value
  };

  const calculateDebtToIncomeRatio = (expenseData: any) => {
    // Implementation depends on your data structure
    return 65; // Example value
  };

  const calculateInvestmentDiversity = (expenseData: any) => {
    // Implementation depends on your data structure
    return 80; // Example value
  };

  const calculateOverallScore = (metrics: Omit<HealthMetrics, 'overallScore'>) => {
    const weights = {
      budgetAdherence: 0.3,
      savingsRate: 0.25,
      emergencyFundStatus: 0.2,
      debtToIncomeRatio: 0.15,
      investmentDiversity: 0.1
    };

    return Math.round(
      Object.entries(metrics).reduce((score, [key, value]) => {
        return score + (value * weights[key as keyof typeof weights]);
      }, 0)
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="text-red-600 dark:text-red-400 text-center">{error}</div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <FaHeartbeat className="mr-2 text-primary-600" />
          Financial Health Score
        </h3>
        <div className={`text-xl font-bold ${getScoreColor(metrics.overallScore)}`}>
          {metrics.overallScore}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {getScoreLabel(metrics.overallScore)}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className={`h-2.5 rounded-full ${
              metrics.overallScore >= 80
                ? 'bg-green-600'
                : metrics.overallScore >= 60
                ? 'bg-yellow-500'
                : 'bg-red-600'
            }`}
            style={{ width: `${metrics.overallScore}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaChartLine className="mr-2 text-blue-600" />
            <span className="text-sm">Budget Adherence</span>
          </div>
          <span className={`text-sm font-medium ${getScoreColor(metrics.budgetAdherence)}`}>
            {metrics.budgetAdherence}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaPiggyBank className="mr-2 text-green-600" />
            <span className="text-sm">Savings Rate</span>
          </div>
          <span className={`text-sm font-medium ${getScoreColor(metrics.savingsRate)}`}>
            {metrics.savingsRate}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaCreditCard className="mr-2 text-purple-600" />
            <span className="text-sm">Emergency Fund</span>
          </div>
          <span className={`text-sm font-medium ${getScoreColor(metrics.emergencyFundStatus)}`}>
            {metrics.emergencyFundStatus}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaChartPie className="mr-2 text-orange-600" />
            <span className="text-sm">Debt-to-Income</span>
          </div>
          <span className={`text-sm font-medium ${getScoreColor(metrics.debtToIncomeRatio)}`}>
            {metrics.debtToIncomeRatio}%
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <h4 className="text-sm font-medium mb-2">Recommendations</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          {metrics.budgetAdherence < 80 && (
            <li>• Improve budget adherence by reviewing your spending patterns</li>
          )}
          {metrics.savingsRate < 20 && (
            <li>• Increase your savings rate by setting up automatic transfers</li>
          )}
          {metrics.emergencyFundStatus < 100 && (
            <li>• Build up your emergency fund to cover 3-6 months of expenses</li>
          )}
          {metrics.debtToIncomeRatio > 40 && (
            <li>• Work on reducing your debt-to-income ratio</li>
          )}
          {metrics.investmentDiversity < 70 && (
            <li>• Diversify your investment portfolio</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FinancialHealthScore; 