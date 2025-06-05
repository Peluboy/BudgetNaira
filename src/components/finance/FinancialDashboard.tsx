import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaMoneyBillWave, FaLightbulb } from 'react-icons/fa';
import api from '../../services/api';

interface FinancialDashboardData {
  financialStatus: string;
  financialHealthScore: number; 
  topPriority: string;
  summary: string;
  metrics: {
    emergencyFundRatio: number;
    debtToIncomeRatio: number;
    savingsRate: number;
  };
  improvement: {
    topPriority: {
      area: string;
      message: string;
    };
  };  
  latestAdvice: {
    id: string;
    type: string;
    title: string;
    content: string;
    summary: string; 
  };  
}

const FinancialDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState<FinancialDashboardData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/financial-advice/dashboard');
        setDashboard(response.data.data);
        setError(null);
      } catch (err:any) {
        setError(err.response?.data?.error || 'Failed to load financial dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="w-12 h-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div></div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md my-4">
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-700">{error}</p>
        <p className="mt-2">
          <Link to="/financial-profile" className="text-primary-600 hover:underline">
            Complete your financial profile
          </Link> to receive personalized advice.
        </p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-gray-500">No dashboard data available.</div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold dark:text-white">Financial Health Score</h2>
          <div className="relative w-20 h-20">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={getScoreColor(dashboard.financialHealthScore)}
                strokeWidth="3"
                strokeDasharray={`${dashboard.financialHealthScore}, 100`}
                strokeLinecap="round"
              />
              <text x="18" y="20.5" textAnchor="middle" fontSize="10" fill={getScoreColor(dashboard.financialHealthScore)}>
                {dashboard.financialHealthScore}%
              </text>
            </svg>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Your financial health is <span className="font-semibold" style={{ color: getScoreColor(dashboard.financialHealthScore) }}>
            {dashboard?.financialStatus}
          </span>
        </p>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-xs text-gray-500 dark:text-gray-400">Emergency Fund</p>
            <p className="text-lg font-semibold dark:text-white">{Math.round(dashboard.metrics.emergencyFundRatio * 100)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">of target</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-xs text-gray-500 dark:text-gray-400">Debt-to-Income</p>
            <p className="text-lg font-semibold dark:text-white">{Math.round(dashboard?.metrics.debtToIncomeRatio * 100)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">of income</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-xs text-gray-500 dark:text-gray-400">Savings Rate</p>
            <p className="text-lg font-semibold dark:text-white">{Math.round(dashboard?.metrics.savingsRate * 1)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">of income</p>
          </div>
        </div>
      </div>
      
      {dashboard?.improvement && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <FaLightbulb className="text-yellow-500 text-xl" />
            </div>
            <div>
              <h3 className="font-medium dark:text-white">Top Priority: {dashboard.improvement.topPriority.area}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{dashboard.improvement.topPriority.message}</p>
            </div>
          </div>
        </div>
      )}
      
      {dashboard?.latestAdvice && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-medium mb-3">Latest Financial Advice</h3>
          <div className="border-l-4 border-primary-500 pl-4 py-2">
            <h4 className="font-medium text-lg">{dashboard.latestAdvice.title}</h4>
            <p className="text-gray-600 mt-1 line-clamp-2">{dashboard.latestAdvice.summary}</p>
            <div className="mt-3">
              <Link 
                to={`/financial-advice/${dashboard.latestAdvice.id}`} 
                className="text-primary-600 hover:underline font-medium"
              >
                Read full advice
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-medium mb-4 flex items-center">
            <FaChartLine className="text-primary-600 mr-2" />
            Get Personalized Advice
          </h3>
          <p className="text-gray-600 mb-4">
            Receive AI-powered financial guidance tailored to your specific situation.
          </p>
          <Link 
            to="/financial-advice/new" 
            className="btn btn-primary inline-block"
          >
            Generate Advice
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-medium mb-4 flex items-center">
            <FaMoneyBillWave className="text-primary-600 mr-2" />
            Update Your Financial Profile
          </h3>
          <p className="text-gray-600 mb-4">
            Keep your profile current to receive more accurate financial recommendations.
          </p>
          <Link 
            to="/financial-profile" 
            className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 inline-block"
          >
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

// Helper function to get color based on score
const getScoreColor = (score:any) => {
  if (score >= 80) return '#16A34A'; // green-600
  if (score >= 60) return '#F59E0B'; // amber-500
  if (score >= 40) return '#F97316'; // orange-500
  return '#EF4444'; // red-500
};

export default FinancialDashboard;