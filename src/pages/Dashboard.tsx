import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchExpenses } from '../store/slices/expensesSlice';
import { format, subMonths, isSameMonth, isSameYear } from 'date-fns';
import { FaArrowUp } from '@react-icons/all-files/fa/FaArrowUp';
import { FaArrowDown } from '@react-icons/all-files/fa/FaArrowDown';
import { FaWallet } from '@react-icons/all-files/fa/FaWallet';
import { FaChartLine } from '@react-icons/all-files/fa/FaChartLine';
import { FaCalendarAlt } from '@react-icons/all-files/fa/FaCalendarAlt';
import { FaBell } from '@react-icons/all-files/fa/FaBell';
import { budgetService, expenseService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import FinancialHealthScore from '../components/dashboard/FinancialHealthScore';
import FinancialCalendar from '../components/dashboard/FinancialCalendar';
import LifestyleCostCalculator from '../components/dashboard/LifestyleCostCalculator';
import { IExpense } from '../services/db';

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
  const totalSpent = budgets.reduce((sum, budget) => sum + (Number(budget.spent) || 0), 0);

  // Calculate month-over-month change
  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const lastMonth = subMonths(new Date(), 1);
    return isSameMonth(expenseDate, lastMonth) && isSameYear(expenseDate, lastMonth);
  });

  const totalLastMonth = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthOverMonthChange = totalLastMonth ? ((totalExpenseThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Financial Health Score */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Financial Health</h2>
            <FaChartLine className="text-primary-600" />
          </div>
          <FinancialHealthScore userId={currentUser?.id || ''} />
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Monthly Expenses</h2>
            <FaWallet className="text-primary-600" />
          </div>
          <div className="text-3xl font-bold mb-2">₦{totalExpenseThisMonth.toLocaleString()}</div>
          <div className="flex items-center text-sm">
            {monthOverMonthChange > 0 ? (
              <FaArrowUp className="text-red-500 mr-1" />
            ) : (
              <FaArrowDown className="text-green-500 mr-1" />
            )}
            <span className={monthOverMonthChange > 0 ? 'text-red-500' : 'text-green-500'}>
              {Math.abs(monthOverMonthChange).toFixed(1)}% from last month
            </span>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Budget Overview</h2>
            <FaChartLine className="text-primary-600" />
          </div>
          <div className="text-3xl font-bold mb-2">₦{totalBudget.toLocaleString()}</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
            <div 
              className="h-2.5 rounded-full bg-primary-600"
              style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-500">
            {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget used
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Upcoming Events</h2>
            <FaCalendarAlt className="text-primary-600" />
          </div>
          <div className="space-y-3">
            {overview?.upcomingBills?.slice(0, 3).map((bill: any) => (
              <div key={bill.id} className="flex justify-between items-center">
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

      {/* Financial Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Financial Calendar</h2>
          <FaCalendarAlt className="text-primary-600" />
        </div>
        <FinancialCalendar />
      </div>

      {/* Lifestyle Cost Calculator */}
      <LifestyleCostCalculator />

      {/* Recent Transactions and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Recent Transactions</h2>
            <FaWallet className="text-primary-600" />
          </div>
          <div className="space-y-4">
            {thisMonthExpenses.slice(0, 5).map((expense: IExpense) => (
              <div key={expense.id || expense._id} className="flex justify-between items-center py-3 border-b dark:border-gray-700">
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-sm text-gray-500">{format(new Date(expense.date), 'MMM dd, yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₦{expense.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{expense.category.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Notifications</h2>
            <FaBell className="text-primary-600" />
          </div>
          <div className="space-y-4">
            {overview?.notifications?.map((notification: any) => (
              <div key={notification.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-gray-500">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{format(new Date(notification.date), 'MMM dd, yyyy')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;