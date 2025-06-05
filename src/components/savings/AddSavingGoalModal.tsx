// src/components/savings/AddSavingGoalModal.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaTimes, FaPiggyBank } from 'react-icons/fa';
import api from '../../services/api';
import { ISavingGoal } from '../../services/db';

// Validation schema for the form
const schema = yup.object().shape({
  name: yup.string().required('Goal name is required'),
  targetAmount: yup
    .number()
    .required('Target amount is required')
    .positive('Amount must be positive')
    .typeError('Target amount must be a number'),
  currentAmount: yup
    .number()
    .min(0, 'Current amount cannot be negative')
    .typeError('Current amount must be a number'),
  category: yup.string().required('Category is required'),
  targetDate: yup
    .date()
    .required('Target date is required')
    .min(new Date(), 'Target date must be in the future')
    .typeError('Invalid date'),
  notes: yup.string()
});
interface AddSavingGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: ISavingGoal) => void;
    goal?: ISavingGoal;
  }
  
  const AddSavingGoalModal: React.FC<AddSavingGoalModalProps> = ({ isOpen, onClose, onSave, goal }) => {
  const [categories, setCategories] = useState([]);
  const [loading, ] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      category: '',
      targetDate: new Date(),
      notes: ''
    }
  });

  // Fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        // Filter to only savings categories
        const savingsCategories = response.data.data.filter(
          (category: any) => category.type === 'savings'
        );
        setCategories(savingsCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Set form values when editing an existing goal
  useEffect(() => {
    if (goal) {
      reset({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        category: goal.category,
        targetDate: new Date(),
        notes: goal.notes || ''
      });
    }
  }, [goal, reset]);

  const onSubmit = (data:any) => {
    // Convert string values to appropriate types
    const formattedData = {
      ...data,
      targetAmount: Number(data.targetAmount),
      currentAmount: Number(data.currentAmount),
      targetDate: new Date(data.targetDate)
    };
    
    onSave(formattedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-md px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {goal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
            </h3>
            <button
            title='close'
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Goal Name
              </label>
              <input
                id="name"
                type="text"
                className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g., Emergency Fund"
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className={`input w-full ${errors.category ? 'border-red-500' : ''}`}
                {...register('category')}
              >
                <option value="">Select a category</option>
                {categories.map((category:any) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount (₦)
                </label>
                <input
                  id="targetAmount"
                  type="number"
                  className={`input w-full ${errors.targetAmount ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                  {...register('targetAmount')}
                />
                {errors.targetAmount && (
                  <p className="mt-1 text-xs text-red-600">{errors.targetAmount.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Amount (₦)
                </label>
                <input
                  id="currentAmount"
                  type="number"
                  className={`input w-full ${errors.currentAmount ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                  {...register('currentAmount')}
                />
                {errors.currentAmount && (
                  <p className="mt-1 text-xs text-red-600">{errors.currentAmount.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
                Target Date
              </label>
              <input
                id="targetDate"
                type="date"
                className={`input w-full ${errors.targetDate ? 'border-red-500' : ''}`}
                {...register('targetDate')}
              />
              {errors.targetDate && (
                <p className="mt-1 text-xs text-red-600">{errors.targetDate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                className="input w-full"
                placeholder="Add any additional notes about your savings goal"
                {...register('notes')}
              ></textarea>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : goal ? (
                  'Update Goal'
                ) : (
                  <>
                    <FaPiggyBank className="mr-2" /> Create Goal
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSavingGoalModal;