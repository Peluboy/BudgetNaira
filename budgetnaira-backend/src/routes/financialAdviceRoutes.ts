import express from 'express';
import {
  getFinancialAdvice,
  getSingleAdvice,
  createFinancialAdvice,
  provideAdviceFeedback,
  deleteAdvice,
  getFinancialDashboard
} from '../controllers/financialAdviceController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

// Dashboard route
router.get('/dashboard', getFinancialDashboard);

// Advice routes
router.route('/')
  .get(getFinancialAdvice)
  .post(createFinancialAdvice);

router.route('/:id')
  .get(getSingleAdvice)
  .delete(deleteAdvice);

router.route('/:id/feedback')
  .post(provideAdviceFeedback);

export default router;