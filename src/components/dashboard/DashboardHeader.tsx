import React from 'react';
import { format } from 'date-fns';

interface DashboardHeaderProps {
  userName?: string;
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName = 'User',
  currentBalance,
  monthlyIncome,
  monthlyExpenses
}) => {
  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');
  const savingsRate = Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Hello, {userName}!</h1>
          <p className="text-gray-500 dark:text-gray-400">{currentDate}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
          <p className="text-xl font-bold dark:text-white">₦{currentBalance.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-md">
          <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Income</p>
          <p className="text-lg font-bold text-primary-700 dark:text-primary-400">₦{monthlyIncome.toLocaleString()}</p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Expenses</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">₦{monthlyExpenses.toLocaleString()}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <p className="text-xs text-gray-500 dark:text-gray-400">Savings</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">₦{(monthlyIncome - monthlyExpenses).toLocaleString()}</p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
          <p className="text-xs text-gray-500 dark:text-gray-400">Savings Rate</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{savingsRate}%</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;