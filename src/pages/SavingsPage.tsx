import React, { useState, useEffect } from 'react';
import { FaPlus, FaPiggyBank, FaRegCalendarAlt, FaEllipsisH, FaEdit, FaTrash } from 'react-icons/fa';
import { CreditCard } from "phosphor-react";

import api from '../services/api';
import AddSavingGoalModal from '../components/savings/AddSavingGoalModal';
import AddFundsModal from '../components/savings/AddFundsModal';
import DeleteConfirmationModal from '../components/savings/DeleteConfirmationModal';

const SavingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [completedGoals, setCompletedGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any>(null);
  
  // Modal states
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState<string | null>(null);

  // Fetch savings goals and overview data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch savings goals
        const goalsResponse = await api.get('/savings');
        
        // Fetch overview data
        const overviewResponse = await api.get('/savings/overview');
        
        // Separate active and completed goals
        const active = goalsResponse.data.data.filter((goal: any) => !goal.isCompleted);
        const completed = goalsResponse.data.data.filter((goal: any) => goal.isCompleted);
        
        setSavingsGoals(active);
        setCompletedGoals(completed);
        setOverview(overviewResponse.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load savings goals');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle creating a new saving goal
  const handleCreateGoal = async (goalData: any) => {
    try {
      setLoading(true);
      const response = await api.post('/savings', goalData);
      setSavingsGoals([...savingsGoals, response.data.data]);
      setIsAddGoalModalOpen(false);
      
      // Refresh overview data
      const overviewResponse = await api.get('/savings/overview');
      setOverview(overviewResponse.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create savings goal');
    } finally {
      setLoading(false);
    }
  };

  // Handle updating a saving goal
  const handleUpdateGoal = async (goalData: any) => {
    try {
      setLoading(true);
      const response = await api.put(`/savings/${selectedGoal._id}`, goalData);
      
      // Update the goals array
      const updatedGoals = savingsGoals.map(goal => 
        goal._id === selectedGoal._id ? response.data.data : goal
      );
      
      setSavingsGoals(updatedGoals);
      setIsAddGoalModalOpen(false);
      setSelectedGoal(null);
      
      // Refresh overview data
      const overviewResponse = await api.get('/savings/overview');
      setOverview(overviewResponse.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update savings goal');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding funds to a saving goal
  const handleAddFunds = async (amount: number) => {
    try {
      setLoading(true);
      const response = await api.put(`/savings/${selectedGoal._id}/addfunds`, { amount });
      
      const updatedGoal = response.data.data;
      
      // If goal is now completed, move it to completed goals
      if (updatedGoal.isCompleted) {
        setSavingsGoals(savingsGoals.filter(goal => goal._id !== selectedGoal._id));
        setCompletedGoals([...completedGoals, {
          ...updatedGoal,
          category: selectedGoal.category // Preserve the category information
        }]);
      } else {
        // Update the active goals array
        const updatedGoals = savingsGoals.map(goal => 
          goal._id === selectedGoal._id ? {
            ...updatedGoal,
            category: selectedGoal.category // Preserve the category information
          } : goal
        );
        setSavingsGoals(updatedGoals);
      }
      
      setIsAddFundsModalOpen(false);
      setSelectedGoal(null);
      
      // Refresh overview data
      const overviewResponse = await api.get('/savings/overview');
      setOverview(overviewResponse.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add funds');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a saving goal
  const handleDeleteGoal = async () => {
    if (!selectedGoal) return;
    
    try {
      setLoading(true);
      await api.delete(`/savings/${selectedGoal._id}`);
      
      // Remove goal from appropriate array
      if (selectedGoal.isCompleted) {
        setCompletedGoals(completedGoals.filter(goal => goal._id !== selectedGoal._id));
      } else {
        setSavingsGoals(savingsGoals.filter(goal => goal._id !== selectedGoal._id));
      }
      
      setIsDeleteModalOpen(false);
      setSelectedGoal(null);
      
      // Refresh overview data
      const overviewResponse = await api.get('/savings/overview');
      setOverview(overviewResponse.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete savings goal');
    } finally {
      setLoading(false);
    }
  };
  // Toggle context menu for a goal
  const toggleContextMenu = (goalId: string) => {
    if (isContextMenuOpen === goalId) {
      setIsContextMenuOpen(null);
    } else {
      setIsContextMenuOpen(goalId);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate days remaining until target date
  const calculateDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const displayGoals = activeTab === 'active' ? savingsGoals : completedGoals;

  // Loading state
  if (loading && !savingsGoals.length && !completedGoals.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Savings Goals</h1>
        <button 
          className="btn btn-primary flex items-center"
          onClick={() => {
            setSelectedGoal(null);
            setIsAddGoalModalOpen(true);
          }}
        >
          <FaPlus className="mr-2" /> New Savings Goal
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-4 mb-6 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Savings Overview */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Saved</h3>
            <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
              {savingsGoals.length} active goals
            </span>
          </div>
          <p className="text-2xl font-bold">
            ₦{overview ? overview.totalCurrentAmount.toLocaleString() : '0'}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            {overview ? overview.totalSavedPercentage : 0}% of target
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">Savings Target</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Total
            </span>
          </div>
          <p className="text-2xl font-bold">
            ₦{overview ? overview.totalTargetAmount.toLocaleString() : '0'}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            ₦{overview ? overview.totalRemainingAmount.toLocaleString() : '0'} to go
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">Monthly Contribution</h3>
            <FaPiggyBank className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold">
            ₦{overview ? overview.monthlySavingsTarget.toLocaleString() : '0'}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            {overview && overview.monthlySavingsRate 
              ? `${overview.monthlySavingsRate}% of monthly income` 
              : 'Recommended amount'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="tabs border-b">
          <button
            className={`mr-4 pb-2 text-sm font-medium ${
              activeTab === 'active'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('active')}
          >
            Active Goals ({savingsGoals.length})
          </button>
          <button
            className={`pb-2 text-sm font-medium ${
              activeTab === 'completed'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            Completed Goals ({completedGoals.length})
          </button>
        </div>
      </div>

      {/* Savings Goals List */}
      {displayGoals.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500 mb-4">
            {activeTab === 'active' 
              ? 'You don\'t have any active savings goals yet.' 
              : 'You don\'t have any completed savings goals yet.'}
          </p>
          {activeTab === 'active' && (
            <button 
              className="btn btn-primary"
              onClick={() => setIsAddGoalModalOpen(true)}
            >
              Create Your First Savings Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayGoals.map((goal) => (
            <div key={goal._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{goal.name}</h3>
                    <p className="text-sm text-gray-500">{goal.category.name}</p>
                  </div>
                  <div className="relative">
                    <button 
                    aria-label='more options'
                      className="text-gray-400 hover:text-gray-600" 
                      onClick={() => toggleContextMenu(goal._id)}
                    >
                      <FaEllipsisH />
                    </button>
                    
                    {/* Context Menu */}
                    {isContextMenuOpen === goal._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100">
                        <div className="py-1">
                          <button
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            onClick={() => {
                              setSelectedGoal(goal);
                              setIsAddGoalModalOpen(true);
                              setIsContextMenuOpen(null);
                            }}
                          >
                            <FaEdit className="mr-2" /> Edit Goal
                          </button>
                          <button
                            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                            onClick={() => {
                              setSelectedGoal(goal);
                              setIsDeleteModalOpen(true);
                              setIsContextMenuOpen(null);
                            }}
                          >
                            <FaTrash className="mr-2" /> Delete Goal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      ₦{goal.currentAmount.toLocaleString()} of ₦{goal.targetAmount.toLocaleString()}
                    </span>
                    <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-secondary-500 h-2.5 rounded-full"
                      style={{ width: `${Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <FaRegCalendarAlt className="mr-1" />
                    <span>
                      Target: {formatDate(goal.targetDate)}
                    </span>
                  </div>
                  {!goal.isCompleted ? (
                    <span className="font-medium text-secondary-600">
                      ₦{(goal.targetAmount - goal.currentAmount).toLocaleString()} to go
                    </span>
                  ) : (
                    <span className="font-medium text-green-600">
                      Completed!
                    </span>
                  )}
                </div>
                
                {!goal.isCompleted && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="font-medium">
                      {calculateDaysRemaining(goal.targetDate)} days remaining
                    </span>
                  </div>
                )}
                
                {goal.isCompleted && goal.completedDate && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="font-medium text-green-600">
                      Completed on {formatDate(goal.completedDate)}
                    </span>
                  </div>
                )}
              </div>
              
              {!goal.isCompleted && (
                <div className="px-4 py-3 bg-gray-50 border-t flex justify-between">
                  <button 
                    className="text-sm text-primary-600 font-medium"
                    onClick={() => {
                      setSelectedGoal(goal);
                      setIsAddFundsModalOpen(true);
                    }}
                  >
                    Add Funds
                  </button>
                  <button 
                    className="text-sm text-gray-600 font-medium"
                    onClick={() => {
                      setSelectedGoal(goal);
                      setIsAddGoalModalOpen(true);
                    }}
                  >
                    Edit Goal
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {/* Add New Goal Card */}
          {activeTab === 'active' && (
            <div 
              className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center p-6 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setSelectedGoal(null);
                setIsAddGoalModalOpen(true);
              }}
            >
              <div className="text-center">
                <FaPlus className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Create a new savings goal
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {isAddGoalModalOpen && (
        <AddSavingGoalModal
          isOpen={isAddGoalModalOpen}
          onClose={() => {
            setIsAddGoalModalOpen(false);
            setSelectedGoal(null);
          }}
          onSave={selectedGoal ? handleUpdateGoal : handleCreateGoal}
          goal={selectedGoal}
        />
      )}

      {/* Add Funds Modal */}
      {isAddFundsModalOpen && selectedGoal && (
        <AddFundsModal
          isOpen={isAddFundsModalOpen}
          onClose={() => {
            setIsAddFundsModalOpen(false);
            setSelectedGoal(null);
          }}
          onAddFunds={handleAddFunds}
          goal={selectedGoal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedGoal && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedGoal(null);
          }}
          onConfirm={handleDeleteGoal}
          title="Delete Savings Goal"
          message={`Are you sure you want to delete the "${selectedGoal.name}" savings goal? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default SavingsPage;