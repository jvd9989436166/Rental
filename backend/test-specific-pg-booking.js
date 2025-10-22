// Test booking with a specific PG ID
import mongoose from 'mongoose';
import User from './models/User.js';
import PG from './models/PG.js';
import Booking from './models/Booking.js';
import dotenv from 'dotenv';

dotenv.config();

const testSpecificPGBooking = async () => {
  try {
    console.log('🔍 Testing booking with specific PG...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rentalmate');
    console.log('✅ Connected to MongoDB');
    
    // Get all PGs to see what's available
    const allPGs = await PG.find({}, 'name location');
    console.log('📋 Available PGs:');
    allPGs.forEach((pg, index) => {
      console.log(`${index + 1}. ${pg.name} (ID: ${pg._id})`);
    });
    
    if (allPGs.length === 0) {
      console.log('❌ No PGs found in database');
      return;
    }
    
    // Use the first PG for testing
    const targetPG = allPGs[0];
    console.log(`\n🎯 Target PG: ${targetPG.name} (${targetPG._id})`);
    
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
    
    // Step 1: Create order with specific PG
    console.log('\n📤 Step 1: Creating order for specific PG...');
    const orderData = {
      pg: `dev_pg_${targetPG._id}`, // Use the specific PG ID
      roomType: 'single',
      checkIn: '2024-10-24',
      checkOut: '2024-10-29',
      monthlyRent: 8500,
      deposit: 5000
    };
    
    console.log('Order data:', orderData);
    
    const orderResponse = await fetch('http://localhost:5000/api/bookings/create-order', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    const orderResult = await orderResponse.json();
    console.log('Order creation status:', orderResponse.status);
    
    if (!orderResponse.ok) {
      console.log('❌ Order creation failed:', orderResult.message);
      return;
    }
    
    console.log('✅ Order created successfully!');
    
    // Step 2: Verify payment (complete booking)
    console.log('\n📤 Step 2: Verifying payment...');
    const paymentData = {
      razorpayOrderId: orderResult.data.orderId,
      razorpayPaymentId: `pay_dev_${Date.now()}`,
      razorpaySignature: 'dev_signature',
      pg: `dev_pg_${targetPG._id}`, // Use the same specific PG ID
      roomType: 'single',
      checkIn: '2024-10-24',
      checkOut: '2024-10-29',
      monthlyRent: 8500,
      deposit: 5000,
      discount: 0,
      total: 5000,
      tenantDetails: {
        name: tenant.name,
        phone: tenant.phone,
        email: tenant.email
      }
    };
    
    const paymentResponse = await fetch('http://localhost:5000/api/bookings/verify-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    
    const paymentResult = await paymentResponse.json();
    console.log('Payment verification status:', paymentResponse.status);
    
    if (!paymentResponse.ok) {
      console.log('❌ Payment verification failed:', paymentResult.message);
      return;
    }
    
    console.log('✅ Payment verified successfully!');
    console.log('Booking ID:', paymentResult.data._id);
    
    // Step 3: Check if the correct PG appears in bookings
    console.log('\n📋 Step 3: Checking if correct PG appears in bookings...');
    const bookingsResponse = await fetch('http://localhost:5000/api/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const bookingsResult = await bookingsResponse.json();
    
    if (bookingsResponse.ok) {
      console.log('✅ Bookings retrieved successfully!');
      console.log(`Found ${bookingsResult.count} bookings for tenant`);
      
      if (bookingsResult.data && bookingsResult.data.length > 0) {
        const latestBooking = bookingsResult.data[0];
        console.log('\n📋 Latest booking details:');
        console.log(`- Booking ID: ${latestBooking._id}`);
        console.log(`- PG Name: ${latestBooking.pg?.name || 'N/A'}`);
        console.log(`- PG ID: ${latestBooking.pg?._id || 'N/A'}`);
        console.log(`- Status: ${latestBooking.status}`);
        console.log(`- Check-in: ${new Date(latestBooking.checkIn).toLocaleDateString()}`);
        console.log(`- Check-out: ${new Date(latestBooking.checkOut).toLocaleDateString()}`);
        
        // Check if it's the correct PG
        if (latestBooking.pg?._id === targetPG._id.toString()) {
          console.log('✅ SUCCESS: Correct PG is showing in bookings!');
        } else {
          console.log('❌ ISSUE: Wrong PG is showing in bookings!');
          console.log(`Expected: ${targetPG.name} (${targetPG._id})`);
          console.log(`Got: ${latestBooking.pg?.name || 'N/A'} (${latestBooking.pg?._id || 'N/A'})`);
        }
      }
    } else {
      console.log('❌ Failed to retrieve bookings:', bookingsResult.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testSpecificPGBooking();
