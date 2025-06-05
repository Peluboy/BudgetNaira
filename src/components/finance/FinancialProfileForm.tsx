import React, { useEffect } from 'react';
import { useForm, FieldError } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  FaBriefcase, 
  FaMoneyBillWave, 
  FaMapMarkerAlt,
  FaHome,
  FaUniversity,
  FaChartLine,
  FaPiggyBank
} from 'react-icons/fa';
import { FinancialProfileFormValues, goalTypes, nigerianStates, Props, schema } from './data';

const FinancialProfileForm: React.FC<Props> = ({ onSubmit, initialData = null }) => {
const {
  register,
  handleSubmit,
  watch,
  formState: { errors },
  reset,
  setValue,
} = useForm<FinancialProfileFormValues>({
  resolver: yupResolver(schema) as any,
  defaultValues: {
    occupation: '',
    employmentType: 'full-time',
    monthlyIncome: 0,
    monthlyExpenses: 0,
    dependents: 0,
    maritalStatus: 'single',
    location: '',
    state: '',
    hasSavings: false,
    savingsAmount: undefined,
    hasInvestments: false,
    investmentAmount: undefined,
    ownsProperty: false,
    propertyValue: undefined,
    hasDebt: false,
    totalDebtAmount: undefined,
    monthlyDebtPayments: undefined,
    financialGoals: [],
    riskTolerance: 'moderate',
    investmentExperience: 'beginner',
    savingsRate: 10,
    retirementAgeTarget: 65,
    ...initialData
  } 
});

  // Watch values for conditional fields
  const hasSavings = watch('hasSavings');
  const financialGoals = watch('financialGoals') || [];

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const addGoal = () => {
    setValue('financialGoals', [
      ...financialGoals,
      { type: '', targetAmount: 0, timeframe: 5 }
    ]);
  };

  const removeGoal = (index: number) => {
    const newGoals = [...financialGoals];
    newGoals.splice(index, 1);
    setValue('financialGoals', newGoals);
  };

  const updateGoal = (index: number, field: string, value: any) => {
    const newGoals = [...financialGoals];
    newGoals[index] = { ...newGoals[index], [field]: value };
    setValue('financialGoals', newGoals);
  };

  const handleFormSubmit = (values: FinancialProfileFormValues) => {
    console.log('Submitted values:', values);
    try {
      onSubmit(values);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };
  useEffect(() => {
    console.log('Current form values:', watch());
  }, [watch()]);
  console.log('Form errors:', errors);
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8" aria-label="Financial profile form">
      {/* Section 1: Basic Information */}
      <div className="bg-white p-6 rounded-lg ">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Occupation */}
          <div>
            <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaBriefcase className="text-gray-400" />
              </div>
              <input
                id="occupation"
                type="text"
                className={`pl-10 input ${errors.occupation ? 'border-red-500' : ''}`}
                placeholder="e.g., Software Engineer"
                // aria-invalid={errors.occupation ? "true" : "false"}
                {...register('occupation')}
              />
            </div>
            {errors.occupation && (
              <p className="mt-1 text-sm text-red-600">{(errors.occupation as FieldError).message}</p>
            )}
          </div>
          
          {/* Employment Type */}
          <div>
            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
              Employment Type
            </label>
            <select
              id="employmentType"
              className={`input ${errors.employmentType ? 'border-red-500' : ''}`}
            //   aria-invalid={errors.employmentType ? "true" : "false"}
              {...register('employmentType')}
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="self-employed">Self-employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="student">Student</option>
              <option value="retired">Retired</option>
            </select>
            {errors.employmentType && (
              <p className="mt-1 text-sm text-red-600">{(errors.employmentType as FieldError).message}</p>
            )}
          </div>
          
          {/* Monthly Income */}
          <div>
            <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Income (₦)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMoneyBillWave className="text-gray-400" />
              </div>
              <input
                id="monthlyIncome"
                type="number"
                className={`pl-10 input ${errors.monthlyIncome ? 'border-red-500' : ''}`}
                placeholder="e.g., 250000"
                // aria-invalid={errors.monthlyIncome ? "true" : "false"}
                {...register('monthlyIncome')}
              />
            </div>
            {errors.monthlyIncome && (
              <p className="mt-1 text-sm text-red-600">{(errors.monthlyIncome as FieldError).message}</p>
            )}
          </div>
          
          {/* Monthly Expenses */}
          <div>
            <label htmlFor="monthlyExpenses" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Expenses (₦)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMoneyBillWave className="text-gray-400" />
              </div>
              <input
                id="monthlyExpenses"
                type="number"
                className={`pl-10 input ${errors.monthlyExpenses ? 'border-red-500' : ''}`}
                placeholder="e.g., 150000"
                // aria-invalid={errors.monthlyExpenses ? "true" : "false"}
                {...register('monthlyExpenses')}
              />
            </div>
            {errors.monthlyExpenses && (
              <p className="mt-1 text-sm text-red-600">{(errors.monthlyExpenses as FieldError).message}</p>
            )}
          </div>
          
          {/* Dependents */}
          <div>
            <label htmlFor="dependents" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Dependents
            </label>
            <input
              id="dependents"
              type="number"
              className={`input ${errors.dependents ? 'border-red-500' : ''}`}
              placeholder="e.g., 2"
              min="0"
              // aria-invalid={errors.dependents ? "true" : undefined}
              {...register('dependents')}
            />
            {errors.dependents && (
              <p className="mt-1 text-sm text-red-600">{(errors.dependents as FieldError).message}</p>
            )}
          </div>
          
          {/* Marital Status */}
          <div>
            <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Marital Status
            </label>
            <select
              id="maritalStatus"
              className={`input ${errors.maritalStatus ? 'border-red-500' : ''}`}
            //   aria-invalid={errors.maritalStatus ? "true" : "false"}
              {...register('maritalStatus')}
            >
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
            {errors.maritalStatus && (
              <p className="mt-1 text-sm text-red-600">{(errors.maritalStatus as FieldError).message}</p>
            )}
          </div>
          
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              City/Town
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="text-gray-400" />
              </div>
              <input
                id="location"
                type="text"
                className={`pl-10 input ${errors.location ? 'border-red-500' : ''}`}
                placeholder="e.g., Lagos"
                // aria-invalid={errors.location ? "true" : "false"}
                {...register('location')}
              />
            </div>
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{(errors.location as FieldError).message}</p>
            )}
          </div>
          
          {/* State */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              id="state"
              className={`input ${errors.state ? 'border-red-500' : ''}`}
            //   aria-invalid={errors.state ? "true" : "false"}
              {...register('state')}
            >
              <option value="">Select State</option>
              {nigerianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{(errors.state as FieldError).message}</p>
            )}
          </div>
        </div>
      </div>

{/* Section 2: Assets */}
<div className="bg-white pl-6 rounded-lg ">
  <h2 className="text-lg font-medium text-gray-900 mb-4">Assets</h2>

  {/* Savings */}
  <div className="mb-6">
    <label className="text-sm font-medium text-gray-700 block mb-1">
      Do you have savings?
    </label>
    <div className="flex items-center gap-4 mb-2">
      <label className="flex items-center gap-1">
        <input
          type="radio"
          value="true"
          checked={hasSavings === true}
      onChange={() => setValue('hasSavings', true)}
        />
        Yes
      </label>
      <label className="flex items-center gap-1">
        <input
          type="radio"
          value="false"
          checked={hasSavings === false}
      onChange={() => setValue('hasSavings', false)}
        />
        No
      </label>
    </div>
    {hasSavings && (
      <div className="ml-4">
        <label htmlFor="savingsAmount" className="block text-sm font-medium text-gray-700 mb-1">
          Savings Amount (₦)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaPiggyBank className="text-gray-400" />
          </div>
          <input
            id="savingsAmount"
            type="number"
            className={`pl-10 input ${errors.savingsAmount ? 'border-red-500' : ''}`}
            placeholder="e.g., 500000"
            {...register('savingsAmount')}
          />
        </div>
        {errors.savingsAmount && (
          <p className="mt-1 text-sm text-red-600">{errors.savingsAmount.message}</p>
        )}
      </div>
    )}
  </div>

  {/* Investments */}
  <div className="mb-6">
    <label className="text-sm font-medium text-gray-700 block mb-1">
      Do you have investments?
    </label>
    <div className="flex items-center gap-4 mb-2">
    <label className="flex items-center gap-1">
        <input
          type="radio"
          checked={watch('hasInvestments') === true}
          onChange={() => setValue('hasInvestments', true)}
        />
        Yes
      </label>
      <label className="flex items-center gap-1">
        <input
          type="radio"
          checked={watch('hasInvestments') === false}
          onChange={() => setValue('hasInvestments', false)}
        />
        No
      </label>
    </div>
    {watch('hasInvestments') === true && (
      <div className="ml-4">
        <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700 mb-1">
          Investment Amount (₦)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaChartLine className="text-gray-400" />
          </div>
          <input
            id="investmentAmount"
            type="number"
            className={`pl-10 input ${errors.investmentAmount ? 'border-red-500' : ''}`}
            placeholder="e.g., 1000000"
            {...register('investmentAmount')}
          />
        </div>
        {errors.investmentAmount && (
          <p className="mt-1 text-sm text-red-600">{errors.investmentAmount.message}</p>
        )}
      </div>
    )}
  </div>

  {/* Property */}
  <div className="mb-6">
    <label className="text-sm font-medium text-gray-700 block mb-1">
      Do you own property?
    </label>
    <div className="flex items-center gap-4 mb-2">
      <label className="flex items-center gap-1">
        <input
          type="radio"
          checked={watch('ownsProperty') === true}
          onChange={() => setValue('ownsProperty', true)}
        />
        Yes
      </label>
      <label className="flex items-center gap-1">
        <input
          type="radio"
          checked={watch('ownsProperty') === false}
          onChange={() => setValue('ownsProperty', false)}
        />
        No
      </label>
    </div>
    {watch('ownsProperty') && (
      <div className="ml-4">
        <label htmlFor="propertyValue" className="block text-sm font-medium text-gray-700 mb-1">
          Property Value (₦)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaHome className="text-gray-400" />
          </div>
          <input
            id="propertyValue"
            type="number"
            className={`pl-10 input ${errors.propertyValue ? 'border-red-500' : ''}`}
            placeholder="e.g., 5000000"
            {...register('propertyValue')}
          />
        </div>
        {errors.propertyValue && (
          <p className="mt-1 text-sm text-red-600">{errors.propertyValue.message}</p>
        )}
      </div>
    )}
  </div>
</div>

{/* Section 3: Debts */}
<div className="bg-white pl-6 rounded-lg ">
  <h2 className="text-lg font-medium text-gray-900 mb-4">Debts</h2>

  <label className="text-sm font-medium text-gray-700 block mb-1">
    Do you have any debts?
  </label>
  <div className="flex items-center gap-4 mb-4">
    <label className="flex items-center gap-1">
      <input
        type="radio"
        checked={watch('hasDebt') === true}
        onChange={() => setValue('hasDebt', true)}
      />
      Yes
    </label>
    <label className="flex items-center gap-1">
      <input
        type="radio"
        checked={watch('hasDebt') === false}
        onChange={() => setValue('hasDebt', false)}
      />
      No
    </label>
  </div>

  {watch('hasDebt') && (
    <div className="space-y-4 ml-4">
      <div>
        <label htmlFor="totalDebtAmount" className="block text-sm font-medium text-gray-700 mb-1">
          Total Debt Amount (₦)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUniversity className="text-gray-400" />
          </div>
          <input
            id="totalDebtAmount"
            type="number"
            className={`pl-10 input ${errors.totalDebtAmount ? 'border-red-500' : ''}`}
            placeholder="e.g., 2000000"
            {...register('totalDebtAmount')}
          />
        </div>
        {errors.totalDebtAmount && (
          <p className="mt-1 text-sm text-red-600">{errors.totalDebtAmount.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="monthlyDebtPayments" className="block text-sm font-medium text-gray-700 mb-1">
          Monthly Debt Payments (₦)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaMoneyBillWave className="text-gray-400" />
          </div>
          <input
            id="monthlyDebtPayments"
            type="number"
            className={`pl-10 input ${errors.monthlyDebtPayments ? 'border-red-500' : ''}`}
            placeholder="e.g., 50000"
            {...register('monthlyDebtPayments')}
          />
        </div>
        {errors.monthlyDebtPayments && (
          <p className="mt-1 text-sm text-red-600">{errors.monthlyDebtPayments.message}</p>
        )}
      </div>
    </div>
  )}
</div>

      {/* Section 4: Financial Goals */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Financial Goals</h2>
        
        {financialGoals.map((goal, index) => (
          <div key={index} className="mb-6 p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Goal #{index + 1}</h3>
              <button
                type="button"
                onClick={() => removeGoal(index)}
                className="text-red-600 text-sm"
                aria-label={`Remove goal ${index + 1}`}
              >
                Remove
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor={`goalType-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Type
                </label>
                <select
                  id={`goalType-${index}`}
                  className={`input ${errors.financialGoals?.[index]?.type ? 'border-red-500' : ''}`}
                  value={goal.type}
                  onChange={(e) => updateGoal(index, 'type', e.target.value)}
                  // aria-invalid={errors.financialGoals?.[index]?.type ? "true" : undefined}
                >
                  <option value="">Select Goal Type</option>
                  {goalTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.financialGoals?.[index]?.type && (
                  <p className="mt-1 text-sm text-red-600">
                    {(errors.financialGoals[index]?.type as FieldError)?.message}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor={`targetAmount-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount (₦)
                </label>
                <input
                  id={`targetAmount-${index}`}
                  type="number"
                  className={`input ${errors.financialGoals?.[index]?.targetAmount ? 'border-red-500' : ''}`}
                  value={goal.targetAmount}
                  onChange={(e) => updateGoal(index, 'targetAmount', Number(e.target.value))}
                  min="0"
                  // aria-invalid={errors.financialGoals?.[index]?.targetAmount ? "true" : "false"}
                />
                {errors.financialGoals?.[index]?.targetAmount && (
                  <p className="mt-1 text-sm text-red-600">
                    {(errors.financialGoals[index]?.targetAmount as FieldError)?.message}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor={`timeframe-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Timeframe (years)
                </label>
                <input
                  id={`timeframe-${index}`}
                  type="number"
                  className={`input ${errors.financialGoals?.[index]?.timeframe ? 'border-red-500' : ''}`}
                  value={goal.timeframe}
                  onChange={(e) => updateGoal(index, 'timeframe', Number(e.target.value))}
                  min="1"
                //   aria-invalid={errors.financialGoals?.[index]?.timeframe ? "true" : "false"}
                />
                {errors.financialGoals?.[index]?.timeframe && (
                  <p className="mt-1 text-sm text-red-600">
                    {(errors.financialGoals[index]?.timeframe as FieldError)?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addGoal}
          className="mt-2 text-primary-600 hover:text-primary-800 text-sm font-medium"
          aria-label="Add another goal"
        >
          + Add Another Goal
        </button>
      </div>
      {/* Section 5: Financial Preferences */}
      <div className="bg-white pl-6 rounded-lg ">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Financial Preferences</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Tolerance */}
          <div>
            <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700 mb-1">
              Risk Tolerance
            </label>
            <select
              id="riskTolerance"
              className={`input ${errors.riskTolerance ? 'border-red-500' : ''}`}
            //   aria-invalid={errors.riskTolerance ? "true" : "false"}
              {...register('riskTolerance')}
            >
              <option value="conservative">Conservative (Low Risk)</option>
              <option value="moderate">Moderate (Medium Risk)</option>
              <option value="aggressive">Aggressive (High Risk)</option>
            </select>
            {errors.riskTolerance && (
              <p className="mt-1 text-sm text-red-600">{(errors.riskTolerance as FieldError).message}</p>
            )}
          </div>
          
          {/* Investment Experience */}
          <div>
            <label htmlFor="investmentExperience" className="block text-sm font-medium text-gray-700 mb-1">
              Investment Experience
            </label>
            <select
              id="investmentExperience"
              className={`input ${errors.investmentExperience ? 'border-red-500' : ''}`}
            //   aria-invalid={errors.investmentExperience ? "true" : "false"}
              {...register('investmentExperience')}
            >
              <option value="none">None</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            {errors.investmentExperience && (
              <p className="mt-1 text-sm text-red-600">{(errors.investmentExperience as FieldError).message}</p>
            )}
          </div>
          
          {/* Savings Rate */}
          <div>
            <label htmlFor="savingsRate" className="block text-sm font-medium text-gray-700 mb-1">
              Current Savings Rate (% of monthly income)
            </label>
            <input
              id="savingsRate"
              type="number"
              className={`input ${errors.savingsRate ? 'border-red-500' : ''}`}
              placeholder="e.g., 15"
              min="0"
              max="100"
            //   aria-invalid={errors.savingsRate ? "true" : "false"}
              {...register('savingsRate')}
            />
            {errors.savingsRate && (
              <p className="mt-1 text-sm text-red-600">{(errors.savingsRate as FieldError).message}</p>
            )}
          </div>
          
          {/* Retirement Age Target */}
          <div>
            <label htmlFor="retirementAgeTarget" className="block text-sm font-medium text-gray-700 mb-1">
              Target Retirement Age
            </label>
            <input
              id="retirementAgeTarget"
              type="number"
              className={`input ${errors.retirementAgeTarget ? 'border-red-500' : ''}`}
              placeholder="e.g., 65"
              min="50"
              max="80"
            //   aria-invalid={errors.retirementAgeTarget ? "true" : "false"}
              {...register('retirementAgeTarget')}
            />
            {errors.retirementAgeTarget && (
              <p className="mt-1 text-sm text-red-600">{(errors.retirementAgeTarget as FieldError).message}</p>
            )}
          </div>
        </div>
      </div>
      {Object.keys(errors).length > 0 && (
  <div className="text-red-600 mb-4 p-4 bg-red-50 rounded-lg">
    <h3 className="font-medium">Please fix these errors:</h3>
    <ul className="list-disc pl-5 mt-2">
      {Object.entries(errors).map(([key, error]) => (
        <li key={key}>{error.message}</li>
      ))}
    </ul>
  </div>
)}

      {/* Submit Button */}
      <div className="pt-4">
        <button type="submit" className="w-full btn btn-primary py-3">
          {initialData ? 'Update Profile' : 'Create Profile'}
        </button>
      </div>
    </form>
  );
};

export default FinancialProfileForm;
