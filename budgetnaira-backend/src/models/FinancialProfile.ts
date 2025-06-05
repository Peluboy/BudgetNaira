import mongoose from 'mongoose';

export interface IFinancialProfile extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  occupation: string;
  employmentType: 'full-time' | 'part-time' | 'self-employed' | 'unemployed' | 'student';
  monthlyIncome: number;
  dependents: number;
  location: string;
  state: string;
  financialGoals: {
    _id: mongoose.Types.ObjectId;
    type: 'retirement' | 'education' | 'property' | 'debt_freedom' | 'emergency_fund' | 'other';
    description: string;
    targetAmount: number;
    priority: 'high' | 'medium' | 'low';
  }[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  debtStatus: {
    hasDebt: boolean;
    totalDebtAmount: number;
    loans: {
        _id: mongoose.Types.ObjectId;
      type: string;
      amount: number;
      interestRate: number;
      monthlyPayment: number;
      remainingMonths: number;
    }[];
  };
  investmentExperience: 'none' | 'beginner' | 'intermediate' | 'advanced';
  savingsRate: number; // Percentage of income saved monthly
  createdAt: Date;
  updatedAt: Date;
}

const FinancialProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  occupation: {
    type: String,
    required: [true, 'Please provide your occupation']
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'self-employed', 'unemployed', 'student'],
    required: [true, 'Please select your employment type']
  },
  monthlyIncome: {
    type: Number,
    required: [true, 'Please provide your monthly income']
  },
  dependents: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    required: [true, 'Please provide your location']
  },
  state: {
    type: String,
    required: [true, 'Please provide your state']
  },
  financialGoals: [
    {
      type: {
        type: String,
        enum: ['retirement', 'education', 'property', 'debt_freedom', 'emergency_fund', 'other'],
        required: [true, 'Please specify goal type']
      },
      description: {
        type: String,
        required: [true, 'Please provide goal description']
      },
      targetAmount: {
        type: Number,
        required: [true, 'Please provide target amount']
      },
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      }
    }
  ],
  riskTolerance: {
    type: String,
    enum: ['conservative', 'moderate', 'aggressive'],
    default: 'moderate'
  },
  debtStatus: {
    hasDebt: {
      type: Boolean,
      default: false
    },
    totalDebtAmount: {
      type: Number,
      default: 0
    },
    loans: [
      {
        type: {
          type: String,
          required: [true, 'Please specify loan type']
        },
        amount: {
          type: Number,
          required: [true, 'Please provide loan amount']
        },
        interestRate: {
          type: Number,
          required: [true, 'Please provide interest rate']
        },
        monthlyPayment: {
          type: Number,
          required: [true, 'Please provide monthly payment']
        },
        remainingMonths: {
          type: Number,
          required: [true, 'Please provide remaining months']
        }
      }
    ]
  },
  investmentExperience: {
    type: String,
    enum: ['none', 'beginner', 'intermediate', 'advanced'],
    default: 'none'
  },
  savingsRate: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
FinancialProfileSchema.pre<IFinancialProfile>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IFinancialProfile>('FinancialProfile', FinancialProfileSchema);