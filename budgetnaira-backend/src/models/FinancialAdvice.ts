import mongoose from 'mongoose';

export interface IFinancialAdvice extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: 'savings' | 'debt' | 'investment' | 'budgeting' | 'emergency_fund' | 'general';
  title: string;
  summary: string;
  recommendations: {
    title: string;
    description: string;
    actionItems: string[];
    priorityLevel: 'high' | 'medium' | 'low';
  }[];
  dataPoints: {
    name: string;
    value: string;
    insight: string;
  }[];
  generatedAt: Date;
  expiresAt: Date;
  isRead: boolean;
  aiVersion: string;
  feedbackRating?: number;
  feedbackComment?: string;
}

const FinancialAdviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['savings', 'debt', 'investment', 'budgeting', 'emergency_fund', 'general'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Advice must have a title']
  },
  summary: {
    type: String,
    required: [true, 'Advice must have a summary']
  },
  recommendations: [
    {
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      actionItems: [String],
      priorityLevel: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      }
    }
  ],
  dataPoints: [
    {
      name: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      },
      insight: {
        type: String,
        required: true
      }
    }
  ],
  generatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Advice expires after 30 days by default
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  aiVersion: {
    type: String,
    required: true
  },
  feedbackRating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedbackComment: {
    type: String
  }
});

export default mongoose.model<IFinancialAdvice>('FinancialAdvice', FinancialAdviceSchema);