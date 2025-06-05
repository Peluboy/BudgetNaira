import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import FinancialAdviceDetail from '../components/finance/FinancialAdviceDetail';

const FinancialAdviceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/financial-advice/${id}`);
        setAdvice(response.data.data);
        setError(null);
      } catch (err:any) {
        setError(err.response?.data?.error || 'Failed to load financial advice');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAdvice();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/financial-advice');
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="w-12 h-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div></div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg">
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={handleBack}
          className="mt-4 btn bg-white border border-gray-300 text-gray-700"
        >
          Back to Advice
        </button>
      </div>
    );
  }

  if (!advice) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm text-center">
        <p className="text-gray-500 mb-4">Advice not found</p>
        <button 
          onClick={handleBack}
          className="btn btn-primary"
        >
          Back to Advice
        </button>
      </div>
    );
  }

  return <FinancialAdviceDetail advice={advice} onBack={handleBack} />;
};

export default FinancialAdviceDetailPage;