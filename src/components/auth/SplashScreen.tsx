import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Add animation class after component mounts
    setTimeout(() => {
      setAnimate(true);
    }, 100);
    
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    // Redirect after splash animation
    const redirectTimer = setTimeout(() => {
      if (!hasCompletedOnboarding) {
        navigate('/onboarding');
      } else if (!isAuthenticated) {
        navigate('/login');
      } else {
        navigate('/');
      }
    }, 2500);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-primary-600">
      <div className={`transition-all duration-1000 ${
        animate ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-90'
      }`}>
        <img 
          src="/logo-white.png" 
          alt="BudgetNaira Logo" 
          className="h-32 mb-8"
        />
        <h1 className="text-4xl font-bold text-white text-center">BudgetNaira</h1>
        <p className="text-primary-100 text-center mt-2">Your personal finance companion</p>
      </div>
      
      <div className="mt-12">
        <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
};

export default SplashScreen;