import express from 'express';
import {
  getPGs,
  getTopRatedPGs,
  getPG,
  createPG,
  updatePG,
  deletePG,
  deletePGImage,
  getMyPGs,
  getPGStats
} from '../controllers/pgController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';
import { createPGValidation, validate, paginationValidation, mongoIdValidation, parseMultipartData } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', paginationValidation, validate, getPGs);
router.get('/top-rated', getTopRatedPGs);

// Protected routes - Owner only
router.use(protect);
router.get('/owner/my-pgs', authorize('owner', 'admin'), getMyPGs);
router.post('/', authorize('owner', 'admin'), uploadMultiple, handleUploadError, parseMultipartData, createPGValidation, validate, createPG);
router.put('/:id', authorize('owner', 'admin'), mongoIdValidation, validate, uploadMultiple, handleUploadError, parseMultipartData, updatePG);
router.delete('/:id', authorize('owner', 'admin'), mongoIdValidation, validate, deletePG);
router.delete('/:id/images/:imageIndex', authorize('owner', 'admin'), mongoIdValidation, validate, deletePGImage);
router.get('/:id/stats', authorize('owner', 'admin'), mongoIdValidation, validate, getPGStats);

// Public routes that need to come after specific routes
router.get('/:id', mongoIdValidation, validate, getPG);

export default router;
