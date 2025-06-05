import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';

/**
 * Hook to track expenses marked for savings and automatically update savings goals
 */
const useSavingsTracker = () => {
  const dispatch = useDispatch();
  const { items: expenses } = useSelector((state: any) => state.expenses);
  
  useEffect(() => {
    // This effect runs when new expenses are added or modified
    const trackSavingsExpenses = async () => {
      try {
        // Get savings categories
        const categoriesResponse = await api.get('/categories');
        const savingsCategories = categoriesResponse.data.data
          .filter((cat: any) => cat.type === 'savings')
          .map((cat: any) => cat._id);
          
        // Get all savings goals
        const goalsResponse = await api.get('/savings');
        const savingsGoals = goalsResponse.data.data;
        
        // Find expenses marked for savings (by category)
        const savingsExpenses = expenses.filter(
          (expense: any) => savingsCategories.includes(expense.category)
        );
        
        // For each savings expense, find the matching goal and add funds
        for (const expense of savingsExpenses) {
          // Skip expenses that have already been processed for savings
          if (expense.processedForSavings) continue;
          
          // Find the matching savings goal for this category
          const matchingGoal = savingsGoals.find(
            (goal: any) => goal.category._id === expense.category
          );
          
          if (matchingGoal) {
            // Add the expense amount to the savings goal
            await api.put(`/savings/${matchingGoal._id}/addfunds`, {
              amount: expense.amount
            });
            
            // Mark the expense as processed for savings
            await api.put(`/expenses/${expense._id}`, {
              ...expense,
              processedForSavings: true
            });
          }
        }
        
      } catch (error) {
        console.error('Error tracking savings expenses:', error);
      }
    };
    
    trackSavingsExpenses();
  }, [expenses, dispatch]);
  
  return null;
};

export default useSavingsTracker;