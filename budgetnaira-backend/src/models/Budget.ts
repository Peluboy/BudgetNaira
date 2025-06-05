import mongoose from 'mongoose';

export interface IBudget extends mongoose.Document {
  name: string;
  amount: number;
  category: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  recurringDetails?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  notes?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a budget name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please add a budget amount'],
    min: [0, 'Amount must be a positive number']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please specify a category']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
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
  }
});

// Update the updatedAt field on save
BudgetSchema.pre<IBudget>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IBudget>('Budget', BudgetSchema);