import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from '@react-icons/all-files/fa/FaArrowRight';
import { FaArrowLeft } from '@react-icons/all-files/fa/FaArrowLeft';
import { FaChartPie } from '@react-icons/all-files/fa/FaChartPie';
import { FaMoneyBillWave } from '@react-icons/all-files/fa/FaMoneyBillWave';
import { FaPiggyBank } from '@react-icons/all-files/fa/FaPiggyBank';


const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  // Sample form data
  const [formData, setFormData] = useState({
    name: '',
    monthlyIncome: '',
    currency: 'NGN',
    savingsGoal: '',
  });

  const totalSteps = 4;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding and navigate to dashboard
      navigate('/');
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const skipOnboarding = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-gray-100 h-2 w-full">
          <div 
            className="bg-primary-600 h-2 transition-all duration-300 ease-in-out" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
        
        <div className="p-6">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center">
              <div className="text-primary-600 mb-4">
                <img 
                  src="/logo.png" 
                  alt="BudgetNaira Logo" 
                  className="mx-auto h-24 mb-4"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to BudgetNaira</h2>
              <p className="text-gray-600 mb-8">Your personal finance solution tailored for Nigerians</p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-md text-center border border-gray-200">
                  <FaMoneyBillWave className="mx-auto text-primary-600 text-xl mb-2" />
                  <p className="text-sm font-medium">Track Expenses</p>
                </div>
                <div className="p-4 rounded-md text-center border border-gray-200">
                  <FaChartPie className="mx-auto text-primary-600 text-xl mb-2" />
                  <p className="text-sm font-medium">Budget Wisely</p>
                </div>
                <div className="p-4 rounded-md text-center border border-gray-200">
                  <FaPiggyBank className="mx-auto text-primary-600 text-xl mb-2" />
                  <p className="text-sm font-medium">Save More</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Let's set up your account in a few simple steps
              </p>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Information</h2>
              <p className="text-gray-600 mb-6">
                Let's personalize your experience
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="input"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    className="input"
                    value={formData.currency}
                    onChange={handleInputChange}
                  >
                    <option value="NGN">Nigerian Naira (₦)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Income */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Income</h2>
              <p className="text-gray-600 mb-6">
                This helps us create personalized budgets for you
              </p>
              
              <div>
                <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income (₦)
                </label>
                <input
                  id="monthlyIncome"
                  name="monthlyIncome"
                  type="number"
                  className="input"
                  placeholder="0.00"
                  value={formData.monthlyIncome}
                  onChange={handleInputChange}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Don't worry, this information is confidential and stored only on your device
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Goals */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Financial Goals</h2>
              <p className="text-gray-600 mb-6">
                Set a monthly savings goal to get started
              </p>
              
              <div>
                <label htmlFor="savingsGoal" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Savings Goal (₦)
                </label>
                <input
                  id="savingsGoal"
                  name="savingsGoal"
                  type="number"
                  className="input"
                  placeholder="0.00"
                  value={formData.savingsGoal}
                  onChange={handleInputChange}
                />
                
                {formData.monthlyIncome && formData.savingsGoal && (
                  <p className="mt-2 text-xs text-green-600">
                    That's {Math.round((Number(formData.savingsGoal) / Number(formData.monthlyIncome)) * 100)}% of your monthly income!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="btn bg-white border border-gray-300 text-gray-700 flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Back
              </button>
            ) : (
              <button
                onClick={skipOnboarding}
                className="btn bg-white border border-gray-300 text-gray-700"
              >
                Skip
              </button>
            )}
            
            <button
              onClick={nextStep}
              className="btn btn-primary flex items-center"
            >
              {step === totalSteps ? 'Get Started' : 'Next'} <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;