import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FinancialDashboard from '../components/finance/FinancialDashboard';

const FinancialDashboardPage = () => {
  const navigate = useNavigate();
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/financial-profile');
        setHasProfile(!!response.data.data);
        console.log(response.data.data);
        setError(null);
      } catch (err:any) {
        setError(err.response?.data?.error || 'Failed to check financial profile');
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="w-12 h-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div></div>;
  }

  if (!hasProfile) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Your Financial Profile First</h2>
        <p className="text-gray-600 mb-6">
          To view your financial dashboard and receive personalized advice, we need to understand your financial situation.
        </p>
        <button 
          onClick={() => navigate('/financial-profile')}
          className="btn btn-primary"
        >
          Create Financial Profile
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Dashboard</h1>
        <p className="text-gray-500">
          Your personalized financial health overview and recommendations
        </p>
      </div>

      <FinancialDashboard />
    </div>
  );
};

export default FinancialDashboardPage;