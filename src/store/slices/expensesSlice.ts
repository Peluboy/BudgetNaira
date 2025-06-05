import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IExpense, db } from '../../services/db';
import { v4 as uuidv4 } from 'uuid';

// Define the state interface
interface ExpensesState {
  items: IExpense[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define initial state
const initialState: ExpensesState = {
  items: [],
  status: 'idle',
  error: null
};

// Async thunks
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async () => {
    try {
      const expenses = await db.expenses.toArray();
      return expenses;
    } catch (error) {
      throw error;
    }
  }
);

export const addExpense = createAsyncThunk(
  'expenses/addExpense',
  async (expense: Omit<IExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const timestamp = new Date();
      const newExpense: IExpense = {
        ...expense,
        id: uuidv4(),
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      await db.expenses.add(newExpense);
      return newExpense;
    } catch (error) {
      throw error;
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async (expense: IExpense) => {
    try {
      const updatedExpense = {
        ...expense,
        updatedAt: new Date()
      };
      
      if (!updatedExpense.id) {
        throw new Error('Expense ID is required for updates');
      }
      
      await db.expenses.update(updatedExpense.id, updatedExpense);
      return updatedExpense;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string) => {
    try {
      await db.expenses.delete(id);
      return id;
    } catch (error) {
      throw error;
    }
  }
);

// Create the slice
const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    // Additional reducers if needed
    clearExpenses: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<IExpense[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch expenses';
      })
      
      // Add expense
      .addCase(addExpense.fulfilled, (state, action: PayloadAction<IExpense>) => {
        state.items.push(action.payload);
      })
      
      // Update expense
      .addCase(updateExpense.fulfilled, (state, action: PayloadAction<IExpense>) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete expense
      .addCase(deleteExpense.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  }
});

export const { clearExpenses } = expensesSlice.actions;
export default expensesSlice.reducer;