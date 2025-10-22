// Test complete booking flow
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'john.doe@example.com',
  password: 'password123'
};

let authToken = '';

// Step 1: Login to get authentication token
const login = async () => {
  console.log('🔐 Step 1: Logging in...');
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      authToken = data.token;
      console.log('✅ Login successful!');
      console.log(`👤 User: ${data.user.name} (${data.user.role})`);
      console.log(`🔑 Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
};

// Step 2: Create booking order
const createOrder = async () => {
  console.log('\n📋 Step 2: Creating booking order...');
  
  const orderData = {
    pg: '68f921cadd663ba1b384eef8',
    roomType: 'single',
    checkIn: '2024-11-01',
    checkOut: '2024-12-01',
    monthlyRent: 8500,
    deposit: 5000
  };

  try {
    const response = await fetch(`${API_BASE}/bookings/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Order created successfully!');
      console.log(`🆔 Order ID: ${data.data.orderId}`);
      console.log(`💰 Total Amount: ₹${data.data.total}`);
      console.log(`🎯 Discount: ${data.data.discount}%`);
      console.log(`🔧 Development Mode: ${data.data.isDevelopment ? 'Yes' : 'No'}`);
      return data.data;
    } else {
      console.log('❌ Order creation failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Order creation error:', error.message);
    return null;
  }
};

// Step 3: Verify payment and complete booking
const verifyPayment = async (orderData) => {
  console.log('\n💳 Step 3: Verifying payment and completing booking...');
  
  const paymentData = {
    razorpayOrderId: orderData.orderId,
    razorpayPaymentId: `pay_dev_${Date.now()}`,
    razorpaySignature: 'dev_signature',
    pg: '68f921cadd663ba1b384eef8',
    roomType: 'single',
    checkIn: '2024-11-01',
    checkOut: '2024-12-01',
    monthlyRent: 8500,
    deposit: 5000,
    discount: orderData.discount || 0,
    total: orderData.total,
    tenantDetails: {
      name: 'John Doe',
      phone: '9876543210',
      email: 'john.doe@example.com'
    }
  };

  try {
    const response = await fetch(`${API_BASE}/bookings/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Booking completed successfully!');
      console.log(`🆔 Booking ID: ${data.data.bookingId}`);
      console.log(`📅 Check-in: ${data.data.checkIn}`);
      console.log(`📅 Check-out: ${data.data.checkOut}`);
      console.log(`🏠 PG: ${data.data.pg.name}`);
      console.log(`👤 Tenant: ${data.data.tenant.name}`);
      console.log(`💰 Total Paid: ₹${data.data.pricing.total}`);
      console.log(`📊 Status: ${data.data.status}`);
      return data.data;
    } else {
      console.log('❌ Payment verification failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Payment verification error:', error.message);
    return null;
  }
};

// Step 4: Get user's bookings
const getBookings = async () => {
  console.log('\n📚 Step 4: Fetching user bookings...');
  
  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Bookings fetched successfully!');
      console.log(`📊 Total bookings: ${data.total}`);
      console.log(`📄 Current page: ${data.currentPage}`);
      
      if (data.data && data.data.length > 0) {
        console.log('\n📋 Recent bookings:');
        data.data.forEach((booking, index) => {
          console.log(`  ${index + 1}. ${booking.bookingId} - ${booking.status} - ₹${booking.pricing.total}`);
        });
      } else {
        console.log('📭 No bookings found');
      }
      return data.data;
    } else {
      console.log('❌ Failed to fetch bookings:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Fetch bookings error:', error.message);
    return null;
  }
};

// Run complete test flow
const runBookingTest = async () => {
  console.log('🚀 Starting Complete Booking Flow Test\n');
  console.log('='.repeat(60));
  
  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Test failed at login step');
    return;
  }
  
  // Step 2: Create order
  const orderData = await createOrder();
  if (!orderData) {
    console.log('\n❌ Test failed at order creation step');
    return;
  }
  
  // Step 3: Verify payment
  const booking = await verifyPayment(orderData);
  if (!booking) {
    console.log('\n❌ Test failed at payment verification step');
    return;
  }
  
  // Step 4: Get bookings
  await getBookings();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Complete booking flow test completed successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Open http://localhost:5173/test-login');
  console.log('   2. Login as John Doe (Tenant)');
  console.log('   3. Go to /explore to find PGs');
  console.log('   4. Click "Book Instantly" on any PG');
  console.log('   5. Complete the booking process');
};

// Run the test
runBookingTest().catch(console.error);
