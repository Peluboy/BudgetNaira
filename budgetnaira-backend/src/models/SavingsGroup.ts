import mongoose from 'mongoose';

export interface IGroupMember {
  user: mongoose.Types.ObjectId;
  joinDate: Date;
  status: 'active' | 'pending' | 'left';
  slot: number; // payout slot/month (1-based)
}

export interface IContribution {
  member: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  cycle: number;
}

export interface IPayout {
  member: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  slot: number; // payout slot/month (1-based)
  paid: boolean;
}

export interface ISavingsGroup extends mongoose.Document {
  groupName: string;
  admin: mongoose.Types.ObjectId;
  members: IGroupMember[];
  contributions: IContribution[];
  payoutSchedule: IPayout[];
  currentCycle: number;
  totalCycles: number;
  fixedAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const GroupMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'pending', 'left'], default: 'active' },
  slot: { type: Number, required: true },
});

const ContributionSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  cycle: { type: Number, required: true },
});

const PayoutSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date },
  slot: { type: Number, required: true },
  paid: { type: Boolean, default: false },
});

const SavingsGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true, trim: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: { type: [GroupMemberSchema], default: [] },
  contributions: { type: [ContributionSchema], default: [] },
  payoutSchedule: { type: [PayoutSchema], default: [] },
  currentCycle: { type: Number, default: 1 },
  totalCycles: { type: Number, required: true },
  fixedAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

SavingsGroupSchema.pre<ISavingsGroup>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ISavingsGroup>('SavingsGroup', SavingsGroupSchema);
