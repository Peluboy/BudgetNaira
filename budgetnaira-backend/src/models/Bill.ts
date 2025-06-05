// models/Bill.ts
import mongoose from 'mongoose';

export interface IBill extends mongoose.Document {
  title: string;
  totalAmount: number;
  createdBy: mongoose.Types.ObjectId;
  participants: {
    userId: mongoose.Types.ObjectId;
    amountOwed: number;
    amountPaid: number;
    hasPaid: boolean;
  }[];
  paymentMethod?: string;
  status: 'pending' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      amountOwed: {
        type: Number,
        required: true
      },
      amountPaid: {
        type: Number,
        default: 0
      },
      hasPaid: {
        type: Boolean,
        default: false
      }
    }
  ],
  paymentMethod: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
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

export default mongoose.model<IBill>('Bill', BillSchema);
