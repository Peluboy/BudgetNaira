import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { IExpense } from '../../services/db';

interface RecentTransactionsProps {
  transactions: IExpense[];
  isLoading: boolean;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  isLoading
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Transactions</h3>
        <Link to="/expenses" className="text-sm text-primary-600 hover:underline">
          View All
        </Link>
      </div>
      
      {isLoading ? (
        <div className="py-4 text-center text-gray-500">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="py-4 text-center text-gray-500">No recent transactions</div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center">
                <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-600">💰</span>
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.category.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-600">-₦{transaction.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(transaction.date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;