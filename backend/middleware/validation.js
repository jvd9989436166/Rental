import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Validation result checker
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// User validation rules
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').trim().isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone').trim().matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['tenant', 'owner']).withMessage('Invalid role')
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// PG validation rules
export const createPGValidation = [
  body('name').trim().notEmpty().withMessage('PG name is required')
    .isLength({ max: 100 }).withMessage('PG name cannot exceed 100 characters'),
  body('description').trim().notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.state').trim().notEmpty().withMessage('State is required'),
  body('location.pincode').matches(/^[0-9]{6}$/).withMessage('Please provide valid 6-digit pincode'),
  body('roomTypes').isArray({ min: 1 }).withMessage('At least one room type is required'),
  body('foodType').isIn(['veg', 'non-veg', 'both', 'none']).withMessage('Invalid food type'),
  body('contactInfo.phone').matches(/^[0-9]{10}$/).withMessage('Please provide valid phone number')
];

// Booking validation rules
export const createBookingValidation = [
  body('pg').custom((value) => {
    // Allow development mode IDs or valid MongoDB ObjectId
    if (value.startsWith('dev_') || value.startsWith('dev_pg_')) {
      return true;
    }
    // Check if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid PG ID');
    }
    return true;
  }),
  body('roomType').isIn(['single', 'double', 'triple', 'sharing']).withMessage('Invalid room type'),
  body('checkIn').isISO8601().withMessage('Invalid check-in date'),
  body('checkOut').isISO8601().withMessage('Invalid check-out date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkIn)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    })
];

// Review validation rules
export const createReviewValidation = [
  body('pg').isMongoId().withMessage('Invalid PG ID'),
  body('booking').isMongoId().withMessage('Invalid booking ID'),
  body('ratings.cleanliness').isInt({ min: 1, max: 5 }).withMessage('Cleanliness rating must be between 1 and 5'),
  body('ratings.food').isInt({ min: 1, max: 5 }).withMessage('Food rating must be between 1 and 5'),
  body('ratings.safety').isInt({ min: 1, max: 5 }).withMessage('Safety rating must be between 1 and 5'),
  body('ratings.location').isInt({ min: 1, max: 5 }).withMessage('Location rating must be between 1 and 5'),
  body('ratings.valueForMoney').isInt({ min: 1, max: 5 }).withMessage('Value for money rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required')
    .isLength({ max: 1000 }).withMessage('Review cannot exceed 1000 characters')
];

// Maintenance validation rules
export const createMaintenanceValidation = [
  body('pg').isMongoId().withMessage('Invalid PG ID'),
  body('booking').isMongoId().withMessage('Invalid booking ID'),
  body('category').isIn(['plumbing', 'electrical', 'cleaning', 'furniture', 'appliance', 'internet', 'other'])
    .withMessage('Invalid category'),
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description').trim().notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
];

// Query validation
export const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// ID param validation
export const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID format')
];
