import React, { useState, useEffect, useCallback } from 'react';
import { FaHome } from '@react-icons/all-files/fa/FaHome';
import { FaCar } from '@react-icons/all-files/fa/FaCar';
import { FaBolt } from '@react-icons/all-files/fa/FaBolt';
import { FaShieldAlt } from '@react-icons/all-files/fa/FaShieldAlt';
import { FaSchool } from '@react-icons/all-files/fa/FaSchool';
import { FaHospital } from '@react-icons/all-files/fa/FaHospital';
import { FaShoppingBasket } from '@react-icons/all-files/fa/FaShoppingBasket';
import { FaWifi } from '@react-icons/all-files/fa/FaWifi';
import { FaMobileAlt } from '@react-icons/all-files/fa/FaMobileAlt';
import { FaUserFriends } from '@react-icons/all-files/fa/FaUserFriends';
import { FaDownload } from '@react-icons/all-files/fa/FaDownload';
import { FaChartBar } from '@react-icons/all-files/fa/FaChartBar';
import { FaExchangeAlt } from '@react-icons/all-files/fa/FaExchangeAlt';
import { FaFilm } from '@react-icons/all-files/fa/FaFilm';
import { FaSpinner } from '@react-icons/all-files/fa/FaSpinner';
import { FaExclamationTriangle } from '@react-icons/all-files/fa/FaExclamationTriangle';
import { useAuth } from '../../hooks/useAuth';
import { calculatorService, CalculatorData, CityComparison } from '../../services/calculatorService';

interface CostCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: CostItem[];
  total: number;
}

interface CostItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isEssential: boolean;
}

const LifestyleCostCalculator: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CostCategory[]>([
    {
      id: 'housing',
      name: 'Housing & Utilities',
      icon: <FaHome className="text-blue-500" />,
      items: [
        {
          id: 'rent',
          name: 'Rent',
          description: 'Monthly rent or mortgage payment',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        },
        {
          id: 'generator',
          name: 'Generator Maintenance',
          description: 'Regular maintenance and repairs',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        },
        {
          id: 'security',
          name: 'Security',
          description: 'Security personnel or services',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        }
      ],
      total: 0
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: <FaCar className="text-green-500" />,
      items: [
        {
          id: 'fuel',
          name: 'Fuel',
          description: 'Vehicle fuel costs',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        },
        {
          id: 'maintenance',
          name: 'Vehicle Maintenance',
          description: 'Regular maintenance and repairs',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        },
        {
          id: 'alternative',
          name: 'Alternative Transport',
          description: 'Buses, taxis, or ride-hailing during fuel scarcity',
          amount: 0,
          frequency: 'monthly',
          isEssential: false
        }
      ],
      total: 0
    },
    {
      id: 'utilities',
      name: 'Utilities & Communication',
      icon: <FaBolt className="text-yellow-500" />,
      items: [
        {
          id: 'electricity',
          name: 'PHCN Bill',
          description: 'Monthly electricity bill',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        },
        {
          id: 'internet',
          name: 'Internet/Data',
          description: 'Monthly internet and data costs',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        },
        {
          id: 'airtime',
          name: 'Airtime',
          description: 'Monthly airtime for calls and SMS',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        }
      ],
      total: 0
    },
    {
      id: 'education',
      name: 'Education',
      icon: <FaSchool className="text-purple-500" />,
      items: [
        {
          id: 'school_fees',
          name: 'School Fees',
          description: 'Tuition and other school-related costs',
          amount: 0,
          frequency: 'yearly',
          isEssential: true
        },
        {
          id: 'books',
          name: 'Books & Supplies',
          description: 'Educational materials and supplies',
          amount: 0,
          frequency: 'yearly',
          isEssential: true
        },
        {
          id: 'transport',
          name: 'School Transport',
          description: 'Transportation to and from school',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        }
      ],
      total: 0
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: <FaHospital className="text-red-500" />,
      items: [
        {
          id: 'insurance',
          name: 'Health Insurance',
          description: 'Monthly health insurance premium',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        },
        {
          id: 'medications',
          name: 'Medications',
          description: 'Regular medications and supplements',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        },
        {
          id: 'emergency',
          name: 'Emergency Fund',
          description: 'Monthly contribution to healthcare emergency fund',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        }
      ],
      total: 0
    },
    {
      id: 'family',
      name: 'Family Support',
      icon: <FaUserFriends className="text-pink-500" />,
      items: [
        {
          id: 'parents',
          name: 'Parental Support',
          description: 'Monthly support for parents',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        },
        {
          id: 'siblings',
          name: 'Sibling Support',
          description: 'Support for siblings education or business',
          amount: 0,
          frequency: 'monthly',
          isEssential: false
        },
        {
          id: 'events',
          name: 'Family Events',
          description: 'Contributions to family events and ceremonies',
          amount: 0,
          frequency: 'yearly',
          isEssential: false
        }
      ],
      total: 0
    },
    {
      id: 'food',
      name: 'Food & Groceries',
      icon: <FaShoppingBasket className="text-orange-500" />,
      items: [
        {
          id: 'groceries',
          name: 'Groceries',
          description: 'Monthly food and household items',
          amount: 0,
          frequency: 'monthly',
          isEssential: true
        },
        {
          id: 'eating_out',
          name: 'Eating Out',
          description: 'Restaurants and takeout',
          amount: 0,
          frequency: 'monthly',
          isEssential: false
        },
        {
          id: 'special_meals',
          name: 'Special Meals',
          description: 'Celebrations and special occasions',
          amount: 0,
          frequency: 'monthly',
          isEssential: false
        }
      ],
      total: 0
    },
    {
      id: 'entertainment',
      name: 'Entertainment & Leisure',
      icon: <FaFilm className="text-purple-500" />,
      items: [
        {
          id: 'movies',
          name: 'Movies & Events',
          description: 'Cinema, concerts, and events',
          amount: 0,
          frequency: 'monthly',
          isEssential: false
        },
        {
          id: 'hobbies',
          name: 'Hobbies',
          description: 'Sports, arts, and other activities',
          amount: 0,
          frequency: 'monthly',
          isEssential: false
        },
        {
          id: 'subscriptions',
          name: 'Subscriptions',
          description: 'Streaming services and memberships',
          amount: 0,
          frequency: 'monthly',
          isEssential: false
        }
      ],
      total: 0
    }
  ]);

  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [yearlyTotal, setYearlyTotal] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState('lagos');
  const [income, setIncome] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [cityComparisons, setCityComparisons] = useState<CityComparison[]>([]);
  const [savedCalculations, setSavedCalculations] = useState<CalculatorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locations = [
    { id: 'lagos', name: 'Lagos' },
    { id: 'abuja', name: 'Abuja' },
    { id: 'port-harcourt', name: 'Port Harcourt' },
    { id: 'ibadan', name: 'Ibadan' },
    { id: 'kano', name: 'Kano' }
  ];

  const loadSavedCalculations = useCallback(async () => {
    if (user) {
      try {
        const calculations = await calculatorService.getCalculations(user.id);
        setSavedCalculations(calculations);
      } catch (err) {
        setError('Failed to load saved calculations');
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSavedCalculations();
    }
    const loadCityComparisons = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const comparisons = await calculatorService.getCityComparisons();
        setCityComparisons(comparisons);
      } catch (err) {
        setError('Failed to load city comparisons');
      } finally {
        setIsLoading(false);
      }
    };
    loadCityComparisons();
  }, [user, loadSavedCalculations]);

  const handleSave = async () => {
    if (user) {
      const calculationData: Omit<CalculatorData, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        location: selectedLocation,
        income,
        categories: categories.map(category => ({
          id: category.id,
          name: category.name,
          items: category.items.map(item => ({
            id: item.id,
            name: item.name,
            amount: item.amount,
            frequency: item.frequency
          }))
        }))
      };

      await calculatorService.saveCalculation(calculationData);
      await loadSavedCalculations();
    }
  };

  const handleExport = () => {
    if (user) {
      const calculationData: CalculatorData = {
        id: crypto.randomUUID(),
        userId: user.id,
        location: selectedLocation,
        income,
        categories: categories.map(category => ({
          id: category.id,
          name: category.name,
          items: category.items.map(item => ({
            id: item.id,
            name: item.name,
            amount: item.amount,
            frequency: item.frequency
          }))
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      calculatorService.exportToCSV(calculationData);
    }
  };

  const handleAmountChange = (categoryId: string, itemId: string, amount: number) => {
    setCategories(prevCategories => {
      return prevCategories.map(category => {
        if (category.id === categoryId) {
          const updatedItems = category.items.map(item => {
            if (item.id === itemId) {
              return { ...item, amount };
            }
            return item;
          });

          const total = updatedItems.reduce((sum, item) => {
            let monthlyAmount = item.amount;
            switch (item.frequency) {
              case 'daily':
                monthlyAmount *= 30;
                break;
              case 'weekly':
                monthlyAmount *= 4;
                break;
              case 'yearly':
                monthlyAmount /= 12;
                break;
            }
            return sum + monthlyAmount;
          }, 0);

          return { ...category, items: updatedItems, total };
        }
        return category;
      });
    });
  };

  useEffect(() => {
    const monthly = categories.reduce((sum, category) => sum + category.total, 0);
    setMonthlyTotal(monthly);
    setYearlyTotal(monthly * 12);
  }, [categories]);

  const getLocationMultiplier = (location: string) => {
    const multipliers = {
      'lagos': 1.2,
      'abuja': 1.3,
      'port-harcourt': 1.1,
      'ibadan': 0.9,
      'kano': 0.8
    };
    return multipliers[location as keyof typeof multipliers] || 1;
  };

  const getAffordabilityStatus = () => {
    const monthlyIncome = income;
    const monthlyExpenses = monthlyTotal * getLocationMultiplier(selectedLocation);
    const percentage = (monthlyExpenses / monthlyIncome) * 100;

    if (percentage <= 50) return { status: 'Good', color: 'text-green-500' };
    if (percentage <= 70) return { status: 'Moderate', color: 'text-yellow-500' };
    return { status: 'High', color: 'text-red-500' };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Nigerian Lifestyle Cost Calculator</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={!user || isLoading}
            >
              Save Calculation
            </button>
            <button
              onClick={handleExport}
              className="btn btn-secondary flex items-center"
              disabled={!user || isLoading}
            >
              <FaDownload className="mr-2" /> Export
            </button>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="btn btn-secondary flex items-center"
              disabled={isLoading}
            >
              <FaExchangeAlt className="mr-2" /> Compare Cities
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 rounded-lg">
            <div className="flex items-center text-red-800 dark:text-red-200">
              <FaExclamationTriangle className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <select
              id="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              aria-label="Select your location"
            >
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="income" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Income (₦)
            </label>
            <input
              id="income"
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter your monthly income"
              aria-label="Enter your monthly income in Naira"
            />
          </div>
        </div>

        {showComparison && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">City Cost Comparison</h3>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <FaSpinner className="animate-spin text-2xl text-blue-500" />
                <span className="ml-2">Loading city data...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cityComparisons.map(city => (
                  <div key={city.city} className="border rounded-lg p-4 dark:border-gray-700">
                    <h4 className="font-medium mb-2">{city.city}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Cost of Living Index</span>
                        <span className="font-medium">{city.costOfLiving.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Average Rent</span>
                        <span className="font-medium">₦{city.averageRent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Average Transport</span>
                        <span className="font-medium">₦{city.averageTransport.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Average Utilities</span>
                        <span className="font-medium">₦{city.averageUtilities.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          {categories.map(category => (
            <div key={category.id} className="border rounded-lg p-4 dark:border-gray-700">
              <div className="flex items-center mb-4">
                {category.icon}
                <h3 className="text-lg font-medium ml-2">{category.name}</h3>
              </div>
              
              <div className="space-y-4">
                {category.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.name}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleAmountChange(category.id, item.id, Number(e.target.value))}
                        className="w-32 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        placeholder="Amount"
                      />
                      <span className="text-xs text-gray-500 ml-2">
                        {item.frequency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Category Total (Monthly)</span>
                  <span className="font-bold">₦{category.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Total</h4>
              <p className="text-2xl font-bold">₦{monthlyTotal.toLocaleString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Yearly Total</h4>
              <p className="text-2xl font-bold">₦{yearlyTotal.toLocaleString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Affordability Status</h4>
              <p className={`text-2xl font-bold ${getAffordabilityStatus().color}`}>
                {getAffordabilityStatus().status}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location Adjustment</h4>
              <p className="text-2xl font-bold">
                {getLocationMultiplier(selectedLocation).toFixed(1)}x
              </p>
            </div>
          </div>
        </div>

        {savedCalculations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Saved Calculations</h3>
            <div className="space-y-4">
              {savedCalculations.map(calc => (
                <div key={calc.id} className="border rounded-lg p-4 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{calc.location}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(calc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₦{calc.income.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Monthly Income</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LifestyleCostCalculator; 