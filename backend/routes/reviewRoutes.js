import express from 'express';
import {
  createReview,
  getPGReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  likeReview,
  respondToReview
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';
import { createReviewValidation, validate, paginationValidation, mongoIdValidation } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/pg/:pgId', paginationValidation, validate, getPGReviews);

// Protected routes
router.use(protect);
router.post('/', uploadMultiple, handleUploadError, createReviewValidation, validate, createReview);
router.get('/my-reviews', getMyReviews);
router.put('/:id', mongoIdValidation, validate, updateReview);
router.delete('/:id', mongoIdValidation, validate, deleteReview);
router.put('/:id/like', mongoIdValidation, validate, likeReview);
router.put('/:id/response', authorize('owner', 'admin'), mongoIdValidation, validate, respondToReview);

export default router;
