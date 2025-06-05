import mongoose from 'mongoose';

export interface ICategory extends mongoose.Document {
  name: string;
  type: 'expense' | 'income' | 'savings';
  icon?: string;
  color?: string;
  isDefault: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  type: {
    type: String,
    enum: ['expense', 'income', 'savings'],
    required: [true, 'Please specify the category type']
  },
  icon: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: null
  },
  isDefault: {
    type: Boolean,
    default: false
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

export default mongoose.model<ICategory>('Category', CategorySchema);