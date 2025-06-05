import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaMoneyBillWave, FaChartLine, FaCreditCard, FaShieldAlt, FaClipboardList } from 'react-icons/fa';
import api from '../../services/api';

const GenerateAdviceForm = () => {
  const navigate = useNavigate();
  const [adviceType, setAdviceType] = useState('general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const adviceTypes = [
    { id: 'general', label: 'General Financial Advice', icon: FaMoneyBillWave, description: 'Comprehensive advice on your overall financial situation' },
    { id: 'savings', label: 'Savings Strategy', icon: FaChartLine, description: 'How to optimize your savings in Nigeria\'s economic environment' },
    { id: 'debt', label: 'Debt Management', icon: FaCreditCard, description: 'Strategies to manage and reduce your debt effectively' },
    { id: 'investment', label: 'Investment Opportunities', icon: FaChartLine, description: 'Investment advice tailored to Nigerian markets' },
    { id: 'emergency_fund', label: 'Emergency Fund Planning', icon: FaShieldAlt, description: 'Building financial resilience through emergency funds' },
    { id: 'budgeting', label: 'Budgeting Techniques', icon: FaClipboardList, description: 'Effective budgeting methods for Nigeria\'s economic conditions' }
  ];

  const handleGenerateAdvice = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await api.post('/financial-advice', { type: adviceType });
      
      // Navigate to the newly created advice
      navigate(`/financial-advice/${response.data.data._id}`);
    } catch (err:any) {
      setError(err.response?.data?.error || 'Failed to generate advice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Generate Financial Advice</h2>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What type of financial advice do you need?
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {adviceTypes.map((type) => (
            <div 
              key={type.id}
              onClick={() => setAdviceType(type.id)}
              className={`
                border rounded-lg p-4 cursor-pointer transition-colors
                ${adviceType === type.id 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start">
                <div className={`
                  flex-shrink-0 mr-3 w-10 h-10 rounded-full flex items-center justify-center
                  ${adviceType === type.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}
                `}>
                  <type.icon />
                </div>
                <div>
                  <h3 className={`font-medium ${adviceType === type.id ? 'text-primary-700' : 'text-gray-800'}`}>
                    {type.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <p className="text-gray-600 mb-4">
          Our AI will analyze your financial profile, expenses, budgets, and savings to generate personalized advice
          tailored to Nigerian economic conditions.
        </p>
        
        <button
          onClick={handleGenerateAdvice}
          disabled={isGenerating}
          className="btn btn-primary w-full py-3 flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Generating Advice...
            </>
          ) : (
            'Generate Personalized Advice'
          )}
        </button>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          This may take up to 30 seconds to analyze your data and generate personalized advice
        </p>
      </div>
    </div>
  );
};

export default GenerateAdviceForm;