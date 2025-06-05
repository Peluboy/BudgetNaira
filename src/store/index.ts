import { configureStore } from '@reduxjs/toolkit';
import expensesReducer from './slices/expensesSlice';
import budgetsReducer from './slices/budgetsSlice';
import savingsReducer from './slices/savingsSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    expenses: expensesReducer,
    budgets: budgetsReducer,
    savings: savingsReducer,
    ui: uiReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable date objects
        ignoredActions: ['expenses/addExpense', 'expenses/updateExpense'],
        ignoredPaths: ['expenses.items'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;