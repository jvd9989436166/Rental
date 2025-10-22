import Maintenance from '../models/Maintenance.js';
import Booking from '../models/Booking.js';
import { uploadMultipleToCloudinary } from '../config/cloudinary.js';

// @desc    Create maintenance request
// @route   POST /api/maintenance
// @access  Private (Tenant only)
export const createMaintenanceRequest = async (req, res, next) => {
  try {
    const { pg, booking, category, title, description, priority } = req.body;

    // Verify booking exists and belongs to user
    const bookingData = await Booking.findById(booking).populate('pg');
    
    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (bookingData.tenant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create request for this booking'
      });
    }

    // Check if booking is active
    if (bookingData.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Maintenance requests can only be created for active bookings'
      });
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await uploadMultipleToCloudinary(req.files, 'rentalmate/maintenance');
    }

    // Create maintenance request
    const maintenanceRequest = await Maintenance.create({
      tenant: req.user.id,
      pg,
      owner: bookingData.pg.owner,
      booking,
      category,
      title,
      description,
      priority: priority || 'medium',
      images,
      statusHistory: [{
        status: 'pending',
        updatedBy: req.user.id,
        comment: 'Request created',
        timestamp: new Date()
      }]
    });

    await maintenanceRequest.populate([
      { path: 'tenant', select: 'name phone email' },
      { path: 'pg', select: 'name location' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Maintenance request created successfully',
      data: maintenanceRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get maintenance requests
// @route   GET /api/maintenance
// @access  Private
export const getMaintenanceRequests = async (req, res, next) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filter by user role
    if (req.user.role === 'tenant') {
      query.tenant = req.user.id;
    } else if (req.user.role === 'owner') {
      query.owner = req.user.id;
    }

    // Additional filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    const requests = await Maintenance.find(query)
      .populate('tenant', 'name phone email avatar')
      .populate('pg', 'name location images')
      .populate('owner', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Maintenance.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single maintenance request
// @route   GET /api/maintenance/:id
// @access  Private
export const getMaintenanceRequest = async (req, res, next) => {
  try {
    const request = await Maintenance.findById(req.params.id)
      .populate('tenant', 'name phone email avatar')
      .populate('pg', 'name location images contactInfo')
      .populate('owner', 'name phone email')
      .populate('statusHistory.updatedBy', 'name role');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    // Check authorization
    if (
      request.tenant._id.toString() !== req.user.id &&
      request.owner._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance request status
// @route   PUT /api/maintenance/:id/status
// @access  Private (Owner/Admin)
export const updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { status, comment, resolutionNotes } = req.body;
    
    const request = await Maintenance.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    // Check authorization
    if (request.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    // Update status
    request.status = status;

    // Add to status history
    request.statusHistory.push({
      status,
      updatedBy: req.user.id,
      comment: comment || `Status updated to ${status}`,
      timestamp: new Date()
    });

    // If resolved, add resolution details
    if (status === 'resolved') {
      request.resolvedAt = new Date();
      request.resolvedBy = req.user.id;
      if (resolutionNotes) {
        request.resolutionNotes = resolutionNotes;
      }
    }

    await request.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add feedback to resolved request
// @route   PUT /api/maintenance/:id/feedback
// @access  Private (Tenant only)
export const addFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    
    const request = await Maintenance.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    // Check authorization
    if (request.tenant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add feedback to this request'
      });
    }

    // Check if request is resolved
    if (request.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Can only add feedback to resolved requests'
      });
    }

    request.feedback = { rating, comment };
    request.status = 'closed';
    
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Feedback added successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get maintenance statistics
// @route   GET /api/maintenance/stats
// @access  Private (Owner/Admin)
export const getMaintenanceStats = async (req, res, next) => {
  try {
    const query = req.user.role === 'owner' ? { owner: req.user.id } : {};

    const stats = await Maintenance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Maintenance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Maintenance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average resolution time
    const resolutionTime = await Maintenance.aggregate([
      { 
        $match: { 
          ...query,
          status: 'resolved',
          resolvedAt: { $exists: true }
        } 
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        categoryStats,
        priorityStats,
        avgResolutionTime: resolutionTime[0]?.avgResolutionTime || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
