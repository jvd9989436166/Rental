// Test booking creation with the exact data from frontend
import mongoose from 'mongoose';
import User from './models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const testBookingCreation = async () => {
  try {
    console.log('🔍 Testing booking creation...\n');
    
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
    
    // Test data that matches what frontend sends
    const bookingData = {
      pg: 'dev_pg_68f91d186c742ee0b32ce6ad',
      roomType: 'single',
      checkIn: '2024-10-24',
      checkOut: '2024-10-29',
      monthlyRent: 8500,
      deposit: 5000
    };
    
    console.log('\n📤 Sending booking creation request...');
    console.log('Data:', bookingData);
    
    try {
      const response = await fetch('http://localhost:5000/api/bookings/create-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });
      
      console.log('\n📥 Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (response.ok) {
        console.log('✅ Booking creation successful!');
        console.log('Order ID:', data.data.orderId);
        console.log('Total Amount:', data.data.total);
        console.log('Is Development:', data.data.isDevelopment);
      } else {
        console.log('❌ Booking creation failed:', data.message);
        if (data.errors) {
          console.log('Validation errors:');
          data.errors.forEach(error => {
            console.log(`- ${error.field}: ${error.message}`);
          });
        }
      }
      
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testBookingCreation();
