// Test bookings API with authentication
import mongoose from 'mongoose';
import User from './models/User.js';
import Booking from './models/Booking.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const testBookingsAPI = async () => {
  try {
    console.log('🔍 Testing bookings API...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rentalmate');
    console.log('✅ Connected to MongoDB');
    
    // Get a tenant user
    const tenant = await User.findOne({ role: 'tenant' });
    if (!tenant) {
      console.log('❌ No tenant found');
      return;
    }
    
    console.log('✅ Found tenant:', tenant.name);
    
    // Generate a token for the tenant
    const token = tenant.generateAuthToken();
    console.log('✅ Generated token for tenant');
    
    // Test the bookings API
    console.log('\n🧪 Testing /api/bookings endpoint...');
    
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (response.ok) {
        console.log('✅ Bookings API working!');
        console.log(`Found ${data.count} bookings for tenant`);
      } else {
        console.log('❌ Bookings API failed:', data.message);
      }
      
    } catch (error) {
      console.log('❌ API request failed:', error.message);
    }
    
    // Check bookings in database
    const bookings = await Booking.find({ tenant: tenant._id })
      .populate('pg', 'name location')
      .populate('owner', 'name');
    
    console.log('\n📋 Bookings in database for this tenant:');
    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.pg.name} - ${booking.status} (${booking.bookingId})`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testBookingsAPI();
