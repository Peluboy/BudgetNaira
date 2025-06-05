import React from 'react';
import { CreditCard } from "phosphor-react";

interface AccountDetailsFormProps {
  accountDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  onChange: (name: string, value: string) => void;
}

const AccountDetailsForm: React.FC<AccountDetailsFormProps> = ({ 
  accountDetails, 
  onChange 
}) => {
  // List of common Nigerian banks
const allNigerianBanks = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Globus Bank",
  "Guaranty Trust Bank (GTBank)",
  "Heritage Bank",
  "Jaiz Bank (Non-interest)",
  "Keystone Bank",
  "Lotus Bank (Non-interest)",
  "Parallex Bank",
  "Polaris Bank",
  "PremiumTrust Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank Nigeria",
  "Sterling Bank",
  "SunTrust Bank Nigeria",
  "TAJBank (Non-interest)",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank"
];


  return (
    <div className="p-3 bg-gray-50 rounded-md space-y-3">
      <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
        <CreditCard className="mr-2 text-xl text-primary-600" /> Account Details
      </h4>
      
      <div>
        <label htmlFor="accountName" className="block text-xs font-medium text-gray-700">
          Account Name
        </label>
        <input
          id="accountName"
          type="text"
          className="mt-1 input text-sm"
          placeholder="Enter account name"
          value={accountDetails.accountName}
          onChange={(e) => onChange('accountName', e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="accountNumber" className="block text-xs font-medium text-gray-700">
          Account Number
        </label>
        <input
          id="accountNumber"
          type="text"
          className="mt-1 input text-sm"
          placeholder="Enter account number"
          value={accountDetails.accountNumber}
          onChange={(e) => onChange('accountNumber', e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="bankName" className="block text-xs font-medium text-gray-700">
          Bank Name
        </label>
        <select
          id="bankName"
          className="mt-1 input text-sm"
          value={accountDetails.bankName}
          onChange={(e) => onChange('bankName', e.target.value)}
        >
          <option value="">Select a bank</option>
          {allNigerianBanks.map(bank => (
            <option key={bank} value={bank}>{bank}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AccountDetailsForm;