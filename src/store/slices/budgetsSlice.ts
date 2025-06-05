import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IBudget, db } from '../../services/db';
import { v4 as uuidv4 } from 'uuid';

// Define the state interface
interface BudgetsState {
  items: IBudget[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define initial state
const initialState: BudgetsState = {
  items: [],
  status: 'idle',
  error: null
};

// Async thunks
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async () => {
    try {
      const budgets = await db.budgets.toArray();
      return budgets;
    } catch (error) {
      throw error;
    }
  }
);

export const addBudget = createAsyncThunk(
  'budgets/addBudget',
  async (budget: Omit<IBudget, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const timestamp = new Date();
      const newBudget: IBudget = {
        ...budget,
        id: uuidv4(),
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      await db.budgets.add(newBudget);
      return newBudget;
    } catch (error) {
      throw error;
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async (budget: IBudget) => {
    try {
      const updatedBudget = {
        ...budget,
        updatedAt: new Date()
      };
      
      if (!updatedBudget.id) {
        throw new Error('Budget ID is required for updates');
      }
      
      await db.budgets.update(updatedBudget.id, updatedBudget);
      return updatedBudget;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: string) => {
    try {
      await db.budgets.delete(id);
      return id;
    } catch (error) {
      throw error;
    }
  }
);

// Create the slice
const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearBudgets: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBudgets.fulfilled, (state, action: PayloadAction<IBudget[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch budgets';
      })
      
      // Add budget
      .addCase(addBudget.fulfilled, (state, action: PayloadAction<IBudget>) => {
        state.items.push(action.payload);
      })
      
      // Update budget
      .addCase(updateBudget.fulfilled, (state, action: PayloadAction<IBudget>) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete budget
      .addCase(deleteBudget.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  }
});

export const { clearBudgets } = budgetsSlice.actions;
export default budgetsSlice.reducer;