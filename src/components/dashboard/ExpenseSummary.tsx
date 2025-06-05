import React from 'react';
import { FaArrowUp } from '@react-icons/all-files/fa/FaArrowUp';
import { FaArrowDown } from '@react-icons/all-files/fa/FaArrowDown';

interface CategoryExpense {
    category: string;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'neutral';
    trendPercentage: number;
  }
  
  interface ExpenseSummaryProps {
    totalExpense: number;
    previousPeriodExpense: number;
    topCategories: CategoryExpense[];
    period: 'weekly' | 'monthly' | 'yearly';
  }
  
  const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
    totalExpense,
    previousPeriodExpense,
    topCategories,
    period
  }) => {
    const expenseChange = ((totalExpense - previousPeriodExpense) / previousPeriodExpense) * 100;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium mb-4 dark:text-white">Expense Summary</h3>
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{period.charAt(0).toUpperCase() + period.slice(1)} Expenses</p>
            <p className="text-2xl font-bold dark:text-white">₦{totalExpense.toLocaleString()}</p>
          </div>
          
          <div className={`text-sm flex items-center ${
            expenseChange > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>
            {expenseChange > 0 ? (
              <>
                <FaArrowUp className="mr-1" />
                {Math.abs(Math.round(expenseChange))}% from last {period}
              </>
            ) : (
              <>
                <FaArrowDown className="mr-1" />
                {Math.abs(Math.round(expenseChange))}% from last {period}
              </>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          {topCategories.map((category) => (
            <div key={category.category}>
              <div className="flex justify-between text-sm mb-1">
                <span>{category.category}</span>
                <div className="flex items-center">
                  <span className="mr-2">₦{category.amount.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">({category.percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-primary-600"
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1 flex justify-end">
                {category.trend === 'up' ? (
                  <span className="text-red-600 flex items-center">
                    <FaArrowUp className="mr-1" size={10} /> {category.trendPercentage}%
                  </span>
                ) : category.trend === 'down' ? (
                  <span className="text-green-600 flex items-center">
                    <FaArrowDown className="mr-1" size={10} /> {category.trendPercentage}%
                  </span>
                ) : (
                  <span className="text-gray-500">No change</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default ExpenseSummary;