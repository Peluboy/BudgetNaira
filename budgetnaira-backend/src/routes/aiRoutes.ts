import express from 'express';
import { protect } from '../middleware/auth';
import { getBudgetRecommendations } from '../controllers/aiController';

const router = express.Router();

// Protect all routes
router.use(protect);

// AI routes
router.post('/budget-recommendations', getBudgetRecommendations);

export default router; 