import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import Category, { ICategory } from '../models/Category';
import { IUser } from '../models/User';

// Define interface to extend Express Request
interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Find categories that are either default ones or belong to the current user
    const categories = await Category.find({
      $or: [
        { isDefault: true },
        { userId: req.user!.id }
      ]
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  }
);

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
export const getCategory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(
        new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the category or it's a default category
    if (!category.isDefault && category.userId.toString() !== req.user!.id) {
      return next(
        new ErrorResponse(`User not authorized to access this category`, 401)
      );
    }

    res.status(200).json({
      success: true,
      data: category
    });
  }
);

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
export const createCategory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Add user to request body
    req.body.userId = req.user!.id;
    
    // Ensure custom categories aren't marked as default
    req.body.isDefault = false;

    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  }
);

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return next(
        new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the category
    if (category.isDefault || category.userId.toString() !== req.user!.id) {
      return next(
        new ErrorResponse(`User not authorized to update this category`, 401)
      );
    }

    // Prevent updating to default
    if (req.body.isDefault) {
      delete req.body.isDefault;
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: category
    });
  }
);

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(
        new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the category
    if (category.isDefault || category.userId.toString() !== req.user!.id) {
      return next(
        new ErrorResponse(`User not authorized to delete this category`, 401)
      );
    }

    await category.deleteOne();

    // Delete all expenses with this category

    res.status(200).json({
      success: true,
      data: {}
    });
  }
);