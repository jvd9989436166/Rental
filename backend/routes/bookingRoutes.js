import express from 'express';
import {
  createOrder,
  verifyPayment,
  getBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getBookingStats
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { createBookingValidation, validate, paginationValidation, mongoIdValidation } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Tenant routes
router.post('/create-order', createBookingValidation, validate, createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/', paginationValidation, validate, getBookings);
router.get('/:id', mongoIdValidation, validate, getBooking);
router.put('/:id/cancel', mongoIdValidation, validate, cancelBooking);

// Owner/Admin routes
router.put('/:id/status', authorize('owner', 'admin'), mongoIdValidation, validate, updateBookingStatus);
router.get('/stats/overview', authorize('owner', 'admin'), getBookingStats);

export default router;
