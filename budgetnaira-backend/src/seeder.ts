import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './models/User';
import Category from './models/Category';
import Expense from './models/Expense';
import Budget from './models/Budget';
import SavingGoal from './models/SavingGoal';

colors.enable();

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI as string);

// Default categories data
const defaultExpenseCategories = [
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

const defaultIncomeCategories = [
  { name: 'Salary', type: 'income', icon: 'money', color: '#10B981', isDefault: true },
  { name: 'Freelance', type: 'income', icon: 'freelance', color: '#6366F1', isDefault: true },
  { name: 'Business', type: 'income', icon: 'business', color: '#F59E0B', isDefault: true },
  { name: 'Investments', type: 'income', icon: 'investment', color: '#8B5CF6', isDefault: true },
  { name: 'Gifts', type: 'income', icon: 'gift', color: '#EC4899', isDefault: true },
];

const defaultSavingsCategories = [
  { name: 'Emergency Fund', type: 'savings', icon: 'emergency', color: '#EF4444', isDefault: true },
  { name: 'Retirement', type: 'savings', icon: 'retirement', color: '#6366F1', isDefault: true },
  { name: 'Education', type: 'savings', icon: 'education', color: '#F59E0B', isDefault: true },
  { name: 'Home', type: 'savings', icon: 'home', color: '#10B981', isDefault: true },
  { name: 'Travel', type: 'savings', icon: 'travel', color: '#8B5CF6', isDefault: true },
];

// Import default data
const importData = async () => {
  try {
    // Clear existing data
    await Category.deleteMany({ isDefault: true });
    
    // Create admin user
    const adminUser = await User.findOne({ email: 'admin@budgetnaira.com' });
    let userId;
    
    if (!adminUser) {
      const user = await User.create({
        name: 'Admin User',
        email: 'admin@budgetnaira.com',
        password: 'password123',
        currency: 'NGN',
      });
      userId = user._id;
    } else {
      userId = adminUser._id;
    }
    
    // Add userId to each category
    const expenseCategories = defaultExpenseCategories.map(cat => ({
      ...cat,
      userId
    }));
    
    const incomeCategories = defaultIncomeCategories.map(cat => ({
      ...cat,
      userId
    }));
    
    const savingsCategories = defaultSavingsCategories.map(cat => ({
      ...cat,
      userId
    }));
    
    const allCategories = [
      ...expenseCategories,
      ...incomeCategories,
      ...savingsCategories
    ];
    
    // Insert default categories
    await Category.insertMany(allCategories);
    
    console.log('Default data imported!'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(`${(err as Error).message}`.red.inverse);
    process.exit(1);
  }
};

// Delete all data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Expense.deleteMany();
    await Budget.deleteMany();
    await SavingGoal.deleteMany();
    
    console.log('All data destroyed!'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(`${(err as Error).message}`.red.inverse);
    process.exit(1);
  }
};

// Process command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i to import or -d to destroy data'.yellow);
  process.exit();
}