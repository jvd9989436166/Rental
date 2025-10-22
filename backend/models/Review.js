import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  pg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  ratings: {
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    food: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    safety: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    location: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    }
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  images: [{
    url: String,
    publicId: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  response: {
    comment: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Calculate overall rating from individual ratings
reviewSchema.pre('save', function(next) {
  if (this.ratings) {
    const { cleanliness, food, safety, location, valueForMoney } = this.ratings;
    this.rating = Math.round(((cleanliness + food + safety + location + valueForMoney) / 5) * 10) / 10;
  }
  next();
});

// Update PG rating after review is saved
reviewSchema.post('save', async function() {
  const PG = mongoose.model('PG');
  const pg = await PG.findById(this.pg);
  if (pg) {
    await pg.calculateAverageRating();
  }
});

// Update PG rating after review is deleted
reviewSchema.post('remove', async function() {
  const PG = mongoose.model('PG');
  const pg = await PG.findById(this.pg);
  if (pg) {
    await pg.calculateAverageRating();
  }
});

// Prevent duplicate reviews
reviewSchema.index({ pg: 1, tenant: 1, booking: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
