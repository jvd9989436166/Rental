import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import { uploadMultipleToLocal, getImageUrl } from '../config/localStorage.js';

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Tenant only)
export const createReview = async (req, res, next) => {
  try {
    const { pg, booking, ratings, comment } = req.body;

    // Verify booking exists and belongs to user
    const bookingData = await Booking.findById(booking);
    
    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (bookingData.tenant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own bookings'
      });
    }

    // Check if booking is completed
    if (bookingData.status !== 'completed' && bookingData.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed or active bookings'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking, tenant: req.user.id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await uploadMultipleToLocal(req.files, 'uploads/reviews');
    }

    // Create review
    const review = await Review.create({
      pg,
      tenant: req.user.id,
      booking,
      ratings,
      comment,
      images,
      isVerified: true // Mark as verified since it's from actual booking
    });

    await review.populate('tenant', 'name avatar');

    // Convert relative image URLs to full URLs
    if (review.images && review.images.length > 0) {
      review.images = review.images.map(image => ({
        ...image,
        url: getImageUrl(req, image.url)
      }));
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a PG
// @route   GET /api/reviews/pg/:pgId
// @access  Public
export const getPGReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'recent' } = req.query;

    let sortOption = {};
    switch (sort) {
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      case 'rating-high':
        sortOption = { rating: -1 };
        break;
      case 'rating-low':
        sortOption = { rating: 1 };
        break;
      case 'helpful':
        sortOption = { 'likes': -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ pg: req.params.pgId })
      .populate('tenant', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ pg: req.params.pgId });

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { pg: req.params.pgId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      ratingDistribution,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ tenant: req.user.id })
      .populate('pg', 'name location images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner only)
export const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.tenant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const { ratings, comment } = req.body;

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { ratings, comment },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner only)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.tenant.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike review
// @route   PUT /api/reviews/:id/like
// @access  Private
export const likeReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if already liked
    const likeIndex = review.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike
      review.likes.splice(likeIndex, 1);
    } else {
      // Like
      review.likes.push(req.user.id);
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? 'Review unliked' : 'Review liked',
      data: { likes: review.likes.length }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Owner response to review
// @route   PUT /api/reviews/:id/response
// @access  Private (Owner only)
export const respondToReview = async (req, res, next) => {
  try {
    const { comment } = req.body;
    
    const review = await Review.findById(req.params.id).populate('pg');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the PG owner
    if (review.pg.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only PG owner can respond to reviews'
      });
    }

    review.response = {
      comment,
      respondedAt: new Date()
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};
