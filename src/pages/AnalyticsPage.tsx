import React, { useState, useEffect } from 'react';
import { FaCalendarAlt } from '@react-icons/all-files/fa/FaCalendarAlt';
import { FaChartPie } from '@react-icons/all-files/fa/FaChartPie';
import { FaChartLine } from '@react-icons/all-files/fa/FaChartLine';
import { FaChartBar } from '@react-icons/all-files/fa/FaChartBar';
import { FaDownload } from '@react-icons/all-files/fa/FaDownload';
import { expenseService, budgetService, financialProfileService } from '../services/api';
// import { useAuth } from '../hooks/useAuth';
import { format, subMonths, startOfMonth, endOfMonth, subWeeks, subYears, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { Cell, ResponsiveContainer, Tooltip, BarChart, XAxis, YAxis, Bar, LineChart, Line } from 'recharts';
import './AnalyticsPage.css';

const AnalyticsPage: React.FC = () => {
  // const { user: currentUser } = useAuth();
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);
  const [incomeVsExpenses, setIncomeVsExpenses] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [previousPeriodData, setPreviousPeriodData] = useState<any>(null);
  const [currentPeriodData, setCurrentPeriodData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [timeFrame, startDate, endDate]);

  const getDateRangeForTimeFrame = (timeFrame: 'week' | 'month' | 'year' | 'custom', isPrevious: boolean = false) => {
    const now = new Date();
    let start, end;

    switch (timeFrame) {
      case 'week':
        if (isPrevious) {
          end = endOfWeek(subWeeks(now, 1));
          start = startOfWeek(subWeeks(now, 1));
        } else {
          end = endOfWeek(now);
          start = startOfWeek(now);
        }
        break;
      case 'month':
        if (isPrevious) {
          end = endOfMonth(subMonths(now, 1));
          start = startOfMonth(subMonths(now, 1));
        } else {
          end = endOfMonth(now);
          start = startOfMonth(now);
        }
        break;
      case 'year':
        if (isPrevious) {
          end = endOfYear(subYears(now, 1));
          start = startOfYear(subYears(now, 1));
        } else {
          end = endOfYear(now);
          start = startOfYear(now);
        }
        break;
      default:
        if (isPrevious) {
          const diff = endDate.getTime() - startDate.getTime();
          end = new Date(startDate.getTime() - 1);
          start = new Date(end.getTime() - diff);
        } else {
          start = startDate;
          end = endDate;
        }
    }

    return { start, end };
  };

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get financial profile for income data
      const profileRes = await financialProfileService.get();
      const profileData = profileRes.data.data;
      setMonthlyIncome(profileData?.monthlyIncome || 0);

      // Get current period data
      const currentRange = getDateRangeForTimeFrame(timeFrame);
      const currentRes = await expenseService.getByDateRange(
        format(currentRange.start, 'yyyy-MM-dd'),
        format(currentRange.end, 'yyyy-MM-dd')
      );
      setCurrentPeriodData(currentRes.data.data);

      // Get previous period data
      const previousRange = getDateRangeForTimeFrame(timeFrame, true);
      const previousRes = await expenseService.getByDateRange(
        format(previousRange.start, 'yyyy-MM-dd'),
        format(previousRange.end, 'yyyy-MM-dd')
      );
      setPreviousPeriodData(previousRes.data.data);

      // Process expense categories
      const categories = currentRes.data.data.expensesByCategory.map((cat: any) => ({
        name: cat.category,
        amount: cat.total,
        percentage: (cat.total / currentRes.data.data.totalExpenses) * 100,
        color: getCategoryColor(cat.category)
      }));
      setExpenseCategories(categories);

      // Process monthly expenses
      const monthlyData = currentRes.data.data.dailyExpenses.reduce((acc: { month: string; amount: number }[], expense: any) => {
        const month = format(new Date(expense._id), 'MMM');
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.amount += expense.total;
        } else {
          acc.push({ month, amount: expense.total });
        }
        return acc;
      }, []);
      setMonthlyExpenses(monthlyData);

      // Process income vs expenses
      const incomeVsExpData = monthlyData.map((item: { month: string; amount: number }) => ({
        month: item.month,
        income: profileData?.monthlyIncome || 0,
        expenses: item.amount
      }));
      setIncomeVsExpenses(incomeVsExpData);

    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.response?.data?.error || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (categoryName: string): string => {
    const colors = {
      'Housing': '#4B5563',
      'Food': '#EF4444',
      'Transportation': '#F59E0B',
      'Utilities': '#3B82F6',
      'Generator Fuel': '#8B5CF6',
      'Internet/Data': '#EC4899',
      'Others': '#10B981'
    };
    return colors[categoryName as keyof typeof colors] || '#6B7280';
  };

  const handleExport = async () => {
    try {
      // For now, just show a message that export is not implemented
      alert('Export functionality will be implemented soon!');
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  const handleTimeFrameChange = (newTimeFrame: 'week' | 'month' | 'year' | 'custom') => {
    setTimeFrame(newTimeFrame);
    const now = new Date();
    
    switch (newTimeFrame) {
      case 'week':
        setStartDate(new Date(now.setDate(now.getDate() - 7)));
        setEndDate(new Date());
        break;
      case 'month':
        setStartDate(startOfMonth(new Date()));
        setEndDate(endOfMonth(new Date()));
        break;
      case 'year':
        setStartDate(new Date(now.getFullYear(), 0, 1));
        setEndDate(new Date(now.getFullYear(), 11, 31));
        break;
      case 'custom':
        setShowDatePicker(true);
        break;
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (date > endDate) {
      setEndDate(date);
    }
    setStartDate(date);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (date < startDate) {
      setStartDate(date);
    }
    setEndDate(date);
  };

  // Calculate percentage changes
  const expenseChange = currentPeriodData && previousPeriodData
    ? calculatePercentageChange(currentPeriodData.totalExpenses, previousPeriodData.totalExpenses)
    : 0;

  const incomeChange = currentPeriodData && previousPeriodData
    ? calculatePercentageChange(monthlyIncome, previousPeriodData.totalExpenses)
    : 0;

  const savingsRate = monthlyIncome > 0 
    ? Math.round(((monthlyIncome - (currentPeriodData?.totalExpenses || 0)) / monthlyIncome) * 100)
    : 0;

  const previousSavingsRate = monthlyIncome > 0 && previousPeriodData
    ? Math.round(((monthlyIncome - previousPeriodData.totalExpenses) / monthlyIncome) * 100)
    : 0;

  const savingsRateChange = calculatePercentageChange(savingsRate, previousSavingsRate);

  // Calculate totals
  // const totalExpenses = expenseCategories.reduce((sum, category) => sum + category.amount, 0);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Analytics</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleExport}
            className="btn bg-white dark:bg-gray-800 border border-gray-300 text-gray-700 flex items-center"
          >
            <FaDownload className="mr-2" /> Export
          </button>
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="btn bg-white dark:bg-gray-800 border border-gray-300 text-gray-700 flex items-center"
          >
            <FaCalendarAlt className="mr-2" /> Select Date
          </button>
        </div>
      </div>

      {showDatePicker && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <div className="flex gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                id="start-date"
                type="date"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="border rounded-md p-2 w-full"
                aria-label="Select start date"
                title="Select start date"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                id="end-date"
                type="date"
                value={format(endDate, 'yyyy-MM-dd')}
                onChange={handleEndDateChange}
                className="border rounded-md p-2 w-full"
                aria-label="Select end date"
                title="Select end date"
              />
            </div>
          </div>
        </div>
      )}

      {/* Time Period Selection */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTimeFrameChange('week')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              timeFrame === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => handleTimeFrameChange('month')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              timeFrame === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => handleTimeFrameChange('year')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              timeFrame === 'year'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Year
          </button>
          <button
            onClick={() => handleTimeFrameChange('custom')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              timeFrame === 'custom'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Custom Range
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              {timeFrame === 'month' ? format(new Date(), 'MMM yyyy') : 
               timeFrame === 'week' ? 'This Week' : 
               timeFrame === 'year' ? format(new Date(), 'yyyy') : 'Custom Range'}
            </span>
          </div>
          <p className="text-2xl font-bold">₦{(currentPeriodData?.totalExpenses || 0).toLocaleString()}</p>
          <div className={`mt-2 text-sm ${expenseChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {expenseChange >= 0 ? '↑' : '↓'} {Math.abs(expenseChange).toFixed(1)}% from last {timeFrame}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {timeFrame === 'month' ? format(new Date(), 'MMM yyyy') : 
               timeFrame === 'week' ? 'This Week' : 
               timeFrame === 'year' ? format(new Date(), 'yyyy') : 'Custom Range'}
            </span>
          </div>
          <p className="text-2xl font-bold">₦{monthlyIncome.toLocaleString()}</p>
          <div className={`mt-2 text-sm ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(incomeChange).toFixed(1)}% from last {timeFrame}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">Savings Rate</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {timeFrame === 'month' ? format(new Date(), 'MMM yyyy') : 
               timeFrame === 'week' ? 'This Week' : 
               timeFrame === 'year' ? format(new Date(), 'yyyy') : 'Custom Range'}
            </span>
          </div>
          <p className="text-2xl font-bold">{savingsRate}%</p>
          <div className={`mt-2 text-sm ${savingsRateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {savingsRateChange >= 0 ? '↑' : '↓'} {Math.abs(savingsRateChange).toFixed(1)}% from last {timeFrame}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 mb-6 md:grid-cols-2">
        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Expense Breakdown</h3>
            <FaChartPie className="text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            {expenseCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseCategories}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                  <Bar dataKey="amount" fill={getCategoryColor('Expenses')}>
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No expense data available</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {expenseCategories.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="category-color"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm">{category.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">₦{category.amount.toLocaleString()}</span>
                  <span className="ml-2 text-xs text-gray-500">({category.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Income vs Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Income vs Expenses</h3>
            <FaChartBar className="text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            {incomeVsExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpenses}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                  <Bar dataKey="income" fill={getCategoryColor('Income')} name="Income" />
                  <Bar dataKey="expenses" fill={getCategoryColor('Expenses')} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No income vs expenses data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Expense Trend & Top Spending */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Expense Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Expense Trend</h3>
            <FaChartLine className="text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            {monthlyExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenses}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                  <Bar dataKey="amount" fill={getCategoryColor('Expenses')} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No expense trend data available</p>
            )}
          </div>
        </div>

        {/* Top Spending Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Top Spending Categories</h3>
            <select 
              className="text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={timeFrame}
              onChange={(e) => handleTimeFrameChange(e.target.value as 'week' | 'month' | 'year' | 'custom')}
              title='Select Time Frame'
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div className="space-y-4">
            {expenseCategories
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((category) => (
                <div key={category.name} className="flex items-center">
                  <div
                    className="category-dot"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm font-medium">₦{category.amount.toLocaleString()}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ 
                          width: `${category.percentage}%`,
                          backgroundColor: category.color
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            {expenseCategories.length === 0 && (
              <p className="text-gray-500 text-center">No spending data available for this period</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
