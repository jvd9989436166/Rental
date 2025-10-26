import PG from '../models/PG.js';
import { uploadMultipleToLocal, deleteFromLocal, getImageUrl } from '../config/localStorage.js';

// @desc    Get all PGs with advanced filtering
// @route   GET /api/pgs
// @access  Public
export const getPGs = async (req, res, next) => {
  try {
    const {
      city,
      state,
      minPrice,
      maxPrice,
      roomType,
      foodType,
      amenities,
      gender,
      rating,
      search,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Location filters
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (state) query['location.state'] = new RegExp(state, 'i');

    // Price filter
    if (minPrice || maxPrice) {
      query['roomTypes.price'] = {};
      if (minPrice) query['roomTypes.price'].$gte = Number(minPrice);
      if (maxPrice) query['roomTypes.price'].$lte = Number(maxPrice);
    }

    // Room type filter
    if (roomType) {
      query['roomTypes.type'] = roomType;
    }

    // Food type filter
    if (foodType) {
      query.foodType = foodType === 'any' ? { $in: ['veg', 'non-veg', 'both'] } : foodType;
    }

    // Amenities filter (match all specified amenities)
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $all: amenitiesArray };
    }

    // Gender filter
    if (gender && gender !== 'any') {
      query.gender = { $in: [gender, 'any'] };
    }

    // Rating filter
    if (rating) {
      query['rating.average'] = { $gte: Number(rating) };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'price-low':
        sortOption = { 'roomTypes.price': 1 };
        break;
      case 'price-high':
        sortOption = { 'roomTypes.price': -1 };
        break;
      case 'rating':
        sortOption = { 'rating.average': -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { featured: -1, 'rating.average': -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const pgs = await PG.find(query)
      .populate('owner', 'name email phone')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    // Convert relative image URLs to full URLs
    const pgsWithFullUrls = pgs.map(pg => {
      if (pg.images && pg.images.length > 0) {
        pg.images = pg.images.map(image => ({
          ...image,
          url: getImageUrl(req, image.url)
        }));
      }
      return pg;
    });

    // Get total count
    const total = await PG.countDocuments(query);

    res.status(200).json({
      success: true,
      count: pgs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: pgsWithFullUrls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top-rated PGs using aggregation
// @route   GET /api/pgs/top-rated
// @access  Public
export const getTopRatedPGs = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const topPGs = await PG.aggregate([
      {
        $match: { isActive: true, 'rating.count': { $gte: 5 } }
      },
      {
        $sort: { 'rating.average': -1, 'rating.count': -1 }
      },
      {
        $limit: Number(limit)
      },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $unwind: '$owner'
      },
      {
        $project: {
          name: 1,
          description: 1,
          location: 1,
          roomTypes: 1,
          foodType: 1,
          amenities: 1,
          images: 1,
          rating: 1,
          'owner.name': 1,
          'owner.phone': 1
        }
      }
    ]);

    // Convert relative image URLs to full URLs
    const topPGsWithFullUrls = topPGs.map(pg => {
      if (pg.images && pg.images.length > 0) {
        pg.images = pg.images.map(image => ({
          ...image,
          url: getImageUrl(req, image.url)
        }));
      }
      return pg;
    });

    res.status(200).json({
      success: true,
      count: topPGs.length,
      data: topPGsWithFullUrls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single PG by ID
// @route   GET /api/pgs/:id
// @access  Public
export const getPG = async (req, res, next) => {
  try {
    const pg = await PG.findById(req.params.id)
      .populate('owner', 'name email phone avatar')
      .populate({
        path: 'reviews',
        populate: { path: 'tenant', select: 'name avatar' },
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found'
      });
    }

    // Increment views
    pg.views += 1;
    await pg.save();

    // Convert relative image URLs to full URLs
    if (pg.images && pg.images.length > 0) {
      pg.images = pg.images.map(image => ({
        ...image,
        url: getImageUrl(req, image.url)
      }));
    }

    res.status(200).json({
      success: true,
      data: pg
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new PG
// @route   POST /api/pgs
// @access  Private (Owner only)
export const createPG = async (req, res, next) => {
  try {
    // Add owner to request body
    req.body.owner = req.user.id;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadMultipleToLocal(req.files, 'uploads/pgs');
      req.body.images = uploadedImages;
    }

    const pg = await PG.create(req.body);

    // Convert relative image URLs to full URLs
    if (pg.images && pg.images.length > 0) {
      pg.images = pg.images.map(image => ({
        ...image,
        url: getImageUrl(req, image.url)
      }));
    }

    res.status(201).json({
      success: true,
      message: 'PG created successfully',
      data: pg
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update PG
// @route   PUT /api/pgs/:id
// @access  Private (Owner only)
export const updatePG = async (req, res, next) => {
  try {
    let pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found'
      });
    }

    // Check ownership
    if (pg.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this PG'
      });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadMultipleToLocal(req.files, 'uploads/pgs');
      req.body.images = [...(pg.images || []), ...uploadedImages];
    }

    pg = await PG.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Convert relative image URLs to full URLs
    if (pg.images && pg.images.length > 0) {
      pg.images = pg.images.map(image => ({
        ...image,
        url: getImageUrl(req, image.url)
      }));
    }

    res.status(200).json({
      success: true,
      message: 'PG updated successfully',
      data: pg
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete PG
// @route   DELETE /api/pgs/:id
// @access  Private (Owner only)
export const deletePG = async (req, res, next) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found'
      });
    }

    // Check ownership
    if (pg.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this PG'
      });
    }

    // Delete images from local storage
    if (pg.images && pg.images.length > 0) {
      for (const image of pg.images) {
        if (image.url) {
          await deleteFromLocal(image.url);
        }
      }
    }

    await pg.deleteOne();

    res.status(200).json({
      success: true,
      message: 'PG deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete individual image from PG
// @route   DELETE /api/pgs/:id/images/:imageIndex
// @access  Private (Owner only)
export const deletePGImage = async (req, res, next) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found'
      });
    }

    // Check ownership
    if (pg.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete images from this PG'
      });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    
    if (imageIndex < 0 || imageIndex >= pg.images.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image index'
      });
    }

    // Get the image to delete
    const imageToDelete = pg.images[imageIndex];
    
    // Delete image from local storage
    if (imageToDelete.url) {
      await deleteFromLocal(imageToDelete.url);
    }

    // Remove image from array
    pg.images.splice(imageIndex, 1);
    await pg.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: pg
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's PGs
// @route   GET /api/pgs/owner/my-pgs
// @access  Private (Owner only)
export const getMyPGs = async (req, res, next) => {
  try {
    const pgs = await PG.find({ owner: req.user.id })
      .sort({ createdAt: -1 })
      .populate('reviews');

    // Convert relative image URLs to full URLs
    const pgsWithFullUrls = pgs.map(pg => {
      if (pg.images && pg.images.length > 0) {
        pg.images = pg.images.map(image => ({
          ...image,
          url: getImageUrl(req, image.url)
        }));
      }
      return pg;
    });

    res.status(200).json({
      success: true,
      count: pgs.length,
      data: pgsWithFullUrls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get PG statistics (for owner dashboard)
// @route   GET /api/pgs/:id/stats
// @access  Private (Owner only)
export const getPGStats = async (req, res, next) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found'
      });
    }

    // Check ownership
    if (pg.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this PG stats'
      });
    }

    // Get booking statistics
    const Booking = (await import('../models/Booking.js')).default;
    const bookingStats = await Booking.aggregate([
      { $match: { pg: pg._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' }
        }
      }
    ]);

    // Calculate occupancy rate
    const totalRooms = pg.roomTypes.reduce((sum, rt) => sum + rt.total, 0);
    const availableRooms = pg.roomTypes.reduce((sum, rt) => sum + rt.available, 0);
    const occupancyRate = ((totalRooms - availableRooms) / totalRooms * 100).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        views: pg.views,
        rating: pg.rating,
        occupancyRate,
        totalRooms,
        availableRooms,
        bookingStats
      }
    });
  } catch (error) {
    next(error);
  }
};
