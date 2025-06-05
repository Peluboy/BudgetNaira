import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => 
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) => 
    api.post('/auth/reset-password', data),
  verifyToken: () => api.get('/auth/verify')
};

// Budget Service
export const budgetService = {
  getAll: (params?: any) => api.get('/budgets', { params }),
  getById: (id: string) => api.get(`/budgets/${id}`),
  create: (budget: any) => api.post('/budgets', budget),
  update: (id: string, budget: any) => api.put(`/budgets/${id}`, budget),
  delete: (id: string) => api.delete(`/budgets/${id}`),
  getOverview: () => api.get('/budgets/overview'),
};

// Category Service
export const categoryService = {
  getAll: (params?: any) => api.get('/categories', { params }),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (category: any) => api.post('/categories', category),
  update: (id: string, category: any) => api.put(`/categories/${id}`, category),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Expense Service
export const expenseService = {
  getAll: (params?: any) => api.get('/expenses', { params }),
  getById: (id: string) => api.get(`/expenses/${id}`),
  create: (expense: any) => api.post('/expenses', expense),
  update: (id: string, expense: any) => api.put(`/expenses/${id}`, expense),
  delete: (id: string) => api.delete(`/expenses/${id}`),
  getOverview: () => api.get('/expenses/overview'),
  getByCategory: (categoryId: string) => api.get(`/expenses/category/${categoryId}`),
  getByDateRange: (startDate: string, endDate: string) => 
    api.get('/expenses/range', { params: { startDate, endDate } }),
  splitExpense: (expenseId: string, participants: any[], accountDetails: any) => 
    api.post(`/expenses/${expenseId}/split`, { participants, accountDetails }),
  settleExpense: (expenseId: string, participantId: string) => 
    api.post(`/expenses/${expenseId}/settle`, { participantId }),
};

// Financial Profile Service
export const financialProfileService = {
  get: () => api.get('/financial-profile'),
  createUpdate: (profile: any) => api.post('/financial-profile', profile),
  addGoal: (goal: any) => api.post('/financial-profile/goals', goal),
  updateGoal: (goalId: string, goal: any) => api.put(`/financial-profile/goals/${goalId}`, goal),
  removeGoal: (goalId: string) => api.delete(`/financial-profile/goals/${goalId}`),
  updateDebt: (debtInfo: any) => api.put('/financial-profile/debt', debtInfo),
  addLoan: (loan: any) => api.post('/financial-profile/debt/loans', loan),
  updateLoan: (loanId: string, loan: any) => api.put(`/financial-profile/debt/loans/${loanId}`, loan),
  removeLoan: (loanId: string) => api.delete(`/financial-profile/debt/loans/${loanId}`),
};

// User Service
export const userService = {
  updateProfile: (data: any) => api.put('/users/profile', data),
  updatePreferences: (data: any) => api.put('/users/preferences', data),
  getProfile: () => api.get('/users/me'),
  getPreferences: () => api.get('/users/preferences'),
  updateProfileImage: (formData: FormData) => api.post('/users/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

export default api;