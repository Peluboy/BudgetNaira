import express from 'express';
import {
  getFinancialEvents,
  createFinancialEvent,
  updateFinancialEvent,
  deleteFinancialEvent
} from '../controllers/financialEvents';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getFinancialEvents)
  .post(createFinancialEvent);

router
  .route('/:id')
  .put(updateFinancialEvent)
  .delete(deleteFinancialEvent);

export default router; 