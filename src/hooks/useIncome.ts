import { useState, useEffect, useCallback } from 'react';
import { financialProfileService } from '../services/api';

interface IncomeData {
  monthlyIncome: number;
  employmentType: string;
  occupation: string;
  location?: string;
  state?: string;
  dependents?: number;
}

export const useIncome = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incomeData, setIncomeData] = useState<IncomeData | null>(null);

  const fetchIncomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await financialProfileService.get();
      const profileData = response.data.data;
      
      if (profileData) {
        setIncomeData({
          monthlyIncome: profileData.monthlyIncome || 0,
          employmentType: profileData.employmentType || '',
          occupation: profileData.occupation || '',
          location: profileData.location,
          state: profileData.state,
          dependents: profileData.dependents
        });
      }
    } catch (err: any) {
      console.error('Error fetching income data:', err);
      setError(err.response?.data?.error || 'Failed to fetch income data');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIncomeData = async (data: Partial<IncomeData>) => {
    try {
      setLoading(true);
      setError(null);

      const updatedData = {
        ...incomeData,
        ...data
      };

      await financialProfileService.createUpdate(updatedData);
      await fetchIncomeData();
      return true;
    } catch (err: any) {
      console.error('Error updating income data:', err);
      setError(err.response?.data?.error || 'Failed to update income data');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch income data on mount
  useEffect(() => {
    fetchIncomeData();
  }, [fetchIncomeData]);

  return {
    loading,
    error,
    incomeData,
    fetchIncomeData,
    updateIncomeData
  };
}; 