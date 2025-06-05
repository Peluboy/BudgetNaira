import express from 'express';
import {
  getSavingGoals,
  getSavingGoal,
  createSavingGoal,
  updateSavingGoal,
  deleteSavingGoal,
  addFundsToSavingGoal,
  getSavingGoalsOverview
} from '../controllers/savingGoalController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

// Overview route
router.get('/overview', getSavingGoalsOverview);

// Add funds route
router.put('/:id/addfunds', addFundsToSavingGoal);

// Standard routes
router.route('/')
  .get(getSavingGoals)
  .post(createSavingGoal);

router.route('/:id')
  .get(getSavingGoal)
  .put(updateSavingGoal)
  .delete(deleteSavingGoal);

export default router;