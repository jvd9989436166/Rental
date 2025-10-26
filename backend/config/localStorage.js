import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the base URL for serving static files
const getBaseUrl = (req) => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}`;
};

// Upload image to local storage
export const uploadToLocal = async (file, folder = 'uploads') => {
  try {
    // Create folder if it doesn't exist
    const uploadDir = path.join(__dirname, '..', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `image-${uniqueSuffix}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Move file to upload directory
    await fs.promises.rename(file.path, filePath);

    // Return relative path for database storage
    const relativePath = path.join(folder, fileName).replace(/\\/g, '/');

    return {
      url: relativePath, // Store relative path in database
      fileName: fileName,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    throw new Error(`Local upload failed: ${error.message}`);
  }
};

// Delete image from local storage
export const deleteFromLocal = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(`Local delete failed: ${error.message}`);
  }
};

// Upload multiple images
export const uploadMultipleToLocal = async (files, folder = 'uploads') => {
  try {
    const uploadPromises = files.map(file => uploadToLocal(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Multiple upload failed: ${error.message}`);
  }
};

// Get full URL for serving images
export const getImageUrl = (req, relativePath) => {
  // If the path is already a complete URL (starts with http), return as is
  if (relativePath.startsWith('http')) {
    return relativePath;
  }
  
  const baseUrl = getBaseUrl(req);
  return `${baseUrl}/${relativePath}`;
};

// Serve static images
export const serveStaticImages = (app) => {
  // Use Express static middleware for better performance and reliability
  app.use('/uploads', (req, res, next) => {
    // Set CORS headers for static files
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Remove restrictive CORS policies
    res.removeHeader('Cross-Origin-Resource-Policy');
    res.removeHeader('Cross-Origin-Opener-Policy');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  }, express.static(path.join(__dirname, '..', 'uploads')));
};

export default {
  uploadToLocal,
  deleteFromLocal,
  uploadMultipleToLocal,
  getImageUrl,
  serveStaticImages
};
