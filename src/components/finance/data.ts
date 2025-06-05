import { SubmitHandler } from "react-hook-form";
import * as yup from 'yup';

export const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
    'Yobe', 'Zamfara',
  ];

 export const goalTypes = [
    'Emergency Fund',
    'Retirement',
    'Education',
    'Home Purchase',
    'Vehicle Purchase',
    'Travel',
    'Investment',
    'Debt Repayment',
    'Business Startup',
    'Other'
  ];

  // Enhanced type with additional financial details
 export type FinancialProfileFormValues = {
    // Basic Info
    occupation: string;
    employmentType: string;
    monthlyIncome: number;
    monthlyExpenses: number;
    dependents: number;
    maritalStatus: string;
    location: string;
    state: string;
    
    // Assets
    hasSavings: boolean;
    savingsAmount: number;
    hasInvestments: boolean;
    investmentAmount: number;
    ownsProperty: boolean;
    propertyValue: number;
    
    // Debts
    hasDebt: boolean;
    totalDebtAmount: number;
    monthlyDebtPayments: number;
    
    // Financial Goals
    financialGoals: {
      type: string;
      targetAmount: number;
      timeframe: number; // in years
    }[];
    
    // Preferences
    riskTolerance: string;
    investmentExperience: string;
    savingsRate: number;
    retirementAgeTarget: number;
  };
  
 export type Props = {
    onSubmit: SubmitHandler<FinancialProfileFormValues>;
    initialData?: Partial<FinancialProfileFormValues> | null;
  };

  export const schema = yup.object().shape({
    // Basic Info
    occupation: yup.string().required('Occupation is required'),
    employmentType: yup.string().required('Employment type is required'),
    monthlyIncome: yup
      .number()
      .transform((value, originalValue) => originalValue === '' ? undefined : Number(originalValue))
      .typeError('Monthly income must be a number')
      .required('Monthly income is required')
      .positive('Income must be positive'),
    monthlyExpenses: yup
      .number()
      .transform((value, originalValue) => originalValue === '' ? undefined : Number(originalValue))
      .typeError('Monthly expenses must be a number')
      .required('Monthly expenses are required')
      .positive('Expenses must be positive'),
    dependents: yup
      .number()
      .transform((value, originalValue) => originalValue === '' ? undefined : Number(originalValue))
      .typeError('Number of dependents must be a number')
      .required('Number of dependents is required')
      .min(0, 'Cannot be negative'),
    maritalStatus: yup.string().required('Marital status is required'),
    location: yup.string().required('Location is required'),
    state: yup.string().required('State is required'),
  
    // Boolean Flags (fixed)
    hasSavings: yup.boolean().required().transform((value) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
      }),
    hasInvestments: yup
      .boolean()
      .transform((value, originalValue) => {
        if (originalValue === 'true' || originalValue === true) return true;
        if (originalValue === 'false' || originalValue === false) return false;
        return false;
      })
      .required(),
  
    ownsProperty: yup
      .boolean()
      .transform((value, originalValue) => {
        if (originalValue === 'true' || originalValue === true) return true;
        if (originalValue === 'false' || originalValue === false) return false;
        return false;
      })
      .required(),
  
    hasDebt: yup
      .boolean()
      .transform((value, originalValue) => {
        if (originalValue === 'true' || originalValue === true) return true;
        if (originalValue === 'false' || originalValue === false) return false;
        return false;
      })
      .required(),
  
    // Assets
    savingsAmount: yup.number()
      .transform((value, originalValue) => originalValue === '' ? undefined : Number(originalValue))
      .when('hasSavings', (hasSavings, schema) =>
        hasSavings
          ? schema.required('Savings amount is required').typeError('Must be a number')
          : schema.notRequired()
      ),
  
    propertyValue: yup.number()
      .transform((value, originalValue) => originalValue === '' ? null : Number(originalValue))
      .nullable()
      .when('ownsProperty', (ownsProperty, schema) =>
        ownsProperty
          ? schema.required('Property value is required').typeError('Must be a number')
          : schema.nullable()
      ),
  
    // Debts
    totalDebtAmount: yup.number()
      .transform((value, originalValue) => originalValue === '' ? null : Number(originalValue))
      .nullable()
      .when('hasDebt', (hasDebt, schema) =>
        hasDebt
          ? schema.required('Total debt amount is required')
              .min(0, 'Cannot be negative')
              .typeError('Must be a number')
          : schema.nullable()
      ),
  
    monthlyDebtPayments: yup.number()
      .transform((value, originalValue) => originalValue === '' ? null : Number(originalValue))
      .nullable()
      .when('hasDebt', (hasDebt, schema) =>
        hasDebt
          ? schema.required('Monthly debt payments are required')
              .min(0, 'Cannot be negative')
              .typeError('Must be a number')
          : schema.nullable()
      ),
  
    // Financial Goals
    financialGoals: yup.array().of(
      yup.object().shape({
        type: yup.string().required('Goal type is required'),
        targetAmount: yup.number()
          .transform((value, originalValue) => originalValue === '' ? undefined : Number(originalValue))
          .typeError('Target amount must be a number')
          .required('Target amount is required'),
        timeframe: yup.number()
          .transform((value, originalValue) => originalValue === '' ? undefined : Number(originalValue))
          .typeError('Timeframe must be a number')
          .required('Timeframe is required'),
      })
    ).required('At least one financial goal is required'),
  
    // Preferences
    riskTolerance: yup.string().required('Risk tolerance is required'),
    investmentExperience: yup.string().required('Investment experience is required'),
  
    savingsRate: yup.number()
      .transform((value, originalValue) => originalValue === '' ? undefined : Number(originalValue))
      .typeError('Savings rate must be a number')
      .required('Savings rate is required')
      .min(0, 'Cannot be negative')
      .max(100, 'Cannot exceed 100%'),
  
    retirementAgeTarget: yup.number()
      .transform((value, originalValue) => originalValue === '' ? undefined : Number(originalValue))
      .typeError('Retirement age must be a number')
      .required('Retirement age target is required')
      .min(50, 'Minimum 50 years')
      .max(80, 'Maximum 80 years'),
  });
  
// For frontend types (no mongoose dependency)
export interface FinancialProfileData {
    _id: string;
    userId: string;
    occupation: string;
    employmentType: string;
    monthlyIncome: number;
    dependents: number;
    location: string;
    state: string;
    financialGoals: FinancialGoal[];
    riskTolerance: string;
    debtStatus: DebtStatus;
    investmentExperience: string;
    savingsRate: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  
  export interface FinancialGoal {
    _id?: string;
    type: string;
    targetAmount: number;
    timeframe: number;
  }
  
  export interface DebtStatus {
    hasDebt: boolean;
    totalDebtAmount?: number;
    monthlyDebtPayments?: number;
    loans?: Loan[];
  }
  
  export interface Loan {
    _id?: string;
    name: string;
    amount: number;
    interestRate: number;
    term: number;
    monthlyPayment: number;
  }

  
 export interface DashboardData {
    financialHealthScore: number;
    income: number;
    expenses: number;
    debts: number;
    savings: number;
    investments: number;
    propertyValue: number;
    netWorth: number;
    debtToIncomeRatio: number;
    savingsRate: number;
    advice: string[];
    financialGoals: {
      type: string;
      targetAmount: number;
      timeframe: number;
      progress: number;
    }[];
  }
