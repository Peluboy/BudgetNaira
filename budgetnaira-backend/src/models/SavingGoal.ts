import mongoose from 'mongoose';

export interface ISavingGoal extends mongoose.Document {
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate: Date;
  category: mongoose.Types.ObjectId;
  isCompleted: boolean;
  notes?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SavingGoalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a goal name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please add a target amount'],
    min: [0, 'Target amount must be a positive number']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount must be a positive number']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date'],
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: [true, 'Please add a target date']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please specify a category']
  },
  isCompleted: {
    type: Boolean,
    default: false
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
SavingGoalSchema.pre<ISavingGoal>('save', function(next) {
  this.updatedAt = new Date();
  
  // Check if goal is completed
  if (this.currentAmount >= this.targetAmount) {
    this.isCompleted = true;
  }
  
  next();
});

export default mongoose.model<ISavingGoal>('SavingGoal', SavingGoalSchema);