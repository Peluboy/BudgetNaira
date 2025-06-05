import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { asyncHandler } from '../middleware/async';
import ErrorResponse from '../utils/errorResponse';
import path from 'path';
import fs from 'fs';

// Define interface to extend Express Request
interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { firstName, lastName, phone, address, city, state, country } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user!.id,
    {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      country
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
export const updatePreferences = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { currency, language, theme, notifications, security } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user!.id,
    {
      preferences: {
        currency,
        language,
        theme,
        notifications,
        security
      }
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!.id);

    res.status(200).json({
      success: true,
      data: user
    });
  }
);

// @desc    Get user preferences
// @route   GET /api/users/preferences
// @access  Private
export const getPreferences = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!.id);

    res.status(200).json({
      success: true,
      data: user?.preferences
    });
  }
);

// @desc    Upload profile image
// @route   POST /api/users/profile/image
// @access  Private
export const uploadProfileImage = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const user = await User.findById(req.user!.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Delete old profile image if exists
  if (user.profileImage) {
    const oldImagePath = path.join(__dirname, '..', '..', user.profileImage);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  // Update user with new profile image path
  const relativePath = req.file.path.replace(/\\/g, '/');
  user.profileImage = relativePath;
  await user.save();

  // Create full URL for profile image
  const profileImageUrl = `${process.env.API_URL || 'http://localhost:5000'}/${relativePath}`;

  res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
      profileImage: profileImageUrl
    }
  });
}); 