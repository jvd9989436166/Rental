import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  category: {
    type: String,
    enum: ['plumbing', 'electrical', 'cleaning', 'furniture', 'appliance', 'internet', 'other'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  images: [{
    url: String,
    publicId: String
  }],
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'in-progress', 'resolved', 'closed', 'rejected'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: String,
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  }
}, {
  timestamps: true
});

// Generate unique request ID
maintenanceSchema.pre('save', async function(next) {
  if (!this.requestId) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.requestId = `MR${timestamp}${random}`;
  }
  next();
});

// Index for queries
maintenanceSchema.index({ tenant: 1, status: 1 });
maintenanceSchema.index({ owner: 1, status: 1 });
maintenanceSchema.index({ pg: 1, status: 1 });

export default mongoose.model('Maintenance', maintenanceSchema);
