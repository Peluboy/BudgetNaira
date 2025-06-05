import React, { useState } from 'react';
import { FaUsers,FaTimes, FaCheckCircle, FaMoneyBillWave, FaShare, FaCreditCard, FaEnvelope, FaWhatsapp, FaCopy } from 'react-icons/fa';
import { format } from 'date-fns';
import { UserPlus, Users, X, Divide } from "phosphor-react";
// import FaUsers from 'react-icons/fa';

interface SplitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: any;
  onMarkSettled: (expenseId: string, participantId: string) => void;
}

const SplitDetailsModal: React.FC<SplitDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  expense,
  onMarkSettled
}) => {
  const [shareOptions, setShareOptions] = useState<{ label: string; action: () => void }[]>([]);
  const [showShareOptions, setShowShareOptions] = useState(false);
  // Add this new state for participant selection
 const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
 const [isRemindingAll, setIsRemindingAll] = useState(false);
  if (!isOpen || !expense) return null;

  // Calculate how many participants have settled
  const settledCount = expense.participants.filter((p: any) => p.settled).length;
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

    // Function to toggle selection of a participant for reminders
  const toggleParticipantSelection = (participantId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };
  
  // Function to select all unsettled participants
  const selectAllUnsettled = () => {
    const unsettledIds = expense.participants
      .filter((p: any) => !p.settled && p.id !== '1')  // Exclude yourself and settled participants
      .map((p: any) => p.id);
    setSelectedParticipants(unsettledIds);
  };

    // Function to handle reminding all selected participants
  const handleRemindAll = () => {
    // If no participants are selected, prompt to select all unsettled
    if (selectedParticipants.length === 0) {
      selectAllUnsettled();
      setIsRemindingAll(true);
      return;
    }
    
    // Get the selected participants
    const participantsToRemind = expense.participants.filter(
      (p: any) => selectedParticipants.includes(p.id)
    );
    
    if (participantsToRemind.length === 0) {
      alert('Please select at least one unsettled participant to remind');
      return;
    }

        // Create options for how to remind (similar to share options)
    const remindOptions = [
      { 
        label: 'Send individual WhatsApp messages', 
        action: () => {
          participantsToRemind.forEach((participant:any) => {
            let shareText = createShareText(participant);
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
          });
        }
      },
      { 
        label: 'Send group email', 
        action: () => {
          // Create a combined message for all participants
          let combinedText = `💰 Split Expense: ${expense.description}\n\n`;
          participantsToRemind.forEach((participant:any) => {
            combinedText += `For ${participant.name}: ₦${participant.amount.toLocaleString()} (${participant.percentage}%)\n`;
          });
          
          combinedText += `\nTotal: ₦${expense.amount.toLocaleString()}\n`;
          combinedText += `Date: ${formatDate(expense.date)}\n`;
          combinedText += `Category: ${expense.category.name}\n\n`;
          
          // Add account details if available
          if (expense.accountDetails) {
            const { accountName, accountNumber, bankName } = expense.accountDetails;
            if (accountName && accountNumber && bankName) {
              combinedText += `💳 Payment details:\n`;
              combinedText += `Bank: ${bankName}\n`;
              combinedText += `Account Number: ${accountNumber}\n`;
              combinedText += `Account Name: ${accountName}\n\n`;
            }
          }
          
          combinedText += `Please settle this at your earliest convenience. Thanks!`;
          
          window.open(`mailto:?subject=Split Expense: ${expense.description}&body=${encodeURIComponent(combinedText)}`, '_blank');
        }
      },
      { 
        label: 'Copy all details to clipboard', 
        action: () => {
          let combinedText = `💰 Split Expense: ${expense.description}\n\n`;
          participantsToRemind.forEach((participant:any) => {
            combinedText += `For ${participant.name}: ₦${participant.amount.toLocaleString()} (${participant.percentage}%)\n`;
          });
          
          combinedText += `\nTotal: ₦${expense.amount.toLocaleString()}\n`;
          combinedText += `Date: ${formatDate(expense.date)}\n`;
          combinedText += `Category: ${expense.category.name}\n\n`;
          
          // Add account details if available
          if (expense.accountDetails) {
            const { accountName, accountNumber, bankName } = expense.accountDetails;
            if (accountName && accountNumber && bankName) {
              combinedText += `💳 Payment details:\n`;
              combinedText += `Bank: ${bankName}\n`;
              combinedText += `Account Number: ${accountNumber}\n`;
              combinedText += `Account Name: ${accountName}\n\n`;
            }
          }
          
          combinedText += `Please settle this at your earliest convenience. Thanks!`;
          
          navigator.clipboard.writeText(combinedText)
            .then(() => alert('Reminder text copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
        }
      }
    ];
    
    // Show the reminder options
    setShareOptions(remindOptions);
    setShowShareOptions(true);
    setIsRemindingAll(false);
  };
  
  // Helper function to create share text for a participant
  const createShareText = (participant: any) => {
    let shareText = `💰 Split Expense: ${expense.description}\n\n`;
    shareText += `Amount: ₦${participant.amount.toLocaleString()} (${participant.percentage}% of total ₦${expense.amount.toLocaleString()})\n`;
    shareText += `Date: ${formatDate(expense.date)}\n`;
    shareText += `Category: ${expense.category.name}\n\n`;
    
    // Add account details if available
    if (expense.accountDetails) {
      const { accountName, accountNumber, bankName } = expense.accountDetails;
      if (accountName && accountNumber && bankName) {
        shareText += `💳 Payment details:\n`;
        shareText += `Bank: ${bankName}\n`;
        shareText += `Account Number: ${accountNumber}\n`;
        shareText += `Account Name: ${accountName}\n\n`;
      }
    }
    
    shareText += `Please settle this at your earliest convenience. Thanks!`;
    return shareText;
  };
  // Function to share a split expense with others
// Modify handleShareSplit to use the helper function
  const handleShareSplit = (participant: any) => {
    // Create a detailed share message
    let shareText = createShareText(participant);
    
    // Share options based on device capabilities
    if (navigator.share) {
      navigator.share({
        title: 'Split Expense',
        text: shareText
      })
      .catch(error => console.log('Error sharing:', error));
    } else {
      // Options to share via different methods
      const shareOptions = [
        { label: 'Copy to clipboard', action: () => {
          navigator.clipboard.writeText(shareText)
            .then(() => alert('Share text copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
        }},
        { label: 'WhatsApp', action: () => {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }},
        { label: 'Email', action: () => {
          window.open(`mailto:?subject=Split Expense: ${expense.description}&body=${encodeURIComponent(shareText)}`, '_blank');
        }}
      ];
      
      // Show share options dialog
      setShareOptions(shareOptions);
      setShowShareOptions(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block w-full max-w-lg px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <FaUsers className="mr-2 text-primary-600" /> Split Details
            </h3>
            <button
            title='close'
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FaTimes />
            </button>
          </div>

          <div className="mb-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-800">{expense.description}</h4>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(expense.date)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{expense.category.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Amount</p>
                  <p className="font-medium text-red-600">₦{expense.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Method</p>
                  <p className="font-medium">{expense.paymentMethod}</p>
                </div>
              </div>
            </div>
            {/* Add this section to display account details if available */}
        {expense.accountDetails && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
            <h4 className="font-medium text-blue-800 flex items-center mb-2">
              <FaCreditCard className="mr-2" /> Payment Details
            </h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {expense.accountDetails.bankName && (
                <div>
                  <p className="text-gray-500">Bank</p>
                  <p className="font-medium">{expense.accountDetails.bankName}</p>
                </div>
              )}
              {expense.accountDetails.accountNumber && (
                <div>
                  <p className="text-gray-500">Account Number</p>
                  <p className="font-medium">{expense.accountDetails.accountNumber}</p>
                </div>
              )}
              {expense.accountDetails.accountName && (
                <div>
                  <p className="text-gray-500">Account Name</p>
                  <p className="font-medium">{expense.accountDetails.accountName}</p>
                </div>
              )}
            </div>
          </div>
        )}
            <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
              <FaUsers className="mr-2 text-blue-600" /> 
              Participants ({settledCount}/{expense.participants.length} settled)
              {isRemindingAll && (
                <button 
                  onClick={selectAllUnsettled}
                  className="ml-auto text-xs text-blue-600 hover:text-blue-700"
                >
                  Select all unsettled
                </button>
              )}
            </h4>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {expense.participants.map((participant: any) => (
                <div 
                  key={participant.id} 
                  className={`border rounded-lg p-3 ${
                    participant.settled ? 'bg-green-50 border-green-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                       {isRemindingAll && !participant.settled && participant.id !== '1' && (
                        <input
                        title='select'
                          type="checkbox"
                          className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={selectedParticipants.includes(participant.id)}
                          onChange={() => toggleParticipantSelection(participant.id)}
                        />
                      )}
                      <div className="flex items-center">
                        <p className="font-medium text-gray-800">
                          {participant.name}
                        </p>
                        {participant.settled && (
                          <span className="ml-2 text-green-600 flex items-center text-xs font-medium">
                            <FaCheckCircle className="mr-1" /> Settled
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm">
                        <p className="text-gray-600">
                          ₦{participant.amount.toLocaleString()} ({participant.percentage}%)
                        </p>
                        {participant.settled && participant.settledDate && (
                          <p className="text-xs text-gray-500">
                            Settled on {formatDate(participant.settledDate)}
                          </p>
                        )}
                      </div>
                    </div>
{!participant.settled && participant.id !== '1' && !isRemindingAll && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onMarkSettled(expense._id, participant.id)}
                          className="btn bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 flex items-center"
                        >
                          <FaCheckCircle className="mr-1" /> Mark Settled
                        </button>
                        <button
                          onClick={() => handleShareSplit(participant)}
                          className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 flex items-center"
                        >
                          <FaShare className="mr-1" /> Share
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Share options dialog */}
          {showShareOptions && (
            <div className="fixed inset-0 z-60 overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center" onClick={() => setShowShareOptions(false)}>
              <div className="bg-white rounded-lg p-4 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
                <h4 className="text-lg font-medium mb-4">Share Options</h4>
                <div className="space-y-2">
                  {shareOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        option.action();
                        setShowShareOptions(false);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-100 rounded-md flex items-center"
                    >
                      {option.label === 'WhatsApp' && <FaWhatsapp className="mr-2 text-green-600" />}
                      {option.label === 'Email' && <FaEnvelope className="mr-2 text-blue-600" />}
                      {option.label === 'Copy to clipboard' && <FaCopy className="mr-2 text-gray-600" />}
                      {option.label === 'Send individual WhatsApp messages' && <FaWhatsapp className="mr-2 text-green-600" />}
                      {option.label === 'Send group email' && <FaEnvelope className="mr-2 text-blue-600" />}
                      {option.label === 'Copy all details to clipboard' && <FaCopy className="mr-2 text-gray-600" />}
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowShareOptions(false)}
                  className="mt-4 w-full p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 btn bg-white border border-gray-300 text-gray-700"
            >
              Close
            </button>
            
            {/* Modify the Remind All button */}
            <button
              onClick={() => {
                if (isRemindingAll) {
                  handleRemindAll();
                } else {
                  setIsRemindingAll(true);
                  selectAllUnsettled();
                }
              }}
              className="flex-1 btn btn-primary flex items-center justify-center"
            >
              {isRemindingAll ? (
                <>
                  <FaEnvelope className="mr-2" /> Send Reminders
                </>
              ) : (
                <>
                  <FaMoneyBillWave className="mr-2" /> Remind All
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitDetailsModal;