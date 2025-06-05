import React, { useState, useEffect } from 'react';
import AccountDetailsForm from '../common/AccountDetailsForm';
import { UserPlus, Users, X, Divide } from "phosphor-react";
import { FaAddressBook } from 'react-icons/fa';

interface Participant {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  email?: string; // Optional for notifications
  phone?: string; // Optional for notifications
}

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (participants: Participant[], accountDetails?: AccountDetails) => void;
  totalAmount: number;
  existingParticipants?: Participant[];
  existingAccountDetails?: AccountDetails;
  expenseId?: string;
}

// Add interface for account details
interface AccountDetails {
  id?: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
}

const SplitBillModal: React.FC<SplitBillModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  totalAmount,
  existingParticipants = [],
  existingAccountDetails,
  expenseId
}) => {
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom'>('equal');
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Me (You)', amount: totalAmount, percentage: 100 }
  ]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [accountDetails, setAccountDetails] = useState<AccountDetails>({
    accountName: '',
    accountNumber: '',
    bankName: ''
  });
const [savedAccountDetails, setSavedAccountDetails] = useState<AccountDetails[]>([]);
const [showSavedAccounts, setShowSavedAccounts] = useState(false);
  const [newParticipantPhone, setNewParticipantPhone] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [showContactFields, setShowContactFields] = useState(false);

  // Initialize with existing participants if provided
useEffect(() => {
  if (existingParticipants && existingParticipants.length > 0) {
    const isSame =
      participants.length === existingParticipants.length &&
      participants.every((p, i) => (
        p.id === existingParticipants[i].id &&
        p.amount === existingParticipants[i].amount &&
        p.name === existingParticipants[i].name
      ));

    if (!isSame) {
      setParticipants(existingParticipants);
      const firstAmount = existingParticipants[0].amount;
      const allEqual = existingParticipants.every(p => p.amount === firstAmount);
      setSplitMethod(allEqual ? 'equal' : 'custom');
    }
  } else if (participants.length !== 1 || participants[0].name !== 'Me (You)') {
    setParticipants([
      { id: '1', name: 'Me (You)', amount: totalAmount, percentage: 100 }
    ]);
  }
      // Initialize account details if they exist
    if (existingAccountDetails) {
      setAccountDetails(existingAccountDetails);
      setShowAccountDetails(true);
    }
}, [existingParticipants, totalAmount]);

// Load saved account details
useEffect(() => {
  const savedDetails = localStorage.getItem('savedAccountDetails');
  if (savedDetails) {
    setSavedAccountDetails(JSON.parse(savedDetails));
  }
}, []);

// Function to save current account details
const saveAccountDetails = () => {
  // Validate account details
  if (!accountDetails.accountName || !accountDetails.accountNumber || !accountDetails.bankName) {
    setError('Please fill in all account details fields to save');
    return;
  }
  
  // Add to saved account details
  const updatedSavedDetails = [...savedAccountDetails, {
    ...accountDetails,
    id: Date.now().toString() // Add a unique ID
  }];
  
  // Save to localStorage
  localStorage.setItem('savedAccountDetails', JSON.stringify(updatedSavedDetails));
  setSavedAccountDetails(updatedSavedDetails);
  
  // Show confirmation
  alert('Account details saved for future use');
};

// Function to load a saved account detail
const loadSavedAccountDetail = (detail: AccountDetails) => {
  setAccountDetails(detail);
};

  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) {
      setError('Please enter a name');
      return;
    }

    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: newParticipantName,
      amount: 0,
      phone: newParticipantPhone,
      email: newParticipantEmail,
      percentage: 0
    };

    const updatedParticipants = [...participants, newParticipant];
    setParticipants(updatedParticipants);
    setNewParticipantName('');
    setNewParticipantPhone(''); // Clear phone input
    setNewParticipantEmail(''); // Clear email input
    setError('');

    // Recalculate splits
    if (splitMethod === 'equal') {
      distributeEqually(updatedParticipants);
    }
  };

  const handleRemoveParticipant = (id: string) => {
    const updatedParticipants = participants.filter(p => p.id !== id);
    setParticipants(updatedParticipants);

    // Recalculate splits
    if (splitMethod === 'equal') {
      distributeEqually(updatedParticipants);
    } else {
      recalculatePercentages(updatedParticipants);
    }
  };

  const distributeEqually = (participantsList: Participant[]) => {
    const count = participantsList.length;
    const equalAmount = Math.floor((totalAmount / count) * 100) / 100; // Round to 2 decimal places
    const equalPercentage = 100 / count;

    // Distribute amount equally
    const updatedParticipants = participantsList.map((p, index) => ({
      ...p,
      amount: index === count - 1 
        ? totalAmount - (equalAmount * (count - 1)) // Ensure total sums correctly
        : equalAmount,
      percentage: parseFloat(equalPercentage.toFixed(2))
    }));

    setParticipants(updatedParticipants);
  };

  const handleAmountChange = (id: string, value: string) => {
    const amount = parseFloat(value) || 0;
    
    const updatedParticipants = participants.map(p => 
      p.id === id ? { ...p, amount } : p
    );

    recalculatePercentages(updatedParticipants);
  };

  const handlePercentageChange = (id: string, value: string) => {
    const percentage = parseFloat(value) || 0;
    
    const updatedParticipants = participants.map(p => 
      p.id === id ? { 
        ...p, 
        percentage,
        amount: Math.round((percentage / 100) * totalAmount * 100) / 100 
      } : p
    );

    setParticipants(updatedParticipants);
  };

  const recalculatePercentages = (participantsList: Participant[]) => {
    const totalAmountSum = participantsList.reduce((sum, p) => sum + p.amount, 0);
    
    const updatedParticipants = participantsList.map(p => ({
      ...p,
      percentage: totalAmountSum > 0 
        ? parseFloat(((p.amount / totalAmountSum) * 100).toFixed(2))
        : 0
    }));

    setParticipants(updatedParticipants);
  };

  const handleSplitMethodChange = (method: 'equal' | 'custom') => {
    setSplitMethod(method);
    
    if (method === 'equal') {
      distributeEqually(participants);
    }
  };

    // Add handler for account details changes
  const handleAccountDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Validate amounts sum up to total
    const sum = participants.reduce((total, p) => total + p.amount, 0);
    const difference = Math.abs(sum - totalAmount);
    
    if (difference > 0.01) { // Allow for small rounding differences
      setError(`The sum of all shares (₦${sum.toFixed(2)}) doesn't match the total amount (₦${totalAmount.toFixed(2)})`);
      return;
    }

    setIsSubmitting(true);
    onSave(participants, showAccountDetails ? accountDetails : undefined);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block w-full max-w-lg px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <Users className="mr-2 text-primary-600" weight='fill'/> Split Bill
            </h3>
            <button
            title="close"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X />
            </button>
          </div>

          <div className="mb-4 bg-gray-50 p-3 rounded-md flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-lg font-bold">₦{totalAmount.toLocaleString()}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSplitMethodChange('equal')}
                className={`px-3 py-1 rounded-md text-sm ${
                  splitMethod === 'equal'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Split Equally
              </button>
              <button
                onClick={() => handleSplitMethodChange('custom')}
                className={`px-3 py-1 rounded-md text-sm ${
                  splitMethod === 'custom'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Custom Split
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Account Details Section - Add this before the Participants section */}
                    <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                id="showAccountDetails"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={showAccountDetails}
                onChange={() => setShowAccountDetails(!showAccountDetails)}
              />
              <label htmlFor="showAccountDetails" className="ml-2 block text-sm font-medium text-gray-700">
                Add your account details for participants to make payments
              </label>
            </div>
{showAccountDetails && (
  <>
    <AccountDetailsForm
      accountDetails={accountDetails}
      onChange={(name, value) => setAccountDetails(prev => ({
        ...prev,
        [name]: value
      }))}
    />
    
    <div className="mt-2 flex justify-between">
      <button
        type="button"
        onClick={saveAccountDetails}
        className="text-sm text-primary-600 hover:text-primary-700"
      >
        Save for future use
      </button>
      
      {savedAccountDetails.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSavedAccounts(!showSavedAccounts)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Load saved account
          </button>
          
          {showSavedAccounts && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-100">
              <div className="py-1 max-h-40 overflow-y-auto">
                {savedAccountDetails.map((detail) => (
                  <button
                    key={detail.id}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      loadSavedAccountDetail(detail);
                      setShowSavedAccounts(false);
                    }}
                  >
                    {detail.bankName}: {detail.accountNumber}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </>
)}
</div>
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Participants</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center border border-gray-200 rounded-md p-3">
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800">{participant.name}</p>
                    {splitMethod === 'custom' ? (
                      <div className="flex mt-2 space-x-2">
                        <div className="w-1/2">
                          <label className="block text-xs text-gray-500">Amount (₦)</label>
                          <input
                          title="amount-change"
                            type="number"
                            min="0"
                            max={totalAmount}
                            step="0.01"
                            value={participant.amount}
                            onChange={(e) => handleAmountChange(participant.id, e.target.value)}
                            className="mt-1 input text-sm p-1 w-full"
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-xs text-gray-500">Percentage (%)</label>
                          <input
                          title="participant-percentage"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={participant.percentage}
                            onChange={(e) => handlePercentageChange(participant.id, e.target.value)}
                            className="mt-1 input text-sm p-1 w-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">
                        ₦{participant.amount.toLocaleString()} ({participant.percentage}%)
                      </p>
                    )}
                  </div>
                  {participant.id !== '1' && ( // Don't allow removing yourself
                    <button
                    title="remove-participants"
                      onClick={() => handleRemoveParticipant(participant.id)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <X />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
    <div className="mb-4">
      <div className="flex space-x-2 mb-2">
        <input
          type="text"
          placeholder="Add participant name"
          className="input flex-grow"
          value={newParticipantName}
          onChange={(e) => setNewParticipantName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
        />
        <button
          onClick={() => setShowContactFields(!showContactFields)}
          className="btn bg-gray-100 border border-gray-300 text-gray-700"
          title="Toggle contact fields"
        >
          <FaAddressBook />
        </button>
        <button
          onClick={handleAddParticipant}
          className="btn bg-white border border-gray-300 text-gray-700 flex items-center"
        >
          <UserPlus className="mr-2" weight='fill'/> Add
        </button>
      </div>
      
      {showContactFields && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <input
              type="tel"
              placeholder="Phone number (for reminders)"
              className="input w-full"
              value={newParticipantPhone}
              onChange={(e) => setNewParticipantPhone(e.target.value)}
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email (optional)"
              className="input w-full"
              value={newParticipantEmail}
              onChange={(e) => setNewParticipantEmail(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn bg-white border border-gray-300 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary flex items-center"
            >
              <Divide className="mr-2" weight='fill'/> 
              {isSubmitting ? 'Saving...' : 'Save Split'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitBillModal;