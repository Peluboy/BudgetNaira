import express from 'express';
import {
  createBill,
  getBills,
  updatePayment,
  sendReminders
} from '../controllers/billController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createBill)
  .get(getBills);

router.route('/:id/pay')
  .put(updatePayment);

router.route('/:id/remind')
  .post(sendReminders);

export default router;
