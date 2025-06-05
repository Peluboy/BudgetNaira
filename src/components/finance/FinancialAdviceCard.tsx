import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const FinancialAdviceCard = ({ advice }: any) => {
  // Get icon based on advice type
  const getAdviceIcon = (type: any) => {
    switch (type) {
      case 'savings':
        return '💰';
      case 'debt':
        return '💳';
      case 'investment':
        return '📈';
      case 'budgeting':
        return '📊';
      case 'emergency_fund':
        return '🛡️';
      default:
        return '💼';
    }
  };

  // Format date
  const formatDate = (dateString: any) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start mb-3">
          <div className="flex-shrink-0 mr-3 text-2xl">
            {getAdviceIcon(advice.type)}
          </div>
          <div>
            <h3 className="font-medium text-lg">{advice.title}</h3>
            <p className="text-sm text-gray-500">{formatDate(advice.generatedAt)}</p>
          </div>
        </div>
        
        <p className="text-gray-600 line-clamp-3">{advice.summary}</p>
        
        <div className="mt-4">
          <Link 
            to={`/financial-advice/${advice._id}`} 
            className="text-primary-600 hover:underline font-medium"
          >
            Read full advice →
          </Link>
        </div>
      </div>
      
      {!advice.isRead && (
        <div className="bg-primary-50 text-primary-700 text-xs font-medium py-1 px-5 flex justify-center">
          New Advice
        </div>
      )}
    </div>
  );
};

export default FinancialAdviceCard;