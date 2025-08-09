export interface CalculatorData {
  id: string;
  userId: string;
  location: string;
  income: number;
  categories: {
    id: string;
    name: string;
    items: {
      id: string;
      name: string;
      amount: number;
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CityComparison {
  city: string;
  costOfLiving: number;
  averageRent: number;
  averageTransport: number;
  averageUtilities: number;
} 