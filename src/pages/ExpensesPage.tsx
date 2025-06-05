import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchExpenses, addExpense, updateExpense, deleteExpense } from '../store/slices/expensesSlice';
import { FaPlus } from '@react-icons/all-files/fa/FaPlus';
import { FaFilter } from '@react-icons/all-files/fa/FaFilter';
import { FaSort } from '@react-icons/all-files/fa/FaSort';
import { FaEdit } from '@react-icons/all-files/fa/FaEdit';
import { FaTrash } from '@react-icons/all-files/fa/FaTrash';
import { FaSearch } from '@react-icons/all-files/fa/FaSearch';
import { FaChartPie } from '@react-icons/all-files/fa/FaChartPie';

import { format } from 'date-fns';
import { IExpense } from '../services/db';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import ExpenseFilterModal from '../components/expenses/ExpenseFilterModal';
import api, { expenseService } from '../services/api';
import SplitBillModal from '../components/expenses/SplitBillModal';
import { FaUsers } from 'react-icons/fa';
import SplitDetailsModal from '../components/expenses/SplitDetailsModal';
import DeleteConfirmationModal from '../components/savings/DeleteConfirmationModal';

const ExpensesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {  status } = useSelector((state: RootState) => state.expenses);
  const [expensesData, setExpensesData] = useState<any[]>([]);
    const [, setError] = useState<string | null>(null);
    const [, setOverview] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  // Split bill modal state
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitExpense, setSplitExpense] = useState<IExpense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // View split details modal state
  const [isSplitDetailsModalOpen, setIsSplitDetailsModalOpen] = useState(false);
  const [splitDetailsExpense, setSplitDetailsExpense] = useState<IExpense | null>(null);

  const [showBudgetExpenses, setShowBudgetExpenses] = useState(true);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    dateRange: {
      start: null as Date | null,
      end: null as Date | null
    },
    minAmount: null as number | null,
    maxAmount: null as number | null,
    paymentMethods: [] as string[]
  });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchExpenses());
    }
  }, [status, dispatch]);

  useEffect(() => {
    const fetchExpensesData = async () => {
      try {
        const res = await expenseService.getAll();
        setExpensesData(res.data.data);
      } catch (error) {
        console.error('Failed to fetch expenses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpensesData();
  }, []);

  // const handleAddExpense = (expense: Omit<IExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
  //   dispatch(addExpense(expense));
  //   setIsAddModalOpen(false);
  // };

  const handleCreateExpenses = async (expensesData: any) => {
    try {
      // Add isFromBudget flag if it's a budget expense
      const expenseData = {
        ...expensesData,
        isFromBudget: expensesData.isFromBudget || false,
        budgetId: expensesData.budgetId || null,
        budgetName: expensesData.budgetName || null
      };

      const res = await expenseService.create(expenseData);
      // Fetch the complete expense data with category details
      const newExpense = await expenseService.getById(res.data.data._id);
      setExpensesData(prev => [...prev, newExpense.data.data]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to create expenses', error);
    }
  };

  const handleUpdateExpense = (expense: IExpense) => {
    dispatch(updateExpense(expense));
    setSelectedExpense(null);
    setIsAddModalOpen(false);
  };

const handleDeleteExpense = async () => {
  if (!selectedExpense || !selectedExpense._id) {
    console.error('No expense selected for deletion or missing ID');
    return;
  }
  
  try {
    setLoading(true);
    
    // Use the expenseService instead of direct API call
    await expenseService.delete(selectedExpense._id);
    
    // Remove the expense from local state
    setExpensesData(prevExpenses => 
      prevExpenses.filter(expense => expense._id !== selectedExpense._id)
    );
    
    setIsDeleteModalOpen(false);
    setSelectedExpense(null);
    
    // Refresh overview data
    const overviewResponse = await expenseService.getOverview();
    setOverview(overviewResponse.data.data);
  } catch (err: any) {
    console.error('Failed to delete expense:', err);
    setError(err.response?.data?.error || 'Failed to delete expense');
  } finally {
    setLoading(false);
  }
};

  const handleEditExpense = (expense: IExpense) => {
    setSelectedExpense(expense);
    setIsAddModalOpen(true);
  };

  // Handle opening split bill modal
  const handleSplitBill = (expense: IExpense) => {
    setSplitExpense(expense);
    setIsSplitModalOpen(true);
  };

  // Handle save split
const handleSaveSplit = async (participants: any[], accountDetails?: any) => {
  if (!splitExpense) {
    console.warn('No splitExpense - aborting');
    return;
  }
  
  try {
    setLoading(true);
    const { _id } = splitExpense; // Changed from `id` to `_id`
    
    if (!_id) { // Changed from `id` to `_id`
      console.warn('No expense ID - aborting');
      return;
    }
  
    const response = await expenseService.splitExpense(
      _id, 
      participants,
      accountDetails
    );
    
    // Update the rest of your code to use _id where needed
const updatedExpenses = expensesData.map(expense => 
      expense._id === splitExpense._id 
        ? { 
            ...expense, 
            isSplit: true, 
            participants,
            accountDetails
          } 
        : expense
    );
    
    setExpensesData(updatedExpenses);
     // Show success message or notification
  } catch (error) {
    console.error('Failed to save split:', error);
  } finally {
    setLoading(false);
  }
};
  // Handle marking a split as settled
  const handleSettleSplit = async (expenseId: string, participantId: string) => {
      if (!expenseId || !participantId) {
    console.error("Invalid IDs:", { expenseId, participantId });
    return;
  }
    try {
      setLoading(true);
      
      // Call API to mark the split as settled
      const response = await expenseService.settleExpense(expenseId, participantId);
      
      // Update the expense data
      const updatedExpenses = expensesData.map(expense => {
        if (expense.id === expenseId) {
          // Update the participant's settled status
          const updatedParticipants = expense.participants.map((p:any) => 
            p.id === participantId ? { ...p, settled: true, settledDate: new Date() } : p
          );
          
          return { ...expense, participants: updatedParticipants };
        }
        return expense;
      });
      
      setExpensesData(updatedExpenses);
      
      // If currently viewing split details for this expense, update that too
      if (splitDetailsExpense && splitDetailsExpense.id === expenseId) {
        const updatedParticipants = splitDetailsExpense.participants.map((p:any) => 
          p.id === participantId ? { ...p, settled: true, settledDate: new Date() } : p
        );
        
        setSplitDetailsExpense({ ...splitDetailsExpense, participants: updatedParticipants });
      }
      
    } catch (error) {
      console.error('Failed to mark as settled:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening split details modal
  const handleViewSplitDetails = (expense: IExpense) => {
    setSplitDetailsExpense(expense);
    setIsSplitDetailsModalOpen(true);
  };

  const handleToggleBudgetExpenses = () => {
    setShowBudgetExpenses(prev => !prev);
  };

  // Filter expenses based on search term, filters, and budget toggle
  const filteredExpenses = expensesData
    .filter(expense => {
      // Search term filter
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Budget expenses filter
      const matchesBudget = showBudgetExpenses ? true : !(expense.isFromBudget || expense.budgetId);

      // Category filter
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(expense.category._id);

      // Date range filter
      const expenseDate = new Date(expense.date);
      const matchesDateRange = (!filters.dateRange.start || expenseDate >= filters.dateRange.start) &&
        (!filters.dateRange.end || expenseDate <= filters.dateRange.end);

      // Amount range filter
      const matchesAmountRange = (!filters.minAmount || expense.amount >= filters.minAmount) &&
        (!filters.maxAmount || expense.amount <= filters.maxAmount);

      // Payment method filter
      const matchesPaymentMethod = filters.paymentMethods.length === 0 ||
        filters.paymentMethods.includes(expense.paymentMethod);

      return matchesSearch && matchesBudget && matchesCategory && 
        matchesDateRange && matchesAmountRange && matchesPaymentMethod;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetExpensesCount = expensesData.filter(expense => expense.isFromBudget || expense.budgetId).length;

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      dateRange: {
        start: null,
        end: null
      },
      minAmount: null,
      maxAmount: null,
      paymentMethods: []
    });
  };

return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Expenses</h1>
        <button
          onClick={() => {
            setSelectedExpense(null);
            setIsAddModalOpen(true);
          }}
          className="btn btn-primary flex items-center"
        >
          <FaPlus className="mr-2" /> Add Expense
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search expenses..."
            className="pl-10 input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="btn bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 flex items-center"
          >
            <FaFilter className="mr-2" /> Filter
          </button>
          <button
            onClick={handleToggleBudgetExpenses}
            className={`btn flex items-center ${
              showBudgetExpenses 
                ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' 
                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'
            }`}
            title={showBudgetExpenses ? "Hide budget expenses" : "Show budget expenses"}
          >
            <FaChartPie className="mr-2" /> Budget Expenses
            {budgetExpensesCount > 0 && (
              <span className="ml-2 bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200 px-2 py-0.5 rounded-full text-xs">
                {budgetExpensesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => toggleSort('date')}
            className={`btn flex items-center ${
              sortBy === 'date' 
                ? 'bg-gray-200 dark:bg-gray-600' 
                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
            } text-gray-700 dark:text-gray-200`}
          >
            <FaSort className="mr-2" /> Date
            {sortBy === 'date' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
          </button>
          <button
            onClick={() => toggleSort('amount')}
            className={`btn flex items-center ${
              sortBy === 'amount' 
                ? 'bg-gray-200 dark:bg-gray-600' 
                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
            } text-gray-700 dark:text-gray-200`}
          >
            <FaSort className="mr-2" /> Amount
            {sortBy === 'amount' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
            <p className="text-xl font-bold dark:text-white">₦{totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Number of Transactions</p>
            <p className="text-xl font-bold dark:text-white">{filteredExpenses.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Budget Expenses</p>
            <p className="text-xl font-bold dark:text-white">{budgetExpensesCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Average Expense</p>
            <p className="text-xl font-bold dark:text-white">
              ₦{filteredExpenses.length ? Math.round(totalAmount / filteredExpenses.length).toLocaleString() : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {loading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading expenses...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No expenses found</p>
            <button
              onClick={() => {
                setSelectedExpense(null);
                setIsAddModalOpen(true);
              }}
              className="btn btn-primary"
            >
              Add Your First Expense
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="table-header">
                      Description
                    </th>
                    <th scope="col" className="table-header">
                      Category
                    </th>
                    <th scope="col" className="table-header">
                      Date
                    </th>
                    <th scope="col" className="table-header">
                      Amount
                    </th>
                    <th scope="col" className="table-header">
                      Status
                    </th>
                    <th scope="col" className="table-header">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {expense.description}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{expense.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                          {expense.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(expense.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">
                        ₦{expense.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {expense.isSplit ? (
                          <button
                            onClick={() => handleViewSplitDetails(expense)}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400"
                          >
                            <FaUsers className="mr-1" />
                            Split ({expense.participants.length})
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            Individual
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            title="Edit"
                            onClick={() => handleEditExpense(expense)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                          >
                            <FaEdit />
                          </button>
                          <button
                            title="Delete"
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            onClick={() => {
                              setSelectedExpense(expense);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <FaTrash />
                          </button>
                          {expense.isSplit ? (
                            <button
                              title="View Split Details"
                              onClick={() => handleViewSplitDetails(expense)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            >
                              <FaUsers />
                            </button>
                          ) : (
                            <button
                              title="Split Bill"
                              onClick={() => handleSplitBill(expense)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            >
                              Split
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600 text-right text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredExpenses.length} of {expensesData.length} expenses
            </div>
          </>
        )}
      </div>
      
      {/* Split Bill Modal */}
      <SplitBillModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        onSave={handleSaveSplit}
        totalAmount={splitExpense?.amount || 0}
        existingParticipants={splitExpense?.participants}
        expenseId={splitExpense?.id}
      />

      {/* Split Details Modal */}
      <SplitDetailsModal
        isOpen={isSplitDetailsModalOpen}
        onClose={() => setIsSplitDetailsModalOpen(false)}
        expense={splitDetailsExpense}
        onMarkSettled={handleSettleSplit}
      />

      {/* Add/Edit Expense Modal */}
      {isAddModalOpen && (
        <AddExpenseModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedExpense(null);
          }}
          onSave={selectedExpense ? handleUpdateExpense : handleCreateExpenses}
          expense={selectedExpense}
        />
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <ExpenseFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          currentFilters={filters}
          categories={expensesData.reduce((acc: any[], expense) => {
            if (!acc.find(cat => cat._id === expense.category._id)) {
              acc.push(expense.category);
            }
            return acc;
          }, [])}
          paymentMethods={Array.from(new Set(expensesData.map(expense => expense.paymentMethod)))}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedExpense && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedExpense(null);
          }}
          onConfirm={handleDeleteExpense}
          title="Delete Expense"
          message={`Are you sure you want to delete "${selectedExpense.description}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default ExpensesPage;
