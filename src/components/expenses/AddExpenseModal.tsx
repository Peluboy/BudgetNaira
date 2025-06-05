import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaTimes } from '@react-icons/all-files/fa/FaTimes';
import { FaUpload } from '@react-icons/all-files/fa/FaUpload';
import api from '../../services/api';
import { format } from 'date-fns';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: any) => void;
  expense?: any; // Make expense prop optional
}

// Validation schema
const schema = yup.object().shape({
  description: yup.string().required('Description is required'),
  amount: yup
    .number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .typeError('Amount must be a number'),
  category: yup.string().required('Category is required'),
  date: yup.string().required('Date is required'),
  paymentMethod: yup.string().required('Payment method is required'),
  isRecurring: yup.boolean(),
});

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSave, expense }) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [receipt, setReceipt] = useState<File | null>(null);
    const [, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
        description: '',
        amount: 0,
        category: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: '',
        isRecurring: false,
      },
  });

  // Set form values when editing an expense
  useEffect(() => {
    if (expense) {
      console.log('Setting form values for expense:', expense);
      reset({
        description: expense.description,
        amount: expense.amount,
        category: expense.category._id,
        date: format(new Date(expense.date), 'yyyy-MM-dd'),
        paymentMethod: expense.paymentMethod,
        isRecurring: expense.isRecurring || false,
      });
    } else {
      // Reset form when adding new expense
      reset({
        description: '',
        amount: 0,
        category: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: '',
        isRecurring: false,
      });
    }
  }, [expense, reset]);

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

  const onSubmit = (data: any) => {
    // Convert amount to number
    data.amount = Number(data.amount);
    // Convert date string to Date object
    data.date = new Date(data.date);
    
    if (expense?._id) {
      onSave({ ...data, _id: expense._id });
    } else {
      onSave(data);
    }
  };

  const paymentMethods = [
    'Cash', 'Bank Transfer', 'Debit Card', 'Credit Card',
    'Mobile Money', 'USSD', 'PayPal',
  ];

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // Create form data for file upload
      const formData = new FormData();
      formData.append('receipt', file);

      // Upload receipt and get OCR results
      const response = await fetch('/api/expenses/upload-receipt', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to upload receipt');
      }

      const data = await response.json();
      
      // Update form with OCR results
      reset({
        ...data,
        amount: data.amount?.toString() || '',
        description: data.description || '',
        category: data.category || '',
        date: data.date || format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: data.paymentMethod || '',
        isRecurring: false,
      });

      setReceipt(file);
    } catch (err: any) {
      setError(err.message || 'Failed to process receipt');
    } finally {
      setUploading(false);
    }
  };

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
              {expense ? 'Edit Expense' : 'Add New Expense'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Upload
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="receipt-upload"
                      className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                    >
                      <span>Upload a receipt</span>
                      <input
                        id="receipt-upload"
                        name="receipt"
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={handleReceiptUpload}
                        disabled={uploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                id="description"
                type="text"
                className={`mt-1 input ${errors.description ? 'border-red-500' : ''}`}
                placeholder="What did you spend on?"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (₦)
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

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                id="date"
                type="date"
                className={`mt-1 input ${errors.date ? 'border-red-500' : ''}`}
                {...register('date')}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                className={`mt-1 input ${errors.paymentMethod ? 'border-red-500' : ''}`}
                {...register('paymentMethod')}
              >
                <option value="">Select payment method</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
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
                This is a recurring expense
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
                {expense ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;