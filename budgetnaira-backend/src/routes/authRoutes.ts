import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateDetails,
  updatePassword,
  logout,
  forgotPassword,
  resetPassword
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;