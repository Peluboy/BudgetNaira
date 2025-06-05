import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaFilter } from 'react-icons/fa';
import api from '../../services/api';
import FinancialAdviceCard from './FinancialAdviceCard';

interface FinancialAdvice {
    _id: string;
    type: string;
    title: string;
    summary: string;
    isRead: boolean;
    aiVersion: string;
    // Add other fields from your backend as needed
  }
  

const FinancialAdviceListPage = () => {
  const [advice, setAdvice] = useState<FinancialAdvice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        setLoading(true);
        const response = await api.get('/financial-advice');
        setAdvice(response.data.data);
        setError(null);
      } catch (err:any) {
        setError(err.response?.data?.error || 'Failed to load financial advice');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvice();
  }, []);

  // Filter advice based on active filter
  const filteredAdvice = activeFilter === 'all' 
    ? advice 
    : advice.filter(item => item.type === activeFilter);

  const filterOptions = [
    { id: 'all', label: 'All Advice' },
    { id: 'general', label: 'General' },
    { id: 'savings', label: 'Savings' },
    { id: 'debt', label: 'Debt' },
    { id: 'investment', label: 'Investment' },
    { id: 'emergency_fund', label: 'Emergency Fund' },
    { id: 'budgeting', label: 'Budgeting' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Advice</h1>
        <Link to="/financial-advice/new" className="btn btn-primary flex items-center">
          <FaPlus className="mr-2" /> Get New Advice
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 overflow-x-auto">
        <div className="flex space-x-2">
          {filterOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setActiveFilter(option.id)}
              className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${
                activeFilter === option.id
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-12 h-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-lg">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      ) : filteredAdvice.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-4">No financial advice found</p>
          <Link to="/financial-advice/new" className="btn btn-primary">
            Get Your First Advice
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAdvice.map(adviceItem => (
            <FinancialAdviceCard key={adviceItem._id} advice={adviceItem} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FinancialAdviceListPage;