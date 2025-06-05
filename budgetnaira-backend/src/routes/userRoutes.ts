import express from 'express';
import {
  updateProfile,
  updatePreferences,
  getProfile,
  getPreferences,
  getMe,
  uploadProfileImage
} from '../controllers/userController';
import { protect } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

// Protect all routes
router.use(protect);

// Profile routes
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

// Preferences routes
router.route('/preferences')
  .get(getPreferences)
  .put(updatePreferences);

router.get('/me', getMe);
router.post('/profile/image', upload.single('profileImage'), uploadProfileImage);

export default router; 