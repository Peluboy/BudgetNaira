import express from 'express';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  splitExpense,
  settleSplitExpense,
  getExpenseOverview,
  getExpensesByDateRange
} from '../controllers/expenseController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

// Stats and overview routes
router.get('/stats', getExpenseStats);
router.get('/overview', getExpenseOverview);
router.get('/range', getExpensesByDateRange);

// Standard routes
router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

router.route('/:id/split')
  .post(splitExpense);

router.route('/:id/settle/:participantId')
  .put(settleSplitExpense);

export default router;