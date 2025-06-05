import React, { useEffect, useState } from 'react';
import AddBudgetModal from '../components/budget/AddBudgetModal';
import { FaPlus } from '@react-icons/all-files/fa/FaPlus';
import { FaChartPie } from '@react-icons/all-files/fa/FaChartPie';
import { FaRegCalendarAlt } from '@react-icons/all-files/fa/FaRegCalendarAlt';
import { FaEllipsisH } from '@react-icons/all-files/fa/FaEllipsisH';
import { budgetService, expenseService, categoryService } from '../services/api';
import { format } from 'date-fns';
import { Cell, ResponsiveContainer, Tooltip, BarChart, XAxis, YAxis, Bar } from 'recharts';
import DeleteConfirmationModal from '../components/savings/DeleteConfirmationModal';
import { FaTrash } from 'react-icons/fa';
import AddSpentModal from '../components/budget/AddSpentModal';
// import { useAuth } from '../hooks/useAuth';

const BudgetPage: React.FC = () => {
  // const { user: currentUser } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [timeFrame, setTimeFrame] = useState<'month' | 'week'>('month');
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState<string | null>(null);
  const [isAddSpentModalOpen, setIsAddSpentModalOpen] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [, setOverview] = useState<any>(null);
  const [, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await budgetService.getAll();
        setBudgets(res.data.data);
      } catch (error) {
        console.error('Failed to fetch budgets', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAll();
        setCategories(res.data.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Toggle context menu for a goal
  const toggleContextMenu = (budgetId: string) => {
    if (isContextMenuOpen === budgetId) {
      setIsContextMenuOpen(null);
    } else {
      setIsContextMenuOpen(budgetId);
    }
  };

  const handleOpenDeleteModal = (budget: any) => {
    setSelectedBudget(budget);
    setIsDeleteModalOpen(true);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-container')) {
        setSelectedBudget(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Filter budgets based on activeTab
  const filteredBudgets = budgets.filter(budget => {
    const now = new Date();
    const endDate = new Date(budget.endDate);
    return activeTab === 'active' ? endDate >= now : endDate < now;
  });

  // Budget summary - use all budgets for totals
  const totalBudget = budgets.reduce((sum, budget) => sum + (Number(budget.amount ?? 0)), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (Number(budget.spent ?? 0)), 0);
  const percentSpent = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;

  if (loading) {
    return <div>Loading budgets...</div>;
  }

  const handleCreateBudget = async (budgetData: any) => {
    try {
      // The category ID is already being passed from the form
      const budgetToCreate = {
        ...budgetData,
        category: budgetData.category, // This is already the category ID from the form
      };
      const res = await budgetService.create(budgetToCreate);
      setBudgets(prev => [...prev, res.data.data]);
      setIsAddModalOpen(false); 
    } catch (error) {
      console.error('Failed to create budget', error);
      setError(error instanceof Error ? error.message : 'Failed to create budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await budgetService.delete(id);
      setIsDeleteModalOpen(false);
      setBudgets(prev => prev.filter(budget => budget._id !== id));
    } catch (error) {
      console.error('Failed to delete budget', error);
    }
  };
  
  const handleUpdateBudget = async (id: string, updatedBudget: any) => {
    try {
      const response = await budgetService.update(id, updatedBudget);
      console.log('Budget updated successfully', response.data);
      setBudgets(prev => prev.filter(budget => budget._id !== id));
      // Optionally: refetch your budgets or update UI state
    } catch (error) {
      console.error('Failed to update budget', error);
    }
  };

  const handleAddSpent = async (amount: number, paymentMethod: string, category: string) => {
    try {
      setLoading(true);
      
      if (!selectedBudget?.category?._id) {
        throw new Error('Budget category is missing');
      }

      // Create a new expense instead of updating budget directly
      const expenseData = {
        amount,
        category: selectedBudget.category._id,
        date: new Date(),
        description: `Budget spending for ${selectedBudget.name}`,
        paymentMethod: paymentMethod || 'cash',
        type: 'expense',
        isFromBudget: true,
        budgetId: selectedBudget._id,
        budgetName: selectedBudget.name
      };

      await expenseService.create(expenseData);

      // Refresh budget overview to get updated spent amounts
      const overviewResponse = await budgetService.getOverview();
      setOverview(overviewResponse.data.data);

      // Refresh budgets list
      const budgetsResponse = await budgetService.getAll();
      setBudgets(budgetsResponse.data.data);

      setIsAddSpentModalOpen(false);
      setSelectedBudget(null);
    } catch (err: any) {
      console.error('Error in handleAddSpent:', err);
      setError(err.response?.data?.error || err.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  // Chart data - use all budgets for distribution
  const chartData = budgets.reduce((acc: { name: string; value: number }[], budget) => {
    const existing = acc.find(item => item.name === budget.category.name);
    if (existing) {
      existing.value += budget.amount;
    } else {
      acc.push({ name: budget.category.name, value: budget.amount });
    }
    return acc;
  }, []); 
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white text-gray-800">Budget</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedBudget(null);
              setIsAddModalOpen(true);
            }}
            className="btn btn-primary flex items-center"
          >
            <FaPlus className="mr-2" /> Create Budget
          </button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-200">Total Budget</h3>
            <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 dark:text-gray-300 rounded">
              {timeFrame === 'month' ? 'Apr 2025' : 'This Week'}
            </span>
          </div>
          <p className="text-2xl font-bold dark:text-white">₦{totalBudget.toLocaleString()}</p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-200">
            {budgets.length} active budgets
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-200">Spent So Far</h3>
            <span className={`text-xs px-2 py-1 rounded ${
              percentSpent > 90 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {percentSpent}% of total
            </span>
            
          </div>
          <p className="text-2xl font-bold dark:text-white">₦{totalSpent}</p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-200">
            ₦{((totalBudget || 0) - (totalSpent || 0)).toLocaleString()} remaining

          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-200">Budget Distribution</h3>
            <FaChartPie className="text-gray-400" />
          </div>
          <div className="h-16 flex items-center justify-center">
          <div className="w-16 h-16">
          {chartData.length > 0 ? (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={chartData}>
      <XAxis dataKey="name" hide />
      <YAxis hide />
      <Tooltip formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Amount']} />
      <Bar dataKey="value">
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
) : (
  <div className="text-gray-400 text-sm">No Data</div>
)}
          </div>
          </div>
        </div>
      </div>
      {/* Tabs and Timeframe Selection */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="tabs mb-4 sm:mb-0">
          <button
            className={`mr-4 pb-2 text-sm font-medium ${
              activeTab === 'active'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 dark:text-gray-200 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('active')}
          >
            Active Budgets
          </button>
          <button
            className={`pb-2 text-sm font-medium ${
              activeTab === 'completed'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 dark:text-gray-200 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            Completed Budgets
          </button>
        </div>
        
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500 dark:text-gray-200">View:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                timeFrame === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setTimeFrame('month')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                timeFrame === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setTimeFrame('week')}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {/* Budget List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBudgets.length > 0 ? (
          filteredBudgets.map((budget) => (
            <div key={budget._id} className="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">{budget.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-200">{budget.period}</p>
                  </div>
                  <div className="relative menu-container">
                  <button
                    onClick={() => toggleContextMenu(budget._id)}
                    className="text-gray-400 hover:text-gray-600"    title="More"
                  >
          <FaEllipsisH />
        </button>

{isContextMenuOpen === budget._id && (
  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 shadow-md rounded-md z-10">
    <button
      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
      onClick={() => {
        setIsAddModalOpen(true);
        setSelectedBudget(budget);
      }}
    >
      Edit Budget
    </button>
    <button
      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
onClick={() => handleOpenDeleteModal(budget)}
    >
       <FaTrash className="mr-2" /> Delete Budget
    </button>
  </div>
)}
  </div>
                </div>
                
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className='dark:text-gray-400'>
                      ₦{(budget.spent || 0).toLocaleString()} of ₦{(budget.amount || 0).toLocaleString()}
                    </span>
                    <span className='dark:text-gray-400'>{Math.round(((budget.spent || 0) / (budget.amount || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        budget.spent / budget.amount > 1
                          ? 'bg-red-600'
                          : budget.spent / budget.amount > 0.8
                          ? 'bg-yellow-500'
                          : 'bg-primary-600'
                      }`}
                      style={{ width: `${Math.min(Math.round(((budget.spent || 0) / (budget.amount || 1)) * 100), 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-200">
                  <div className="flex items-center">
                    <FaRegCalendarAlt className="mr-1" />
                    <span>
{format(new Date(budget.startDate), 'MMM dd, yyyy')} - {format(new Date(budget.endDate), 'MMM dd, yyyy')}
</span>
                  </div>
                  <span className={`font-medium ${
                    budget.spent > budget.amount
                      ? 'text-red-600'
                      : budget.spent / budget.amount > 0.8
                      ? 'text-yellow-600'
                      : 'text-primary-600'
                  }`}>
                    ₦{((budget.amount || 0) - (budget.spent || 0)).toLocaleString()} left
                  </span>
                </div>
              </div>
              
              <div className={`px-4 py-2 text-xs flex justify-between items-center font-medium ${
                budget.spent > budget.amount
                  ? 'bg-red-100 text-red-800'
                  : budget.spent / budget.amount > 0.8
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {budget.spent > budget.amount
                  ? 'Over budget'
                  : budget.spent / budget.amount > 0.8
                  ? 'Approaching limit'
                  : 'On track'}
                   <button 
                      className="text-xs text-primary-600 font-medium"
                      onClick={(e) => {
                        e.stopPropagation(); // Add this to prevent event bubbling
                        console.log('Opening AddSpentModal with budget:', budget);
                        console.log('Budget category:', budget.category);
                        setSelectedBudget(budget);
                        setIsAddSpentModalOpen(true);
                      }}
                    >
                      Add Spent
                    </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-md shadow-sm p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {activeTab === 'active' 
                ? "You don't have any active budgets yet."
                : "You don't have any completed budgets yet."}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={() => {
                  setSelectedBudget(null);
                  setIsAddModalOpen(true);
                }}
                className="mt-4 btn btn-primary inline-flex items-center"
              >
                <FaPlus className="mr-2" /> Create Budget
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Budget Modal */}
      {isAddModalOpen && (
        <AddBudgetModal
          isOpen={isAddModalOpen}
          onSave={handleCreateBudget}
          onSubmit={selectedBudget ? (data) => handleUpdateBudget(selectedBudget._id, data) : handleCreateBudget}
          selectedBudget={selectedBudget}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedBudget(null);
          }}
        />
      )}

      {isAddSpentModalOpen && selectedBudget && (
        <AddSpentModal
          isOpen={isAddSpentModalOpen}
          onClose={() => {
            setIsAddSpentModalOpen(false);
            setSelectedBudget(null);
          }}
          onAddSpent={handleAddSpent}
          budget={selectedBudget}
        />
      )}
      {/* Delete Confirmation Modal */}
{isDeleteModalOpen && selectedBudget && (
  <DeleteConfirmationModal
    isOpen={isDeleteModalOpen}
    onClose={() => {
      setIsDeleteModalOpen(false);
      setSelectedBudget(null);
    }}
    onConfirm={() => handleDeleteBudget(selectedBudget._id)}
    title="Delete Budget"
    message={`Are you sure you want to delete the "${selectedBudget.name}" budget? This action cannot be undone.`}
  />
)}
    </div>
  );
};

export default BudgetPage;