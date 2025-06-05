import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaTimes } from '@react-icons/all-files/fa/FaTimes';
import api from '../../services/api';

const getErrorMessage = (error: any): string => {
    return error?.message?.toString() || '';
  };

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (budget: any) => void;
  selectedBudget?: any;
  onSave: (budget: any) => void;
  budget?: any;
}

interface BudgetFormValues {
    name: string;
    amount: number;
    category: string;
    startDate: string;  // Form uses string input for dates
    endDate: string;    // Form uses string input for dates
    isRecurring: boolean;
    period: string;
  }
  
  interface ProcessedBudgetData {
    name: string;
    amount: number;
    category: string;
    startDate: Date;    // Processed data uses Date objects
    endDate: Date;      // Processed data uses Date objects
    isRecurring: boolean;
    period: string;
  }

// Validation schema
const schema = yup.object().shape({
    name: yup.string().required('Budget name is required'),
    amount: yup
      .number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .typeError('Amount must be a number'),
    category: yup.string().required('Category is required'),
    startDate: yup
      .string()
      .required('Start date is required')
      .test('is-date', 'Invalid date', (value) => !isNaN(new Date(value).getTime())),
    endDate: yup
      .string()
      .required('End date is required')
      .test('is-date', 'Invalid date', (value) => !isNaN(new Date(value).getTime()))
      .test('is-after', 'End date must be after start date', function (value) {
        const { startDate } = this.parent;
        return new Date(value) >= new Date(startDate);
      }),
    isRecurring: yup.boolean().required(),  // ✅ Make required
    period: yup.string().required('Budget period is required'),
  });  

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose, onSave, budget, selectedBudget }) => {
  const [categories, setCategories] = useState<any[]>([]);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BudgetFormValues>({
    resolver: yupResolver(schema),
    defaultValues: budget ? {
      ...budget,
      amount: budget.amount,
      startDate: budget.startDate.toISOString().substring(0, 10),
      endDate: budget.endDate.toISOString().substring(0, 10),
      category: budget.category._id,
    } : {
      name: '',
      amount: 0,
      category: '',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().substring(0, 10),
      isRecurring: true,
      period: 'monthly',
    },
  });

  useEffect(() => {
    if (selectedBudget) {
      reset({
        name: selectedBudget.name,
        amount: selectedBudget.amount,
        startDate: selectedBudget.startDate.substring(0, 10),
        endDate: selectedBudget.endDate.substring(0, 10),
        category: selectedBudget.category._id,
        isRecurring: selectedBudget.isRecurring,
        period: selectedBudget.period || 'monthly',
      });
    }
  }, [selectedBudget, reset]);

  const onSubmit = (data: BudgetFormValues) => {
    const processedData: ProcessedBudgetData = {
      ...data,
      amount: Number(data.amount),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    };
  
    if (selectedBudget) {
      // Updating an existing budget
      onSave({ ...selectedBudget, ...processedData });
    } else {
      // Creating a new budget
      onSave(processedData);
    }
  };      
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block w-full max-w-md px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-md shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {budget ? 'Edit Budget' : 'Create New Budget'}
            </h3>
            <button
              title='close'
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Budget Name
              </label>
              <input
                id="name"
                type="text"
                className={`mt-1 input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g., Monthly Groceries"
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage(errors.name)}</p>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Budget Amount (₦)
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                className={`mt-1 input ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
                {...register('amount')}
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                className={`mt-1 input ${errors.category ? 'border-red-500' : ''}`}
                {...register('category')}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  className={`mt-1 input ${errors.startDate ? 'border-red-500' : ''}`}
                  {...register('startDate')}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  className={`mt-1 input ${errors.endDate ? 'border-red-500' : ''}`}
                  {...register('endDate')}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700">
                Budget Period
              </label>
              <select
                id="period"
                className={`mt-1 input ${errors.period ? 'border-red-500' : ''}`}
                {...register('period')}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              {errors.period && (
                <p className="mt-1 text-sm text-red-600">{errors.period.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="isRecurring"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('isRecurring')}
              />
              <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
                This is a recurring budget
              </label>
            </div>

            <div className="mt-5 sm:mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
              >
                {selectedBudget ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBudgetModal;