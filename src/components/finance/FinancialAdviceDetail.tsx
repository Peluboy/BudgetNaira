import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaRegStar, FaThumbsUp } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../../services/api';

const FinancialAdviceDetail = ({ advice, onBack }: any) => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(advice.feedbackRating || 0);
  const [comment, setComment] = useState(advice.feedbackComment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);

  // Format date
  const formatDate = (dateString:any)=> {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Submit feedback
  const handleSubmitFeedback = async () => {
    if (rating === 0) return;
    
    try {
      setIsSubmitting(true);
      await api.post(`/financial-advice/${advice._id}/feedback`, {
        rating,
        comment
      });
      setShowFeedbackSuccess(true);
      setTimeout(() => setShowFeedbackSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <button 
          onClick={onBack} 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" /> Back to Advice
        </button>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{advice.title}</h2>
        <p className="text-gray-500 mt-1">Generated on {formatDate(advice.generatedAt)}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <p className="text-gray-800">{advice.summary}</p>
      </div>
      
      {advice.recommendations && advice.recommendations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Recommendations</h3>
          <div className="space-y-4">
            {advice.recommendations.map((rec: any, index: number) => (
              <div key={index} className="bg-white border border-gray-200 rounded-md p-4">
                <div className="flex items-start">
                  <div 
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 text-white ${
                      rec.priorityLevel === 'high' 
                        ? 'bg-red-500' 
                        : rec.priorityLevel === 'medium' 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{rec.title}</h4>
                    <p className="text-gray-600 mt-1">{rec.description}</p>
                    
                    {rec.actionItems && rec.actionItems.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Action Items:</h5>
                        <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
                          {rec.actionItems.map((item: any, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {advice.dataPoints && advice.dataPoints.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advice.dataPoints.map((point: any, index: number) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md">
                <div className="flex flex-col h-full">
                  <h4 className="text-sm font-medium text-gray-500">{point.name}</h4>
                  <p className="text-lg font-semibold mt-1">{point.value}</p>
                  <p className="text-sm text-gray-600 mt-2 flex-grow">{point.insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t border-gray-200 pt-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Was this advice helpful?</h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-xl text-yellow-400 focus:outline-none"
              >
                {star <= rating ? <FaStar /> : <FaRegStar />}
              </button>
            ))}
          </div>
          
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Optional feedback..."
              className="input w-full"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          
          <button
            type="button"
            onClick={handleSubmitFeedback}
            disabled={rating === 0 || isSubmitting}
            className={`btn ${
              rating === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'btn-primary'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
        
        {showFeedbackSuccess && (
          <div className="mt-3 text-green-600 flex items-center">
            <FaThumbsUp className="mr-2" /> Thank you for your feedback!
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialAdviceDetail;