import Booking from '../models/Booking.js';
import PG from '../models/PG.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Check if database is available
const isDatabaseAvailable = () => {
  try {
    return mongoose.connection.readyState === 1;
  } catch (error) {
    return false;
  }
};

// Function to get Razorpay instance (only when needed)
const getRazorpayInstance = () => {
  if (isDevelopment) {
    return null;
  }
  
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// @desc    Create Razorpay order (or mock order in development)
// @route   POST /api/bookings/create-order
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { pg, roomType, checkIn, checkOut, monthlyRent, deposit } = req.body;

    // Development mode with database - use real database operations

    // Verify PG exists (skip for development mode IDs)
    let pgData = null;
    if (pg.startsWith('dev_') || pg.startsWith('dev_pg_')) {
      // Development mode - create mock PG data
      pgData = {
        _id: pg,
        name: 'Development PG',
        location: { city: 'Development City', state: 'Development State' }
      };
    } else {
      // Production mode - verify PG exists in database
      pgData = await PG.findById(pg);
      if (!pgData) {
        return res.status(404).json({
          success: false,
          message: 'PG not found'
        });
      }
    }

    // Calculate total amount
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    
    let discount = 0;
    if (months >= 6) discount = 10; // 10% discount for 6+ months
    else if (months >= 3) discount = 5; // 5% discount for 3+ months

    const rentAmount = monthlyRent * months;
    const discountAmount = (rentAmount * discount) / 100;
    const total = rentAmount - discountAmount + deposit;

    if (isDevelopment) {
      // In development mode, return a mock order
      res.status(200).json({
        success: true,
        data: {
          orderId: `order_dev_${Date.now()}`,
          amount: Math.round(total * 100),
          currency: 'INR',
          discount,
          discountAmount,
          total,
          isDevelopment: true,
          message: 'Development mode: Payment simulation enabled'
        }
      });
    } else {
      // Create Razorpay order
      const razorpay = getRazorpayInstance();
      const options = {
        amount: Math.round(total * 100), // Amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          pgId: pg,
          tenantId: req.user.id,
          roomType
        }
      };

      const order = await razorpay.orders.create(options);

      res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          discount,
          discountAmount,
          total
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment and create booking (or mock verification in development)
// @route   POST /api/bookings/verify-payment
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      pg,
      roomType,
      checkIn,
      checkOut,
      monthlyRent,
      deposit,
      discount,
      total,
      tenantDetails
    } = req.body;

    // Development mode with database - use real database operations

    if (isDevelopment) {
      // In development mode, skip payment verification
      console.log('🔧 Development mode: Skipping payment verification');
    } else {
      // Verify signature
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }
    }

    // Get PG and owner details
    let pgData = null;
    let ownerId = null;
    
    if (pg.startsWith('dev_') || pg.startsWith('dev_pg_')) {
      // Development mode - extract the actual PG ID from the dev ID
      let actualPGId = pg;
      if (pg.startsWith('dev_pg_')) {
        actualPGId = pg.replace('dev_pg_', '');
      } else if (pg.startsWith('dev_')) {
        actualPGId = pg.replace('dev_', '');
      }
      
      // Try to find the actual PG
      const realPG = await PG.findById(actualPGId);
      if (!realPG) {
        // Fallback to any PG if the specific one doesn't exist
        const fallbackPG = await PG.findOne();
        if (!fallbackPG) {
          return res.status(404).json({
            success: false,
            message: 'No PGs available for development mode'
          });
        }
        pgData = fallbackPG;
        ownerId = fallbackPG.owner;
      } else {
        pgData = realPG;
        ownerId = realPG.owner;
      }
    } else {
      // Production mode - get from database
      pgData = await PG.findById(pg);
      if (!pgData) {
        return res.status(404).json({
          success: false,
          message: 'PG not found'
        });
      }
      ownerId = pgData.owner;
    }

    // Create booking
    const booking = await Booking.create({
      bookingId: `BK${Date.now()}`,
      tenant: req.user.id,
      pg: pgData._id, // Use the real PG ID
      owner: ownerId,
      roomType,
      checkIn,
      checkOut,
      duration: {
        months: Math.floor((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24 * 30)),
        days: 0
      },
      pricing: {
        monthlyRent,
        deposit,
        discount,
        total
      },
      payment: {
        razorpayOrderId: isDevelopment ? `order_dev_${Date.now()}` : razorpayOrderId,
        razorpayPaymentId: isDevelopment ? `pay_dev_${Date.now()}` : razorpayPaymentId,
        razorpaySignature: isDevelopment ? 'dev_signature' : razorpaySignature,
        method: isDevelopment ? 'cash' : 'razorpay', // Use 'cash' for development mode
        status: 'completed',
        paidAt: new Date()
      },
      status: 'confirmed',
      tenantDetails
    });

    // Update room availability (skip for development mode)
    if (!pg.startsWith('dev_') && !pg.startsWith('dev_pg_')) {
      const roomTypeIndex = pgData.roomTypes.findIndex(rt => rt.type === roomType);
      if (roomTypeIndex !== -1 && pgData.roomTypes[roomTypeIndex].available > 0) {
        pgData.roomTypes[roomTypeIndex].available -= 1;
        await pgData.save();
      }
    }

    await booking.populate([
      { path: 'tenant', select: 'name email phone' },
      { path: 'pg', select: 'name location images' },
      { path: 'owner', select: 'name email phone' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (with filters)
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Development mode with database - use real database operations

    const query = {};

    // Filter by user role
    if (req.user.role === 'tenant') {
      query.tenant = req.user.id;
    } else if (req.user.role === 'owner') {
      query.owner = req.user.id;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('tenant', 'name email phone avatar')
      .populate('pg', 'name location images rating')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tenant', 'name email phone avatar')
      .populate('pg', 'name location images rating amenities contactInfo')
      .populate('owner', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (
      booking.tenant._id.toString() !== req.user.id &&
      booking.owner._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner/Admin)
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (
      booking.tenant.toString() !== req.user.id &&
      booking.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${booking.status} booking`
      });
    }

    // Calculate refund amount (simple logic - can be customized)
    const daysUntilCheckIn = Math.ceil((new Date(booking.checkIn) - new Date()) / (1000 * 60 * 60 * 24));
    let refundPercentage = 0;
    
    if (daysUntilCheckIn > 30) refundPercentage = 100;
    else if (daysUntilCheckIn > 15) refundPercentage = 75;
    else if (daysUntilCheckIn > 7) refundPercentage = 50;
    else if (daysUntilCheckIn > 0) refundPercentage = 25;

    const refundAmount = (booking.pricing.total * refundPercentage) / 100;

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: req.user.id,
      reason,
      cancelledAt: new Date(),
      refundAmount,
      refundStatus: 'pending'
    };

    await booking.save();

    // Restore room availability
    const pg = await PG.findById(booking.pg);
    const roomTypeIndex = pg.roomTypes.findIndex(rt => rt.type === booking.roomType);
    if (roomTypeIndex !== -1) {
      pg.roomTypes[roomTypeIndex].available += 1;
      await pg.save();
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking,
        refundAmount,
        refundPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private (Owner/Admin)
export const getBookingStats = async (req, res, next) => {
  try {
    const query = req.user.role === 'owner' ? { owner: req.user.id } : {};

    const stats = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' }
        }
      }
    ]);

    // Get monthly revenue
    const monthlyRevenue = await Booking.aggregate([
      { 
        $match: { 
          ...query,
          'payment.status': 'completed',
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$pricing.total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        monthlyRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};
