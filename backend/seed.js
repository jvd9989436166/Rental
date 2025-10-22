import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import PG from './models/PG.js';
import Review from './models/Review.js';
import Booking from './models/Booking.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rentalmate');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample users data
const usersData = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '9876543210',
    password: 'password123',
    role: 'tenant',
    isVerified: true
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '9876543211',
    password: 'password123',
    role: 'tenant',
    isVerified: true
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '9876543212',
    password: 'password123',
    role: 'tenant',
    isVerified: true
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phone: '9876543213',
    password: 'password123',
    role: 'tenant',
    isVerified: true
  },
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '9876543214',
    password: 'password123',
    role: 'owner',
    isVerified: true
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '9876543215',
    password: 'password123',
    role: 'owner',
    isVerified: true
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '9876543216',
    password: 'password123',
    role: 'owner',
    isVerified: true
  },
  {
    name: 'Admin User',
    email: 'admin@rentalmate.com',
    phone: '9876543217',
    password: 'admin123',
    role: 'admin',
    isVerified: true
  }
];

// Sample PGs data
const pgsData = [
  {
    name: 'Cozy Corner PG',
    description: 'A comfortable and well-maintained PG located in the heart of the city. Perfect for working professionals and students. Features modern amenities and 24/7 security.',
    location: {
      address: '123 Main Street, Sector 5',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      landmark: 'Near Metro Station'
    },
    roomTypes: [
      {
        type: 'single',
        price: 8500,
        available: 3,
        total: 5,
        deposit: 10000
      },
      {
        type: 'double',
        price: 12000,
        available: 2,
        total: 3,
        deposit: 15000
      }
    ],
    foodType: 'both',
    foodSchedule: {
      breakfast: true,
      lunch: true,
      dinner: true
    },
    amenities: ['wifi', 'ac', 'laundry', 'cctv', 'parking', 'power-backup', 'water-purifier'],
    rules: [
      'No smoking inside the premises',
      'Visitors allowed only till 10 PM',
      'Maintain cleanliness in common areas'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        caption: 'Main entrance'
      },
      {
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        caption: 'Common area'
      }
    ],
    gender: 'any',
    contactInfo: {
      phone: '9876543214',
      email: 'rajesh.kumar@example.com',
      whatsapp: '9876543214'
    }
  },
  {
    name: 'Green Valley PG',
    description: 'Eco-friendly PG with beautiful garden and natural lighting. Located in a peaceful neighborhood with excellent connectivity to IT parks and educational institutions.',
    location: {
      address: '456 Garden Road, Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      landmark: 'Near IT Park'
    },
    roomTypes: [
      {
        type: 'single',
        price: 9500,
        available: 4,
        total: 6,
        deposit: 12000
      },
      {
        type: 'triple',
        price: 15000,
        available: 1,
        total: 2,
        deposit: 18000
      }
    ],
    foodType: 'veg',
    foodSchedule: {
      breakfast: true,
      lunch: true,
      dinner: false
    },
    amenities: ['wifi', 'laundry', 'cctv', 'parking', 'gym', 'water-purifier', 'balcony'],
    rules: [
      'Vegetarian food only',
      'Quiet hours after 11 PM',
      'No pets allowed'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        caption: 'Garden view'
      }
    ],
    gender: 'any',
    contactInfo: {
      phone: '9876543215',
      email: 'priya.sharma@example.com',
      whatsapp: '9876543215'
    }
  },
  {
    name: 'Metro Heights PG',
    description: 'Modern PG with premium facilities and excellent location. Just 5 minutes walk from metro station. Perfect for corporate professionals.',
    location: {
      address: '789 Metro Road, Connaught Place',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      landmark: 'Near Metro Station'
    },
    roomTypes: [
      {
        type: 'single',
        price: 12000,
        available: 2,
        total: 4,
        deposit: 15000
      },
      {
        type: 'double',
        price: 18000,
        available: 1,
        total: 2,
        deposit: 20000
      }
    ],
    foodType: 'both',
    foodSchedule: {
      breakfast: true,
      lunch: true,
      dinner: true
    },
    amenities: ['wifi', 'ac', 'laundry', 'cctv', 'parking', 'gym', 'power-backup', 'water-purifier', 'tv', 'fridge', 'geyser', 'attached-bathroom'],
    rules: [
      'Professional environment',
      'No loud music',
      'Maintain decorum'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        caption: 'Modern rooms'
      }
    ],
    gender: 'any',
    contactInfo: {
      phone: '9876543216',
      email: 'amit.patel@example.com',
      whatsapp: '9876543216'
    }
  },
  {
    name: 'Student Haven PG',
    description: 'Budget-friendly PG specifically designed for students. Located near major universities and colleges. Safe and secure environment for students.',
    location: {
      address: '321 University Road, Anna Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      coordinates: { lat: 13.0827, lng: 80.2707 },
      landmark: 'Near University'
    },
    roomTypes: [
      {
        type: 'sharing',
        price: 6000,
        available: 8,
        total: 10,
        deposit: 8000
      },
      {
        type: 'triple',
        price: 9000,
        available: 3,
        total: 5,
        deposit: 12000
      }
    ],
    foodType: 'veg',
    foodSchedule: {
      breakfast: true,
      lunch: true,
      dinner: true
    },
    amenities: ['wifi', 'laundry', 'cctv', 'parking', 'water-purifier'],
    rules: [
      'Student ID required',
      'Study hours: 6 PM - 10 PM',
      'No visitors after 9 PM'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        caption: 'Study room'
      }
    ],
    gender: 'any',
    contactInfo: {
      phone: '9876543214',
      email: 'rajesh.kumar@example.com',
      whatsapp: '9876543214'
    }
  },
  {
    name: 'Luxury Suites PG',
    description: 'Premium PG with luxury amenities and personalized services. Perfect for executives and high-income professionals. 24/7 concierge service available.',
    location: {
      address: '555 Luxury Lane, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      coordinates: { lat: 17.4065, lng: 78.4772 },
      landmark: 'Near Business District'
    },
    roomTypes: [
      {
        type: 'single',
        price: 20000,
        available: 1,
        total: 3,
        deposit: 25000
      }
    ],
    foodType: 'both',
    foodSchedule: {
      breakfast: true,
      lunch: true,
      dinner: true
    },
    amenities: ['wifi', 'ac', 'laundry', 'cctv', 'parking', 'gym', 'power-backup', 'water-purifier', 'tv', 'fridge', 'geyser', 'attached-bathroom', 'balcony'],
    rules: [
      'Executive environment',
      'Premium services',
      'Strict security'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        caption: 'Luxury suite'
      }
    ],
    gender: 'any',
    contactInfo: {
      phone: '9876543215',
      email: 'priya.sharma@example.com',
      whatsapp: '9876543215'
    }
  }
];

// Sample reviews data
const reviewsData = [
  {
    rating: 5,
    comment: 'Excellent PG with great amenities and friendly staff. Highly recommended!',
    tenant: null, // Will be set to user ID
    pg: null // Will be set to PG ID
  },
  {
    rating: 4,
    comment: 'Good location and clean rooms. Food quality could be better.',
    tenant: null,
    pg: null
  },
  {
    rating: 5,
    comment: 'Perfect for students. Safe environment and good facilities.',
    tenant: null,
    pg: null
  },
  {
    rating: 4,
    comment: 'Nice PG with modern amenities. Slightly expensive but worth it.',
    tenant: null,
    pg: null
  },
  {
    rating: 3,
    comment: 'Average PG. Location is good but maintenance could be better.',
    tenant: null,
    pg: null
  }
];

// Sample bookings data
const bookingsData = [
  {
    tenant: null, // Will be set to user ID
    pg: null, // Will be set to PG ID
    roomType: 'single',
    checkInDate: new Date('2024-02-01'),
    checkOutDate: new Date('2024-05-01'),
    duration: 3,
    pricing: {
      monthly: 8500,
      total: 25500,
      deposit: 10000,
      gst: 4590,
      final: 40090
    },
    status: 'confirmed',
    paymentStatus: 'paid'
  },
  {
    tenant: null,
    pg: null,
    roomType: 'double',
    checkInDate: new Date('2024-01-15'),
    checkOutDate: new Date('2024-04-15'),
    duration: 3,
    pricing: {
      monthly: 12000,
      total: 36000,
      deposit: 15000,
      gst: 6480,
      final: 57480
    },
    status: 'confirmed',
    paymentStatus: 'paid'
  }
];

// Clear existing data
const clearDatabase = async () => {
  try {
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await PG.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Create users
const createUsers = async () => {
  try {
    // Create users one by one to ensure password hashing works
    const users = [];
    for (const userData of usersData) {
      const user = new User(userData);
      await user.save(); // This will trigger the pre-save middleware to hash the password
      users.push(user);
    }
    console.log(`✅ Created ${users.length} users`);
    return users;
  } catch (error) {
    console.error('Error creating users:', error);
    return [];
  }
};

// Create PGs
const createPGs = async (owners) => {
  try {
    const ownerUsers = owners.filter(user => user.role === 'owner');
    const pgs = [];
    
    for (let i = 0; i < pgsData.length; i++) {
      const pgData = { ...pgsData[i] };
      pgData.owner = ownerUsers[i % ownerUsers.length]._id;
      
      const pg = await PG.create(pgData);
      pgs.push(pg);
    }
    
    console.log(`✅ Created ${pgs.length} PGs`);
    return pgs;
  } catch (error) {
    console.error('Error creating PGs:', error);
    return [];
  }
};

// Create reviews
const createReviews = async (users, pgs) => {
  try {
    const tenantUsers = users.filter(user => user.role === 'tenant');
    const reviews = [];
    
    for (let i = 0; i < reviewsData.length; i++) {
      const reviewData = { ...reviewsData[i] };
      reviewData.tenant = tenantUsers[i % tenantUsers.length]._id;
      reviewData.pg = pgs[i % pgs.length]._id;
      
      const review = await Review.create(reviewData);
      reviews.push(review);
    }
    
    console.log(`✅ Created ${reviews.length} reviews`);
    return reviews;
  } catch (error) {
    console.error('Error creating reviews:', error);
    return [];
  }
};

// Create bookings
const createBookings = async (users, pgs) => {
  try {
    const tenantUsers = users.filter(user => user.role === 'tenant');
    const bookings = [];
    
    for (let i = 0; i < bookingsData.length; i++) {
      const bookingData = { ...bookingsData[i] };
      bookingData.tenant = tenantUsers[i % tenantUsers.length]._id;
      bookingData.pg = pgs[i % pgs.length]._id;
      
      const booking = await Booking.create(bookingData);
      bookings.push(booking);
    }
    
    console.log(`✅ Created ${bookings.length} bookings`);
    return bookings;
  } catch (error) {
    console.error('Error creating bookings:', error);
    return [];
  }
};

// Update PG ratings
const updatePGRatings = async (pgs) => {
  try {
    for (const pg of pgs) {
      await pg.calculateAverageRating();
    }
    console.log('✅ Updated PG ratings');
  } catch (error) {
    console.error('Error updating PG ratings:', error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearDatabase();
    
    // Create users
    const users = await createUsers();
    
    // Create PGs
    const pgs = await createPGs(users);
    
    // Create reviews
    const reviews = await createReviews(users, pgs);
    
    // Create bookings
    const bookings = await createBookings(users, pgs);
    
    // Update PG ratings
    await updatePGRatings(pgs);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🏠 PGs: ${pgs.length}`);
    console.log(`⭐ Reviews: ${reviews.length}`);
    console.log(`📅 Bookings: ${bookings.length}`);
    
    console.log('\n🔑 User Credentials:');
    console.log('='.repeat(50));
    users.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / password123`);
    });
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding
seedDatabase();

