import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FinancialProfileForm from '../components/finance/FinancialProfileForm';

const FinancialProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/financial-profile');
        setProfile(response.data.data);
        setError(null);
      } catch (err:any) {
        setError(err.response?.data?.error || 'Failed to load financial profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (data:any) => {
    try {
      setLoading(true);
      await api.post('/financial-profile', data);
      navigate('/financial-dashboard');
    } catch (err:any) {
      setError(err.response?.data?.error || 'Failed to save financial profile');
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <div className="flex justify-center p-8"><div className="w-12 h-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {profile ? 'Update Your Financial Profile' : 'Create Your Financial Profile'}
        </h1>
        <p className="text-gray-500">
          This information helps us provide personalized financial advice tailored to your situation
        </p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <FinancialProfileForm 
          onSubmit={handleSubmit} 
          initialData={profile} 
        />
      </div>
    </div>
  );
};

export default FinancialProfilePage;