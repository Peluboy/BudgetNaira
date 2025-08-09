import { Request, Response, NextFunction } from 'express';
import SavingsGroup from '../models/SavingsGroup';
import User from '../models/User';
import mongoose from 'mongoose';
import Notification from '../models/Notification';

// Helper: create notification (to be implemented)
const createNotification = async (userId: string, message: string) => {
  try {
    await Notification.create({ user: userId, message });
  } catch (err) {
    // Optionally log error
  }
};

// Create a new savings group
export const createGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { groupName, totalCycles, fixedAmount, adminSlot } = req.body;
    const user = (req as any).user;
    const admin = user._id;
    // Admin picks their slot (1-based)
    const members = [{ user: admin, joinDate: new Date(), status: 'active', slot: adminSlot }];
    // Generate payout schedule
    const payoutSchedule = [{ member: admin, amount: fixedAmount * totalCycles, slot: adminSlot, paid: false, date: new Date(0) }];
    const group = await SavingsGroup.create({
      groupName,
      admin,
      members,
      payoutSchedule,
      totalCycles,
      fixedAmount,
    });
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
};

// Join a group (by groupId param, query, or body)
export const joinGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const groupId = req.params.groupId || req.query.groupId || req.body.groupId;
    const { slot } = req.body;
    const userId = (req as any).user._id;
    const group = await SavingsGroup.findById(groupId);
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    if (group.members.some((m: any) => m.user.equals(userId))) {
      res.status(400).json({ message: 'Already a member' });
      return;
    }
    if (group.members.some((m: any) => m.slot === slot)) {
      res.status(400).json({ message: 'Slot already taken' });
      return;
    }
    group.members.push({ user: userId, joinDate: new Date(), status: 'active', slot });
    group.payoutSchedule.push({ member: userId, amount: group.fixedAmount * group.totalCycles, slot, paid: false, date: new Date(0) });
    await group.save();
    await createNotification(group.admin.toString(), `A new member joined your group: ${userId}`);
    res.json(group);
  } catch (err) {
    next(err);
  }
};

// Get group details (with invite link and unpaid users)
export const getGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { groupId } = req.params;
    const group = await SavingsGroup.findById(groupId).populate('admin').populate('members.user').populate('contributions.member').populate('payoutSchedule.member');
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    // Track unpaid users for current cycle
    const paidUserIds = group.contributions.filter((c: any) => c.cycle === group.currentCycle).map((c: any) => c.member._id?.toString() || c.member.toString());
    const unpaidMembers = group.members.filter((m: any) => !paidUserIds.includes(m.user._id?.toString() || m.user.toString()));
    // Add invite link (frontend should use /community-savings?join=groupId)
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/community-savings?join=${group._id}`;
    res.json({ ...group.toObject(), inviteLink, unpaidMembers });
  } catch (err) {
    next(err);
  }
};

// Contribute to group
export const contribute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { amount } = req.body;
    const userId = (req as any).user._id;
    const group = await SavingsGroup.findById(groupId);
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    if (!group.members.some((m: any) => m.user.equals(userId))) {
      res.status(403).json({ message: 'Not a group member' });
      return;
    }
    const cycle = group.currentCycle;
    group.contributions.push({ member: userId, amount, date: new Date(), cycle });
    await group.save();
    // Notify admin and user
    await createNotification(group.admin.toString(), `Member contributed ₦${amount} in group ${group.groupName}`);
    await createNotification(userId, `You contributed ₦${amount} to group ${group.groupName}`);
    res.json({ message: 'Contribution recorded', group });
  } catch (err) {
    next(err);
  }
};

// Mark payout as completed (admin only)
export const markPayout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { memberId, cycle } = req.body;
    const userId = (req as any).user._id;
    const group = await SavingsGroup.findById(groupId);
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    if (!group.admin.equals(userId)) {
      res.status(403).json({ message: 'Only admin can mark payout' });
      return;
    }
    const payout = group.payoutSchedule.find((p: any) => p.member.equals(memberId) && p.cycle === cycle);
    if (!payout) {
      res.status(404).json({ message: 'Payout not found' });
      return;
    }
    payout.paid = true;
    payout.date = new Date();
    await group.save();
    await createNotification(memberId.toString(), `You received a payout in group ${group.groupName} for cycle ${cycle}`);
    res.json({ message: 'Payout marked as completed', group });
  } catch (err) {
    next(err);
  }
};

// Get all groups for a user
export const getUserGroups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const groups = await SavingsGroup.find({ 'members.user': userId });
    res.json(groups);
  } catch (err) {
    next(err);
  }
};
