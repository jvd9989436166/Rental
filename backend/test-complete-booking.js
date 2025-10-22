// Test the complete booking flow
import mongoose from 'mongoose';
import User from './models/User.js';
import Booking from './models/Booking.js';
import dotenv from 'dotenv';

dotenv.config();

const testCompleteBooking = async () => {
  try {
    console.log('🔍 Testing complete booking flow...\n');
    
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
    
    // Step 1: Create order
    console.log('\n📤 Step 1: Creating order...');
    const orderData = {
      pg: 'dev_pg_68f91d186c742ee0b32ce6ad',
      roomType: 'single',
      checkIn: '2024-10-24',
      checkOut: '2024-10-29',
      monthlyRent: 8500,
      deposit: 5000
    };
    
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
    console.log('Order ID:', orderResult.data.orderId);
    
    // Step 2: Verify payment (complete booking)
    console.log('\n📤 Step 2: Verifying payment...');
    const paymentData = {
      razorpayOrderId: orderResult.data.orderId,
      razorpayPaymentId: `pay_dev_${Date.now()}`,
      razorpaySignature: 'dev_signature',
      pg: 'dev_pg_68f91d186c742ee0b32ce6ad',
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
    
    // Step 3: Check if booking appears in tenant's bookings
    console.log('\n📋 Step 3: Checking tenant bookings...');
    const bookingsResponse = await fetch('http://localhost:5000/api/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const bookingsResult = await bookingsResponse.json();
    console.log('Bookings status:', bookingsResponse.status);
    
    if (bookingsResponse.ok) {
      console.log('✅ Bookings retrieved successfully!');
      console.log(`Found ${bookingsResult.count} bookings for tenant`);
      
      if (bookingsResult.data && bookingsResult.data.length > 0) {
        const latestBooking = bookingsResult.data[0];
        console.log('\n📋 Latest booking:');
        console.log(`- Booking ID: ${latestBooking._id}`);
        console.log(`- Status: ${latestBooking.status}`);
        console.log(`- PG: ${latestBooking.pg?.name || 'Development PG'}`);
        console.log(`- Check-in: ${new Date(latestBooking.checkIn).toLocaleDateString()}`);
        console.log(`- Check-out: ${new Date(latestBooking.checkOut).toLocaleDateString()}`);
        console.log(`- Total: ₹${latestBooking.pricing?.total || 'N/A'}`);
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

testCompleteBooking();
