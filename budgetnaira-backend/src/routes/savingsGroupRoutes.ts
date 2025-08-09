import express from 'express';
import {
  createGroup,
  joinGroup,
  getGroup,
  contribute,
  getUserGroups,
  markPayout
} from '../controllers/savingsGroupController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, createGroup);
router.post('/:groupId/join', protect, joinGroup);
router.get('/:groupId', protect, getGroup);
router.post('/:groupId/contribute', protect, contribute);
router.post('/:groupId/payout', protect, markPayout);
router.get('/', protect, getUserGroups);

export default router;
