import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  refreshToken,
  updateProfile,
  updatePassword,
  googleAuth
} from '../controllers/authController.js';
import { protect, verifyRefreshToken } from '../middleware/auth.js';
import { registerValidation, loginValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/google', googleAuth);
router.post('/refresh-token', verifyRefreshToken, refreshToken);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);

export default router;
