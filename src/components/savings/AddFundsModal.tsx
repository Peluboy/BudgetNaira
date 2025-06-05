import React, { useState } from 'react';
import { FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import { ISavingGoal } from '../../services/db';

// interface AddFundsModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     goal?: ISavingGoal;
//     onAddFunds: (amount: number) => void;
//   }
  
const AddFundsModal = ({ isOpen, onClose, onAddFunds, goal }: any) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    setError('');

    // Validate amount
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Check if amount exceeds what's needed
    const remaining = goal.targetAmount - goal.currentAmount;
    if (numAmount > remaining) {
      setError(`The amount exceeds the remaining goal amount (₦${remaining.toLocaleString()})`);
      return;
    }

    setLoading(true);
    onAddFunds(numAmount);
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
              Add Funds to {goal?.name}
            </h3>
            <button
            aria-label='close modal'
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Current Amount:</span>
              <span className="font-medium">₦{goal?.currentAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Target Amount:</span>
              <span className="font-medium">₦{goal?.targetAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Remaining:</span>
              <span className="font-medium text-primary-600">
                ₦{(goal?.targetAmount - goal?.currentAmount).toLocaleString()}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount to Add (₦)
              </label>
              <input
                id="amount"
                type="number"
                className={`input w-full ${error ? 'border-red-500' : ''}`}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                max={goal.targetAmount - goal.currentAmount}
              />
              {error && (
                <p className="mt-1 text-xs text-red-600">{error}</p>
              )}
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
                ) : (
                  <>
                    <FaMoneyBillWave className="mr-2" /> Add Funds
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

export default AddFundsModal;