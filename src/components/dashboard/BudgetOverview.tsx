import React from 'react';
import { Link } from 'react-router-dom';
import EventForm from './EventForm';

interface BudgetCategory {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentSpent: number;
}

interface BudgetOverviewProps {
  budgets: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budgets,
  totalBudget,
  totalSpent
}) => {
  const totalPercentSpent = Math.round((totalSpent / totalBudget) * 100);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium dark:text-white">Budget Overview</h3>
        <Link to="/budget" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          View All
        </Link>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700 dark:text-gray-200">Total Budget</span>
          <span className="text-gray-700 dark:text-gray-200">
            ₦{totalSpent.toLocaleString()} / ₦{totalBudget.toLocaleString()} ({totalPercentSpent}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              totalPercentSpent > 100
                ? 'bg-red-600'
                : totalPercentSpent > 75
                ? 'bg-yellow-500'
                : 'bg-primary-600'
            }`}
            style={{ width: `${Math.min(totalPercentSpent, 100)}%` }}
          ></div>
        </div>
      </div>
      <EventForm onSubmit={()=>{}}/>
      <div className="space-y-3">
        {budgets.map((budget) => (
          <div key={budget.category}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-200">{budget.category}</span>
              <span className="text-gray-700 dark:text-gray-200">
                ₦{budget.spent.toLocaleString()} / ₦{budget.allocated.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  budget.percentSpent > 100
                    ? 'bg-red-600'
                    : budget.percentSpent > 75
                    ? 'bg-yellow-500'
                    : 'bg-primary-600'
                }`}
                style={{ width: `${Math.min(budget.percentSpent, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs mt-1 flex justify-end">
              {budget.remaining < 0 ? (
                <span className="text-red-600 dark:text-red-400">Over budget by ₦{Math.abs(budget.remaining).toLocaleString()}</span>
              ) : (
                <span className="text-green-600 dark:text-green-400">₦{budget.remaining.toLocaleString()} remaining</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetOverview;