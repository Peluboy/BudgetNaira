import React, { useState, useEffect } from 'react';
import { FaTimes } from '@react-icons/all-files/fa/FaTimes';
import { format } from 'date-fns';

interface ExpenseFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
  currentFilters: {
    categories: string[];
    dateRange: {
      start: Date | null;
      end: Date | null;
    };
    minAmount: number | null;
    maxAmount: number | null;
    paymentMethods: string[];
  };
  categories: any[];
  paymentMethods: string[];
}

const ExpenseFilterModal: React.FC<ExpenseFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  onClearFilters,
  currentFilters,
  categories,
  paymentMethods
}) => {
  const [dateRange, setDateRange] = useState({
    start: currentFilters.dateRange.start ? format(currentFilters.dateRange.start, 'yyyy-MM-dd') : '',
    end: currentFilters.dateRange.end ? format(currentFilters.dateRange.end, 'yyyy-MM-dd') : '',
  });
  
  const [amountRange, setAmountRange] = useState({
    minAmount: currentFilters.minAmount?.toString() || '',
    maxAmount: currentFilters.maxAmount?.toString() || '',
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentFilters.categories);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(currentFilters.paymentMethods);

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handlePaymentMethodToggle = (method: string) => {
    if (selectedPaymentMethods.includes(method)) {
      setSelectedPaymentMethods(selectedPaymentMethods.filter(m => m !== method));
    } else {
      setSelectedPaymentMethods([...selectedPaymentMethods, method]);
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      categories: selectedCategories,
      dateRange: {
        start: dateRange.start ? new Date(dateRange.start) : null,
        end: dateRange.end ? new Date(dateRange.end) : null,
      },
      minAmount: amountRange.minAmount ? Number(amountRange.minAmount) : null,
      maxAmount: amountRange.maxAmount ? Number(amountRange.maxAmount) : null,
      paymentMethods: selectedPaymentMethods,
    });
  };

  const handleResetFilters = () => {
    setDateRange({ start: '', end: '' });
    setAmountRange({ minAmount: '', maxAmount: '' });
    setSelectedCategories([]);
    setSelectedPaymentMethods([]);
    onClearFilters();
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
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Filter Expenses
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              title="Close filter modal"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Date Range</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="input"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    title="Start date"
                    aria-label="Start date"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    className="input"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    title="End date"
                    aria-label="End date"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Amount Range (₦)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Minimum</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0"
                    value={amountRange.minAmount}
                    onChange={(e) => setAmountRange({ ...amountRange, minAmount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Maximum</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="Any"
                    value={amountRange.maxAmount}
                    onChange={(e) => setAmountRange({ ...amountRange, maxAmount: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Categories</h4>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center">
                    <input
                      id={`category-${category._id}`}
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={selectedCategories.includes(category._id)}
                      onChange={() => handleCategoryToggle(category._id)}
                    />
                    <label
                      htmlFor={`category-${category._id}`}
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Payment Methods</h4>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <div key={method} className="flex items-center">
                    <input
                      id={`payment-${method}`}
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={selectedPaymentMethods.includes(method)}
                      onChange={() => handlePaymentMethodToggle(method)}
                    />
                    <label
                      htmlFor={`payment-${method}`}
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
                    >
                      {method}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilterModal;