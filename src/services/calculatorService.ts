import { db } from './db';
import { CalculatorData, CityComparison } from '../types/calculator';

export type { CalculatorData, CityComparison };

// Cache for city comparisons
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
let cityComparisonsCache: {
  data: CityComparison[];
  timestamp: number;
} | null = null;

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function for exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to validate user ID
const validateUserId = (userId: string | undefined): string | null => {
  if (!userId) {
    return null;
  }
  const userIdStr = String(userId).trim();
  if (!userIdStr) {
    return null;
  }
  return userIdStr;
};

export const calculatorService = {
  async saveCalculation(data: Omit<CalculatorData, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const userId = validateUserId(data.userId);
      if (!userId) {
        throw new Error('User must be logged in to save calculations');
      }

      const calculation: CalculatorData = {
        ...data,
        userId,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.calculations.add(calculation);
    } catch (error) {
      console.error('Error saving calculation:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to save calculation');
    }
  },

  async getCalculations(userId: string): Promise<CalculatorData[]> {
    try {
      const userIdStr = validateUserId(userId);
      if (!userIdStr) {
        return []; // Return empty array for unauthenticated users
      }

      const calculations = await db.calculations
        .where('userId')
        .equals(userIdStr)
        .toArray();
      return calculations as CalculatorData[];
    } catch (error) {
      console.error('Error fetching calculations:', error);
      return []; // Return empty array on error
    }
  },

  async getLatestCalculation(userId: string): Promise<CalculatorData | null> {
    try {
      const userIdStr = validateUserId(userId);
      if (!userIdStr) {
        return null; // Return null for unauthenticated users
      }

      const calculation = await db.calculations
        .where('userId')
        .equals(userIdStr)
        .reverse()
        .first();
      return calculation as CalculatorData | null;
    } catch (error) {
      console.error('Error fetching latest calculation:', error);
      return null; // Return null on error
    }
  },

  async getCityComparisons(): Promise<CityComparison[]> {
    // Check cache first
    if (cityComparisonsCache && Date.now() - cityComparisonsCache.timestamp < CACHE_DURATION) {
      return cityComparisonsCache.data;
    }

    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < MAX_RETRIES) {
      try {
        // Try to fetch from API first
        const response = await fetch('https://cost-of-living-and-prices.p.rapidapi.com/prices?city_name=Lagos&country_name=Nigeria', {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
            'X-RapidAPI-Host': 'cost-of-living-and-prices.p.rapidapi.com'
          }
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        // Transform the data to match our interface
        const nigerianCities = data.cities?.map((city: any) => ({
          city: city.name,
          costOfLiving: city.costOfLivingIndex / 100,
          averageRent: city.housing?.rent * 1000 || 0,
          averageTransport: city.transportation?.publicTransport * 1000 || 0,
          averageUtilities: city.utilities?.basic * 1000 || 0
        })) || [];

        if (nigerianCities.length) {
          cityComparisonsCache = { data: nigerianCities, timestamp: Date.now() };
          return nigerianCities;
        }

        // If no cities found, use fallback
        throw new Error('No city data available from API');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');
        retryCount++;
        
        if (retryCount < MAX_RETRIES) {
          const delayMs = INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1);
          console.log(`Retrying in ${delayMs}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await delay(delayMs);
        }
      }
    }

    // If all retries failed, use fallback data
    console.warn('Using fallback data after failed API attempts:', lastError?.message);
    const fallbackData = this.getFallbackData();
    cityComparisonsCache = { data: fallbackData, timestamp: Date.now() };
    return fallbackData;
  },

  getFallbackData(): CityComparison[] {
    return [
      {
        city: 'Lagos',
        costOfLiving: 1.0,
        averageRent: 1200000,
        averageTransport: 150000,
        averageUtilities: 45000
      },
      {
        city: 'Abuja',
        costOfLiving: 1.1,
        averageRent: 1500000,
        averageTransport: 120000,
        averageUtilities: 50000
      },
      {
        city: 'Port Harcourt',
        costOfLiving: 0.9,
        averageRent: 800000,
        averageTransport: 100000,
        averageUtilities: 40000
      },
      {
        city: 'Ibadan',
        costOfLiving: 0.7,
        averageRent: 500000,
        averageTransport: 80000,
        averageUtilities: 30000
      },
      {
        city: 'Kano',
        costOfLiving: 0.65,
        averageRent: 450000,
        averageTransport: 70000,
        averageUtilities: 28000
      }
    ];
  },

  exportToCSV(data: CalculatorData): void {
    try {
      const headers = ['Category', 'Item', 'Amount', 'Frequency'];
      const rows = data.categories.flatMap((category: { name: string; items: Array<{ name: string; amount: number; frequency: string }> }) =>
        category.items.map((item: { name: string; amount: number; frequency: string }) => [
          category.name,
          item.name,
          item.amount.toString(),
          item.frequency
        ])
      );

      const csvContent = [
        headers.join(','),
        ...rows.map((row: string[]) => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `lifestyle-cost-${new Date().toISOString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error('Failed to export data to CSV');
    }
  }
}; 