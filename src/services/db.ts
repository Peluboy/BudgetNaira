import Dexie, { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

export interface IParticipant {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  email?: string;
  phone?: string;
  settled: boolean;
  settledDate?: Date;
}

// Define interfaces for database tables
export interface IExpense {
  id?: string;
  _id?: string;
  amount: number;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  date: Date;
  paymentMethod: string;
  location?: string;
  isRecurring: boolean;
  recurringDetails?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: Date;
  };
  tags?: string[];
  attachmentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isSplit: boolean;
  participants: IParticipant[];
  isFromBudget?: boolean;
  budgetId?: string;
  budgetName?: string;
}

export interface IBudget {
  id?: string;
  name: string;
  amount: number;
  category: {
    _id: string;
    name: string;
  };
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  recurringDetails?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISavingGoal {
  id?: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate: Date;
  category: string;
  isCompleted: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  id?: string;
  name: string;
  type: 'expense' | 'income' | 'savings';
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIncome {
  id?: string;
  amount: number;
  source: string;
  date: Date;
  isRecurring: boolean;
  recurringDetails?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: Date;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSettings {
  id?: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  reminderSettings?: {
    billReminders: boolean;
    budgetAlerts: boolean;
    savingsGoalUpdates: boolean;
  };
  securitySettings?: {
    requireAuthentication: boolean;
    biometricEnabled?: boolean;
  };
  updatedAt: Date;
}

// Create Dexie database class
class BudgetNairaDB extends Dexie {
  expenses!: Table<IExpense>;
  budgets!: Table<IBudget>;
  savingGoals!: Table<ISavingGoal>;
  categories!: Table<ICategory>;
  incomes!: Table<IIncome>;
  userSettings!: Table<IUserSettings>;

  constructor() {
    super('BudgetNairaDB');
    
    this.version(1).stores({
      expenses: '&id, category, date, isRecurring',
      budgets: '&id, category, startDate, endDate',
      savingGoals: '&id, category, isCompleted',
      categories: '&id, type',
      incomes: '&id, source, date, isRecurring',
      userSettings: '&id'
    });
  }

  // Initialize with default data
  async initializeDefaults() {
    // Check if we already have categories
    const categoryCount = await this.categories.count();
    
    if (categoryCount === 0) {
      // Default expense categories
      const defaultExpenseCategories: Omit<ICategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
        { name: 'Housing', type: 'expense', icon: 'home', color: '#4B5563', isDefault: true },
        { name: 'Food', type: 'expense', icon: 'food', color: '#EF4444', isDefault: true },
        { name: 'Transportation', type: 'expense', icon: 'car', color: '#F59E0B', isDefault: true },
        { name: 'Utilities', type: 'expense', icon: 'utility', color: '#3B82F6', isDefault: true },
        { name: 'Generator Fuel', type: 'expense', icon: 'fuel', color: '#8B5CF6', isDefault: true },
        { name: 'Internet/Data', type: 'expense', icon: 'wifi', color: '#EC4899', isDefault: true },
        { name: 'Healthcare', type: 'expense', icon: 'health', color: '#10B981', isDefault: true },
        { name: 'Education', type: 'expense', icon: 'education', color: '#6366F1', isDefault: true },
        { name: 'Entertainment', type: 'expense', icon: 'entertainment', color: '#F97316', isDefault: true },
        { name: 'Clothing', type: 'expense', icon: 'clothing', color: '#14B8A6', isDefault: true },
      ];      

      const timestamp = new Date();
      
      // Add default categories with IDs
      await this.categories.bulkAdd(
        defaultExpenseCategories.map(category => ({
          ...category,
          id: uuidv4(),
          createdAt: timestamp,
          updatedAt: timestamp
        }))
      );

      // Create default user settings
      await this.userSettings.add({
        id: 'default',
        currency: 'NGN',
        language: 'en',
        theme: 'light',
        notificationsEnabled: true,
        reminderSettings: {
          billReminders: true,
          budgetAlerts: true,
          savingsGoalUpdates: true
        },
        securitySettings: {
          requireAuthentication: false
        },
        updatedAt: timestamp
      });
    }
  }
}

// Export a singleton instance
export const db = new BudgetNairaDB();

// Initialize database with default data
export const initDB = async () => {
  try {
    await db.initializeDefaults();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};