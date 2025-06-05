import mongoose from 'mongoose';

export interface IFinancialEvent extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  amount?: number;
  date: Date;
  type: 'bill' | 'payment' | 'payday' | 'goal_review' | 'tax' | 'custom';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminderDays: number; // days before to send reminder
  isCompleted: boolean;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  description: {
    type: String
  },
  amount: {
    type: Number
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  type: {
    type: String,
    enum: ['bill', 'payment', 'payday', 'goal_review', 'tax', 'custom'],
    required: [true, 'Please specify event type']
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'once'
  },
  reminderDays: {
    type: Number,
    default: 3
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  category: {
    type: String
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

export default mongoose.model<IFinancialEvent>('FinancialEvent', FinancialEventSchema); 