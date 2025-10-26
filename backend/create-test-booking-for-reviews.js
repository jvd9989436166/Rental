// Create a test booking for reviews
import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import User from './models/User.js';
import PG from './models/PG.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestBookingForReviews = async () => {
  try {
    console.log('🔍 Creating test booking for reviews...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rentalmate');
    console.log('✅ Connected to MongoDB');
    
    // Get a tenant and PG
    const tenant = await User.findOne({ role: 'tenant' });
    const pg = await PG.findOne();
    
    if (!tenant || !pg) {
      console.log('❌ Missing required data for test booking');
      return;
    }
    
    console.log('✅ Found test data:', {
      tenant: tenant.name,
      tenantEmail: tenant.email,
      pg: pg.name,
      pgOwner: pg.owner
    });
    
    // Check if booking already exists
    const existingBooking = await Booking.findOne({ 
      tenant: tenant._id, 
      pg: pg._id,
      status: { $in: ['completed', 'active'] }
    });
    
    if (existingBooking) {
      console.log('✅ Booking already exists for this tenant and PG');
      console.log('Booking ID:', existingBooking.bookingId);
      console.log('Status:', existingBooking.status);
      return;
    }
    
    // Create a test booking with correct schema
    const testBooking = new Booking({
      bookingId: `BK${Date.now()}`,
      tenant: tenant._id,
      owner: pg.owner,
      pg: pg._id,
      roomType: 'single',
      checkIn: new Date('2024-01-01'),
      checkOut: new Date('2024-04-01'),
      duration: {
        months: 3,
        days: 0
      },
      pricing: {
        monthlyRent: 8000,
        deposit: 10000,
        discount: 0,
        total: 24000
      },
      payment: {
        method: 'cash',
        status: 'completed',
        paidAt: new Date()
      },
      status: 'completed', // This is key - must be 'completed' or 'active' for reviews
      tenantDetails: {
        name: tenant.name,
        phone: tenant.phone,
        email: tenant.email
      }
    });
    
    await testBooking.save();
    console.log('✅ Test booking created successfully!');
    console.log('Booking ID:', testBooking.bookingId);
    console.log('Status:', testBooking.status);
    console.log('Tenant:', tenant.name);
    console.log('PG:', pg.name);
    console.log('\n🎉 Now the tenant can write reviews for this PG!');
    
  } catch (error) {
    console.error('❌ Failed to create booking:', error.message);
    if (error.errors) {
      console.log('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.log(`- ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

createTestBookingForReviews();
