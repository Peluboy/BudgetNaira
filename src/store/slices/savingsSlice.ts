import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ISavingGoal, db } from '../../services/db';
import { v4 as uuidv4 } from 'uuid';

// Define the state interface
interface SavingsState {
  goals: ISavingGoal[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define initial state
const initialState: SavingsState = {
  goals: [],
  status: 'idle',
  error: null
};

// Async thunks
export const fetchSavingGoals = createAsyncThunk(
  'savings/fetchSavingGoals',
  async () => {
    try {
      const goals = await db.savingGoals.toArray();
      return goals;
    } catch (error) {
      throw error;
    }
  }
);

export const addSavingGoal = createAsyncThunk(
  'savings/addSavingGoal',
  async (goal: Omit<ISavingGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const timestamp = new Date();
      const newGoal: ISavingGoal = {
        ...goal,
        id: uuidv4(),
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      await db.savingGoals.add(newGoal);
      return newGoal;
    } catch (error) {
      throw error;
    }
  }
);

export const updateSavingGoal = createAsyncThunk(
  'savings/updateSavingGoal',
  async (goal: ISavingGoal) => {
    try {
      const updatedGoal = {
        ...goal,
        updatedAt: new Date()
      };
      
      if (!updatedGoal.id) {
        throw new Error('Goal ID is required for updates');
      }
      
      await db.savingGoals.update(updatedGoal.id, updatedGoal);
      return updatedGoal;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteSavingGoal = createAsyncThunk(
  'savings/deleteSavingGoal',
  async (id: string) => {
    try {
      await db.savingGoals.delete(id);
      return id;
    } catch (error) {
      throw error;
    }
  }
);

export const addFundsToGoal = createAsyncThunk(
  'savings/addFundsToGoal',
  async ({ id, amount }: { id: string; amount: number }) => {
    try {
      const goal = await db.savingGoals.get(id);
      
      if (!goal) {
        throw new Error('Saving goal not found');
      }
      
      const updatedGoal: ISavingGoal = {
        ...goal,
        currentAmount: goal.currentAmount + amount,
        updatedAt: new Date(),
        isCompleted: goal.currentAmount + amount >= goal.targetAmount
      };
      
      await db.savingGoals.update(id, updatedGoal);
      return updatedGoal;
    } catch (error) {
      throw error;
    }
  }
);

// Create the slice
const savingsSlice = createSlice({
  name: 'savings',
  initialState,
  reducers: {
    clearSavingGoals: (state) => {
      state.goals = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch saving goals
      .addCase(fetchSavingGoals.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSavingGoals.fulfilled, (state, action: PayloadAction<ISavingGoal[]>) => {
        state.status = 'succeeded';
        state.goals = action.payload;
      })
      .addCase(fetchSavingGoals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch saving goals';
      })
      
      // Add saving goal
      .addCase(addSavingGoal.fulfilled, (state, action: PayloadAction<ISavingGoal>) => {
        state.goals.push(action.payload);
      })
      
      // Update saving goal
      .addCase(updateSavingGoal.fulfilled, (state, action: PayloadAction<ISavingGoal>) => {
        const index = state.goals.findIndex(goal => goal.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      
      // Delete saving goal
      .addCase(deleteSavingGoal.fulfilled, (state, action: PayloadAction<string>) => {
        state.goals = state.goals.filter(goal => goal.id !== action.payload);
      })
      
      // Add funds to goal
      .addCase(addFundsToGoal.fulfilled, (state, action: PayloadAction<ISavingGoal>) => {
        const index = state.goals.findIndex(goal => goal.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      });
  }
});

export const { clearSavingGoals } = savingsSlice.actions;
export default savingsSlice.reducer;