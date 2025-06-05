import mongoose from 'mongoose';
import Expense from '../models/Expense';
import dotenv from 'dotenv';

dotenv.config();

const updateBudgetExpenses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');

    // Find all expenses that have "Budget spending" in their description
    const expenses = await Expense.find({
      description: { $regex: /Budget spending/i }
    });

    console.log(`Found ${expenses.length} budget expenses to update`);

    // Update each expense
    for (const expense of expenses) {
      expense.isFromBudget = true;
      // Extract budget name from description
      const budgetName = expense.description.replace('Budget spending for ', '');
      expense.budgetName = budgetName;
      await expense.save();
    }

    console.log('Successfully updated budget expenses');
  } catch (error) {
    console.error('Error updating budget expenses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateBudgetExpenses(); 