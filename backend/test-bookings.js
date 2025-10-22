// Test bookings functionality
import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import User from './models/User.js';
import PG from './models/PG.js';
import dotenv from 'dotenv';

dotenv.config();

const testBookings = async () => {
  try {
    console.log('🔍 Testing bookings functionality...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rentalmate');
    console.log('✅ Connected to MongoDB');
    
    // Check if bookings exist
    const bookingCount = await Booking.countDocuments();
    console.log(`📊 Total bookings in database: ${bookingCount}`);
    
    if (bookingCount === 0) {
      console.log('❌ No bookings found!');
      console.log('💡 This is why the tenant dashboard shows "Failed to load your bookings"');
      console.log('\n🔧 Let\'s create a test booking...');
      
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
      
      // Create a test booking
      const testBooking = new Booking({
        tenant: tenant._id,
        owner: owner._id,
        pg: pg._id,
        roomType: 'single',
        checkIn: new Date('2024-02-01'),
        checkOut: new Date('2024-05-01'),
        duration: 3,
        pricing: {
          monthly: 8500,
          total: 25500,
          deposit: 10000,
          gst: 4590,
          final: 40090
        },
        status: 'confirmed',
        paymentStatus: 'paid',
        bookingId: `BK${Date.now()}`
      });
      
      await testBooking.save();
      console.log('✅ Test booking created successfully!');
      
    } else {
      console.log('✅ Bookings found!');
      const bookings = await Booking.find()
        .populate('tenant', 'name email')
        .populate('pg', 'name')
        .populate('owner', 'name');
      
      console.log('\n📋 Existing bookings:');
      bookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.tenant.name} -> ${booking.pg.name} (${booking.status})`);
      });
    }
    
    // Test the API endpoint
    console.log('\n🧪 Testing bookings API endpoint...');
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': 'Bearer test-token', // This will fail but we can see the response
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response:', data);
      
    } catch (error) {
      console.log('API Test error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testBookings();
