import React, { useEffect, useState } from 'react';
import { aiService } from '../../services/aiService';
import { IBudget } from '../../services/db';
import { FaRobot, FaLightbulb, FaChartLine } from 'react-icons/fa';

interface AIBudgetRecommendationsProps {
  userId: string;
  currentBudgets: IBudget[];
  income: number;
  onApplyRecommendation: (category: string, amount: number) => void;
}

const AIBudgetRecommendations: React.FC<AIBudgetRecommendationsProps> = ({
  userId,
  currentBudgets,
  income,
  onApplyRecommendation
}) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchRecommendations();
  }, [userId, currentBudgets, income, selectedTimeRange]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await aiService.getBudgetRecommendations(userId, currentBudgets, income);
      setRecommendations(data);
    } catch (err) {
      setError('Failed to fetch recommendations. Please try again later.');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center dark:text-white">
          <FaRobot className="mr-2 text-primary-600 dark:text-primary-400" />
          AI Budget Recommendations
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedTimeRange('week')}
            className={`px-3 py-1 text-sm rounded ${
              selectedTimeRange === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setSelectedTimeRange('month')}
            className={`px-3 py-1 text-sm rounded ${
              selectedTimeRange === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setSelectedTimeRange('year')}
            className={`px-3 py-1 text-sm rounded ${
              selectedTimeRange === 'year'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          No recommendations available at this time.
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <FaLightbulb className="text-yellow-500 mr-2" />
                  <h4 className="font-medium">{rec.category}</h4>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                    Confidence: {Math.round(rec.confidence * 100)}%
                  </span>
                  <FaChartLine className="text-primary-600" />
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {rec.reason}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">
                  ₦{rec.recommendedAmount.toLocaleString()}
                </div>
                <button
                  onClick={() => onApplyRecommendation(rec.category, rec.recommendedAmount)}
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIBudgetRecommendations; 