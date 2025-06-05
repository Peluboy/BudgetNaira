import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchExpenses } from '../store/slices/expensesSlice';
import { format } from 'date-fns';
import { FaArrowUp } from '@react-icons/all-files/fa/FaArrowUp';
import { FaArrowDown } from '@react-icons/all-files/fa/FaArrowDown';
import { budgetService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import FinancialHealthScore from '../components/dashboard/FinancialHealthScore';
import FinancialCalendar from '../components/dashboard/FinancialCalendar';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useAuth();
  const { items: expenses, status: expensesStatus } = useSelector(
    (state: RootState) => state.expenses
  );

  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch expenses
        if (expensesStatus === 'idle') {
          await dispatch(fetchExpenses());
        }

        // Fetch budgets
        const budgetRes = await budgetService.getAll();
        if (budgetRes.data?.data) {
          setBudgets(budgetRes.data.data);
        }

        // Fetch overview
        const overviewRes = await budgetService.getOverview();
        if (overviewRes.data?.data) {
          setOverview(overviewRes.data.data);
        }

      } catch (err: any) {
        console.error('Dashboard data fetch error:', err);
        setError(err.response?.data?.message || 'Failed to fetch dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [dispatch, expensesStatus, currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Calculate current month's expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && 
           expenseDate.getFullYear() === currentYear;
  });
  
  const totalExpenseThisMonth = thisMonthExpenses.reduce(
    (total, expense) => total + expense.amount, 
    0
  );

  const totalBudget = budgets.reduce((sum, budget) => sum + (Number(budget.amount) || 0), 0);
  // const totalSpent = budgets.reduce((sum, budget) => sum + (Number(budget.spent) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Financial Health Score */}
        <div className="lg:col-span-1">
          <FinancialHealthScore userId={currentUser?.id || ''} />
        </div>

        {/* Monthly Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-medium mb-4">Monthly Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</div>
                <div className="text-2xl font-bold mt-1">₦{totalExpenseThisMonth.toLocaleString()}</div>
                <div className="flex items-center mt-2 text-sm">
                  <FaArrowUp className="text-red-500 mr-1" />
                  <span className="text-red-500">12% from last month</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Budget</div>
                <div className="text-2xl font-bold mt-1">
                  ₦{totalBudget.toLocaleString()}
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <FaArrowDown className="text-green-500 mr-1" />
                  <span className="text-green-500">5% from last month</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-medium mb-4">Financial Calendar</h2>
            <FinancialCalendar />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-medium mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {thisMonthExpenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-xs text-gray-500">{format(new Date(expense.date), 'MMM dd, yyyy')}</p>
                  </div>
                  <p className="font-medium">₦{expense.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-medium mb-4">Upcoming Bills</h2>
            <div className="space-y-3">
              {overview?.upcomingBills?.map((bill: any) => (
                <div key={bill.id} className="flex justify-between py-2 border-b dark:border-gray-700">
                  <div>
                    <p className="font-medium">{bill.name}</p>
                    <p className="text-xs text-gray-500">Due in {bill.daysUntilDue} days</p>
                  </div>
                  <p className="font-medium">₦{bill.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;