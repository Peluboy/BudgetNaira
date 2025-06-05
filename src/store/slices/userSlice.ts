import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IUserSettings, db } from '../../services/db';

// Define the state interface
interface UserState {
  settings: IUserSettings | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define initial state
const initialState: UserState = {
  settings: null,
  isAuthenticated: false,
  status: 'idle',
  error: null
};

// Async thunks
export const fetchUserSettings = createAsyncThunk(
  'user/fetchUserSettings',
  async () => {
    try {
      const settings = await db.userSettings.get('default');
      return settings || null;
    } catch (error) {
      throw error;
    }
  }
);

export const updateUserSettings = createAsyncThunk(
  'user/updateUserSettings',
  async (settings: Partial<IUserSettings>) => {
    try {
      const currentSettings = await db.userSettings.get('default');
      
      if (!currentSettings) {
        throw new Error('User settings not found');
      }
      
      const updatedSettings: IUserSettings = {
        ...currentSettings,
        ...settings,
        updatedAt: new Date()
      };
      
      await db.userSettings.update('default', updatedSettings);
      return updatedSettings;
    } catch (error) {
      throw error;
    }
  }
);

// Create the slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user settings
      .addCase(fetchUserSettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserSettings.fulfilled, (state, action: PayloadAction<IUserSettings | null>) => {
        state.status = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(fetchUserSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch user settings';
      })
      
      // Update user settings
      .addCase(updateUserSettings.fulfilled, (state, action: PayloadAction<IUserSettings>) => {
        state.settings = action.payload;
      });
  }
});

export const { setAuthenticated, logout } = userSlice.actions;
export default userSlice.reducer;