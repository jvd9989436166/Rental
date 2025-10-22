import mongoose from 'mongoose';

const pgSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide PG name'],
    trim: true,
    maxlength: [100, 'PG name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide PG description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide address']
    },
    city: {
      type: String,
      required: [true, 'Please provide city']
    },
    state: {
      type: String,
      required: [true, 'Please provide state']
    },
    pincode: {
      type: String,
      required: [true, 'Please provide pincode'],
      match: [/^[0-9]{6}$/, 'Please provide valid 6-digit pincode']
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    landmark: String
  },
  roomTypes: [{
    type: {
      type: String,
      enum: ['single', 'double', 'triple', 'sharing'],
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    available: {
      type: Number,
      required: true,
      min: [0, 'Available rooms cannot be negative']
    },
    total: {
      type: Number,
      required: true
    },
    deposit: {
      type: Number,
      required: true
    }
  }],
  foodType: {
    type: String,
    enum: ['veg', 'non-veg', 'both', 'none'],
    required: true
  },
  foodSchedule: {
    breakfast: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    dinner: { type: Boolean, default: false }
  },
  amenities: [{
    type: String,
    enum: ['wifi', 'ac', 'laundry', 'cctv', 'parking', 'gym', 'power-backup', 'water-purifier', 'tv', 'fridge', 'geyser', 'attached-bathroom', 'balcony']
  }],
  rules: [{
    type: String
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    caption: String
  }],
  gender: {
    type: String,
    enum: ['male', 'female', 'any'],
    default: 'any'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: String,
    whatsapp: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for reviews
pgSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'pg'
});

// Virtual populate for bookings
pgSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'pg'
});

// Index for search optimization
pgSchema.index({ 'location.city': 1, 'location.state': 1 });
pgSchema.index({ 'roomTypes.price': 1 });
pgSchema.index({ 'rating.average': -1 });
pgSchema.index({ name: 'text', description: 'text' });

// Calculate average rating
pgSchema.methods.calculateAverageRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { pg: this._id } },
    {
      $group: {
        _id: '$pg',
        avgRating: { $avg: '$rating' },
        numRatings: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].avgRating * 10) / 10;
    this.rating.count = stats[0].numRatings;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }

  await this.save();
};

export default mongoose.model('PG', pgSchema);
