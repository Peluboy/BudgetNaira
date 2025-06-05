import React, { useState, useEffect } from 'react';
import { FaLock } from '@react-icons/all-files/fa/FaLock';
import { FaBell } from '@react-icons/all-files/fa/FaBell';
import { FaMoneyBillWave } from '@react-icons/all-files/fa/FaMoneyBillWave';
import { FaSignOutAlt } from '@react-icons/all-files/fa/FaSignOutAlt';
import { FaToggleOn } from '@react-icons/all-files/fa/FaToggleOn';
import { FaToggleOff } from '@react-icons/all-files/fa/FaToggleOff';
import { FaCamera } from '@react-icons/all-files/fa/FaCamera';
import { FaUserCircle } from '@react-icons/all-files/fa/FaUserCircle';
// import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useIncome } from '../hooks/useIncome';
import { useTheme } from '../contexts/ThemeContext';
import { userService } from '../services/api';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const { loading: incomeLoading, error: incomeError, incomeData, updateIncomeData } = useIncome();
  const { theme, setTheme } = useTheme();
  
  // Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Settings state
  const [currency, setCurrency] = useState('NGN');
  const [language, setLanguage] = useState('en');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [billReminders, setBillReminders] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [savingsGoalUpdates, setSavingsGoalUpdates] = useState(true);
  const [requireAuth, setRequireAuth] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [employmentType, setEmploymentType] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');

  // Available settings options
  const currencies = [
    { code: 'NGN', name: 'Nigerian Naira (₦)' },
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' }
  ] as const;

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'ha', name: 'Hausa' },
    { code: 'ig', name: 'Igbo' }
  ] as const;

  const themes = [
    { value: 'light', name: 'Light' },
    { value: 'dark', name: 'Dark' }
  ] as const;

  // Initialize profile data
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        country: currentUser.country || ''
      });
      // Initialize profile image from current user
      setProfileImage(currentUser.profileImage || null);
    }
  }, [currentUser]);

  // Initialize income data
  useEffect(() => {
    if (incomeData) {
      setMonthlyIncome(incomeData.monthlyIncome);
      setEmploymentType(incomeData.employmentType);
      setOccupation(incomeData.occupation);
    }
  }, [incomeData]);

  // Initialize theme from user preferences
  useEffect(() => {
    if (!currentUser?.preferences?.theme) return;
  
    // Only apply user preference theme if it hasn't already been set
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      setTheme(currentUser.preferences.theme);
    }
  }, []);  

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    if (newTheme === theme) return; // Don't do anything if the theme hasn't changed
    
    try {
      // Update theme in context first
      setTheme(newTheme);
      
      // Then update preferences in backend
      await userService.updatePreferences({ theme: newTheme });
    } catch (err) {
      console.error('Failed to update theme preference:', err);
      // Revert theme if backend update fails
      setTheme(theme);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);

    try {
      const response = await userService.updateProfile(profileData);
      if (response.data.success) {
        await updateUser(response.data.data);
        setIsEditingProfile(false);
      }
    } catch (err: any) {
      setProfileError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateIncomeData({
      monthlyIncome,
      employmentType,
      occupation
    });
    
    if (success) {
      setIsEditingIncome(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    // TODO: Implement language change functionality
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency);
    try {
      await userService.updatePreferences({ currency: newCurrency });
    } catch (err) {
      console.error('Failed to update currency preference:', err);
    }
  };

  const handleNotificationToggle = async (setting: string, value: boolean) => {
    try {
      await userService.updatePreferences({ [setting]: value });
      switch (setting) {
        case 'notificationsEnabled':
          setNotificationsEnabled(value);
          break;
        case 'billReminders':
          setBillReminders(value);
          break;
        case 'budgetAlerts':
          setBudgetAlerts(value);
          break;
        case 'savingsGoalUpdates':
          setSavingsGoalUpdates(value);
          break;
      }
    } catch (err) {
      console.error('Failed to update notification preference:', err);
    }
  };

  const handleSecurityToggle = async (setting: string, value: boolean) => {
    try {
      await userService.updatePreferences({ [setting]: value });
      switch (setting) {
        case 'requireAuth':
          setRequireAuth(value);
          break;
        case 'biometricEnabled':
          setBiometricEnabled(value);
          break;
      }
    } catch (err) {
      console.error('Failed to update security preference:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await userService.updateProfileImage(formData);
      if (response.data.success) {
        const imageUrl = response.data.data.profileImage;
        setProfileImage(imageUrl);
        // Update user context with new image
        if (currentUser) {
          updateUser({ ...currentUser, profileImage: imageUrl });
        }
      }
    } catch (error) {
      console.error('Failed to upload profile image:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account preferences</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden mb-6">
        {/* Profile Section */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <FaUserCircle className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              <label 
                htmlFor="profileImage" 
                className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
              >
                <FaCamera className="h-4 w-4" />
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  title="Upload profile picture"
                />
              </label>
            </div>

            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentUser?.firstName} {currentUser?.lastName}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
              </div>

              {!isEditingProfile ? (
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="btn bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        value={profileData.state}
                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        value={profileData.country}
                        onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="btn bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md transition-colors"
                      disabled={profileLoading}
                    >
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileData({
                          firstName: currentUser?.firstName || '',
                          lastName: currentUser?.lastName || '',
                          email: currentUser?.email || '',
                          phone: currentUser?.phone || '',
                          address: currentUser?.address || '',
                          city: currentUser?.city || '',
                          state: currentUser?.state || '',
                          country: currentUser?.country || ''
                        });
                      }}
                      className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {profileError && (
                    <p className="mt-2 text-sm text-red-600">{profileError}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Income Section */}
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4 flex items-center dark:text-white">
            <FaMoneyBillWave className="mr-2 text-primary-600 dark:text-primary-400" />
            Income Information
          </h3>
          
          {!isEditingIncome ? (
            <div>
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Income</h4>
                <p className="text-2xl font-bold text-primary-600">₦{monthlyIncome.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Employment Type</h4>
                  <p className="text-gray-800 dark:text-gray-200">{employmentType || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Occupation</h4>
                  <p className="text-gray-800 dark:text-gray-200">{occupation || 'Not specified'}</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditingIncome(true)}
                className="btn bg-primary-600 text-white hover:bg-primary-700"
              >
                Update Income Information
              </button>
            </div>
          ) : (
            <form onSubmit={handleIncomeSubmit} className="space-y-4">
              <div>
                <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Income (₦)
                </label>
                <input
                  type="number"
                  id="monthlyIncome"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employment Type
                </label>
                <select
                  id="employmentType"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select employment type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  id="occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  placeholder="e.g., Software Engineer, Teacher, etc."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="btn bg-primary-600 text-white hover:bg-primary-700"
                  disabled={incomeLoading}
                >
                  {incomeLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingIncome(false);
                    if (incomeData) {
                      setMonthlyIncome(incomeData.monthlyIncome);
                      setEmploymentType(incomeData.employmentType);
                      setOccupation(incomeData.occupation);
                    }
                  }}
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {incomeError && (
            <p className="mt-2 text-sm text-red-600">{incomeError}</p>
          )}
        </div>

        {/* Preferences Sections */}
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4 flex items-center dark:text-white">
            <FaMoneyBillWave className="mr-2 text-primary-600 dark:text-primary-400" />
            Currency & Language
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Currency
              </label>
              <select
                id="currency"
                className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Language
              </label>
              <select
                id="language"
                className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4 flex items-center dark:text-white">
            <FaBell className="mr-2 text-primary-600 dark:text-primary-400" />
            Notifications
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive alerts about your finances</p>
              </div>
              <button 
                onClick={() => handleNotificationToggle('notificationsEnabled', !notificationsEnabled)} 
                className="text-2xl text-primary-600 dark:text-primary-400"
              >
                {notificationsEnabled ? <FaToggleOn /> : <FaToggleOff className="text-gray-400" />}
              </button>
            </div>
            
            {notificationsEnabled && (
              <>
                <div className="flex items-center justify-between pl-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Bill Reminders</p>
                  <button 
                    onClick={() => handleNotificationToggle('billReminders', !billReminders)} 
                    className="text-2xl text-primary-600 dark:text-primary-400"
                  >
                    {billReminders ? <FaToggleOn /> : <FaToggleOff className="text-gray-400" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between pl-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Budget Alerts</p>
                  <button 
                    onClick={() => handleNotificationToggle('budgetAlerts', !budgetAlerts)} 
                    className="text-2xl text-primary-600 dark:text-primary-400"
                  >
                    {budgetAlerts ? <FaToggleOn /> : <FaToggleOff className="text-gray-400" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between pl-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Savings Goal Updates</p>
                  <button 
                    onClick={() => handleNotificationToggle('savingsGoalUpdates', !savingsGoalUpdates)} 
                    className="text-2xl text-primary-600 dark:text-primary-400"
                  >
                    {savingsGoalUpdates ? <FaToggleOn /> : <FaToggleOff className="text-gray-400" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4 flex items-center dark:text-white">
            <FaLock className="mr-2 text-primary-600 dark:text-primary-400" />
            Security
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Authentication</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Lock app after each session</p>
              </div>
              <button 
                onClick={() => handleSecurityToggle('requireAuth', !requireAuth)} 
                className="text-2xl text-primary-600 dark:text-primary-400"
              >
                {requireAuth ? <FaToggleOn /> : <FaToggleOff className="text-gray-400" />}
              </button>
            </div>
            
            {requireAuth && (
              <div className="flex items-center justify-between pl-4">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Enable Biometric Authentication</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Use fingerprint or face ID</p>
                </div>
                <button 
                  onClick={() => handleSecurityToggle('biometricEnabled', !biometricEnabled)} 
                  className="text-2xl text-primary-600 dark:text-primary-400"
                >
                  {biometricEnabled ? <FaToggleOn /> : <FaToggleOff className="text-gray-400" />}
                </button>
              </div>
            )}
            
            <button className="btn bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm mt-2">
              Change Password
            </button>
          </div>
        </div>

        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Theme</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
            </div>
            <div className="flex space-x-2">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => handleThemeChange(themeOption.value)}
                  className={`
                    p-3 rounded-md border text-sm font-medium
                    ${theme === themeOption.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    }
                    hover:bg-primary/10 dark:hover:bg-primary/20
                    transition-colors duration-200
                  `}
                >
                  {themeOption.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium mb-4 dark:text-white">About</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">App Version:</span> 1.0.0
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Terms of Service:</span>{' '}
              <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">View</a>
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Privacy Policy:</span>{' '}
              <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">View</a>
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center text-red-600 dark:text-red-400 text-sm font-medium"
          >
            <FaSignOutAlt className="mr-1" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;