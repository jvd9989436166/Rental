// Create a test booking with correct schema
import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import User from './models/User.js';
import PG from './models/PG.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestBooking = async () => {
  try {
    console.log('🔍 Creating test booking...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rentalmate');
    console.log('✅ Connected to MongoDB');
    
    // Get a tenant and PG
    const tenant = await User.findOne({ role: 'tenant' });
    const owner = await User.findOne({ role: 'owner' });
    const pg = await PG.findOne();
    
    if (!tenant || !owner || !pg) {
      console.log('❌ Missing required data for test booking');
      return;
    }
    
    console.log('✅ Found test data:', {
      tenant: tenant.name,
      owner: owner.name,
      pg: pg.name
    });
    
    // Create a test booking with correct schema
    const testBooking = new Booking({
      bookingId: `BK${Date.now()}`,
      tenant: tenant._id,
      owner: owner._id,
      pg: pg._id,
      roomType: 'single',
      checkIn: new Date('2024-02-01'),
      checkOut: new Date('2024-05-01'),
      duration: {
        months: 3,
        days: 0
      },
      pricing: {
        monthlyRent: 8500,
        deposit: 10000,
        discount: 0,
        total: 25500
      },
      payment: {
        method: 'cash',
        status: 'completed',
        paidAt: new Date()
      },
      status: 'confirmed',
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

createTestBooking();
