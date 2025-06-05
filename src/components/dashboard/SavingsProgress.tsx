import React from 'react';
import { Link } from 'react-router-dom';
import { ISavingGoal } from '../../services/db';

interface SavingsProgressProps {
  savingGoals: ISavingGoal[];
  monthlySavingsTarget: number;
  currentMonthSaved: number;
}

const SavingsProgress: React.FC<SavingsProgressProps> = ({
  savingGoals,
  monthlySavingsTarget,
  currentMonthSaved
}) => {
  const monthlySavingsPercentage = Math.round((currentMonthSaved / monthlySavingsTarget) * 100);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Savings Progress</h3>
        <Link to="/savings" className="text-sm text-primary-600 hover:underline">
          View All
        </Link>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Monthly Target</span>
          <span>
            ₦{currentMonthSaved.toLocaleString()} / ₦{monthlySavingsTarget.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-secondary-500 h-2.5 rounded-full"
            style={{ width: `${Math.min(monthlySavingsPercentage, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs mt-1 text-right">
          {monthlySavingsPercentage >= 100 ? (
            <span className="text-green-600">Target reached! 🎉</span>
          ) : (
            <span className="text-secondary-600">
              {monthlySavingsPercentage}% of monthly target
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {savingGoals.slice(0, 3).map((goal) => {
          const percentComplete = Math.round((goal.currentAmount / goal.targetAmount) * 100);
          
          return (
            <div key={goal.id}>
              <div className="flex justify-between text-sm mb-1">
                <span>{goal.name}</span>
                <span>
                  ₦{goal.currentAmount.toLocaleString()} / ₦{goal.targetAmount.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-secondary-500 h-2 rounded-full"
                  style={{ width: `${percentComplete}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1 flex justify-between">
                <span className="text-gray-500">{goal.category}</span>
                <span className="text-secondary-600">{percentComplete}% complete</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {savingGoals.length > 3 && (
        <div className="mt-3 text-center">
          <Link to="/savings" className="text-sm text-primary-600 hover:underline">
            +{savingGoals.length - 3} more goals
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavingsProgress;