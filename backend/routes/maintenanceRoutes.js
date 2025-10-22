import express from 'express';
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceRequest,
  updateMaintenanceStatus,
  addFeedback,
  getMaintenanceStats
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';
import { createMaintenanceValidation, validate, paginationValidation, mongoIdValidation } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Tenant routes
router.post('/', uploadMultiple, handleUploadError, createMaintenanceValidation, validate, createMaintenanceRequest);
router.get('/', paginationValidation, validate, getMaintenanceRequests);
router.get('/:id', mongoIdValidation, validate, getMaintenanceRequest);
router.put('/:id/feedback', mongoIdValidation, validate, addFeedback);

// Owner/Admin routes
router.put('/:id/status', authorize('owner', 'admin'), mongoIdValidation, validate, updateMaintenanceStatus);
router.get('/stats/overview', authorize('owner', 'admin'), getMaintenanceStats);

export default router;
