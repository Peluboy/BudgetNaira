import express from 'express';
import {
  getFinancialProfile,
  createUpdateFinancialProfile,
  addFinancialGoal,
  updateFinancialGoal,
  removeFinancialGoal,
  updateDebtInformation,
  addLoan,
  updateLoan,
  removeLoan
} from '../controllers/financialProfileController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

// Profile routes
router.route('/')
  .get(getFinancialProfile)
  .post(createUpdateFinancialProfile);

// Financial goals routes
router.route('/goals')
  .post(addFinancialGoal);

router.route('/goals/:goalId')
  .put(updateFinancialGoal)
  .delete(removeFinancialGoal);

// Debt information routes
router.route('/debt')
  .put(updateDebtInformation);

router.route('/debt/loans')
  .post(addLoan);

router.route('/debt/loans/:loanId')
  .put(updateLoan)
  .delete(removeLoan);

export default router;