import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { initDB } from './services/db';
import { useAuth } from './hooks/useAuth';

// Import pages
import Dashboard from './pages/Dashboard';
import Layout from './components/layout/Layout';
import ExpensesPage from './pages/ExpensesPage';
import BudgetPage from './pages/BudgetPage';
import OnboardingPage from './pages/OnboardingPage';
import SavingsPage from './pages/SavingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SplashScreen from './components/auth/SplashScreen';
import FinancialDashboardPage from './pages/FinancialDashboardPage';
import FinancialAdviceListPage from './components/finance/FinancialAdviceListPage';
import FinancialAdviceDetailPage from './pages/FinancialAdviceDetailPage';
import GenerateAdvicePage from './pages/GenerateAdvicePage';
import FinancialProfilePage from './pages/FinancialProfilePage';
import ForgotPasswordPage from './pages/ForgetPassword';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FinancialDashboard from './components/finance/FinancialDashboard';
// import FinancialAdvice from './pages/FinancialAdvice';

const AppRoutes: React.FC = () => {
  useEffect(() => {
    initDB();
  }, []);

  return (
    <Provider store={store}>
      <Routes>
        {/* Splash and Auth routes without layout */}
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        
        {/* Protected routes with layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/savings" element={<SavingsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/financial-dashboard-profile" element={<FinancialDashboard />} />
            <Route path="/financial-profile" element={<FinancialProfilePage />} />
            <Route path="/financial-dashboard" element={<FinancialDashboardPage />} />
            <Route path="/financial-advice" element={<FinancialAdviceListPage />} />
            <Route path="/financial-advice/:id" element={<FinancialAdviceDetailPage />} />
            <Route path="/financial-advice/new" element={<GenerateAdvicePage />} />
          </Route>
        </Route>
        
        {/* Initial route redirects to splash */}
        <Route path="" element={<Navigate to="/splash" replace />} />
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Provider>
  );
};

export default AppRoutes; 