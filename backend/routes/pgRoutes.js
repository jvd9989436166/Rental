import express from 'express';
import {
  getPGs,
  getTopRatedPGs,
  getPG,
  createPG,
  updatePG,
  deletePG,
  getMyPGs,
  getPGStats
} from '../controllers/pgController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';
import { createPGValidation, validate, paginationValidation, mongoIdValidation } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', paginationValidation, validate, getPGs);
router.get('/top-rated', getTopRatedPGs);
router.get('/:id', mongoIdValidation, validate, getPG);

// Protected routes - Owner only
router.use(protect);
router.get('/owner/my-pgs', authorize('owner', 'admin'), getMyPGs);
router.post('/', authorize('owner', 'admin'), uploadMultiple, handleUploadError, createPGValidation, validate, createPG);
router.put('/:id', authorize('owner', 'admin'), mongoIdValidation, validate, uploadMultiple, handleUploadError, updatePG);
router.delete('/:id', authorize('owner', 'admin'), mongoIdValidation, validate, deletePG);
router.get('/:id/stats', authorize('owner', 'admin'), mongoIdValidation, validate, getPGStats);

export default router;
