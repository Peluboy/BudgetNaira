import mongoose from 'mongoose';

export interface IParticipant {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  email?: string;
  phone?: string;
  settled: boolean;
  settledDate?: Date;
}

export interface IExpense extends mongoose.Document {
  amount: number;
  description: string;
  category: mongoose.Types.ObjectId;
  date: Date;
  paymentMethod: string;
  location?: string;
  isRecurring: boolean;
  recurringDetails?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: Date;
  };
  tags?: string[];
  attachmentUrl?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isSplit: boolean;
  participants: IParticipant[];
  accountDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  isFromBudget?: boolean;
  budgetId?: mongoose.Types.ObjectId;
  budgetName?: string;
}

const ParticipantSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  settled: {
    type: Boolean,
    default: false
  },
  settledDate: {
    type: Date
  },
});

const ExpenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    min: [0, 'Amount must be a positive number']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please specify a category']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
    default: Date.now
  },
  paymentMethod: {
    type: String,
    required: [true, 'Please specify a payment method']
  },
  location: {
    type: String
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    endDate: {
      type: Date
    }
  },
  tags: [String],
  attachmentUrl: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isSplit: {
    type: Boolean,
    default: false
  },
  participants: {
    type: [ParticipantSchema],
    default: []
  },
  accountDetails: {
    accountName: {
      type: String
    },
    accountNumber: {
      type: String
    },
    bankName: {
      type: String
    }
  },
  isFromBudget: {
    type: Boolean,
    default: false
  },
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget'
  },
  budgetName: {
    type: String
  }
});

// Update the updatedAt field on save
ExpenseSchema.pre<IExpense>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IExpense>('Expense', ExpenseSchema);