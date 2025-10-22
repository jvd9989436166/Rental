// Test the booking service from frontend perspective
const testBookingService = async () => {
  console.log('🧪 Testing booking service from frontend...\n');
  
  // First, let's test if we can get a token by logging in
  console.log('🔐 Step 1: Getting authentication token...');
  
  try {
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }
    
    console.log('✅ Login successful!');
    const token = loginData.token;
    console.log('Token received:', !!token);
    
    // Now test the bookings endpoint
    console.log('\n📋 Step 2: Testing bookings endpoint...');
    
    const bookingsResponse = await fetch('http://localhost:5000/api/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const bookingsData = await bookingsResponse.json();
    
    console.log('Bookings response status:', bookingsResponse.status);
    console.log('Bookings response:', JSON.stringify(bookingsData, null, 2));
    
    if (bookingsResponse.ok) {
      console.log('✅ Bookings API working from frontend!');
      console.log(`Found ${bookingsData.count} bookings`);
      
      if (bookingsData.data && bookingsData.data.length > 0) {
        const booking = bookingsData.data[0];
        console.log('\n📋 Sample booking:');
        console.log(`- PG: ${booking.pg.name}`);
        console.log(`- Status: ${booking.status}`);
        console.log(`- Check-in: ${new Date(booking.checkIn).toLocaleDateString()}`);
        console.log(`- Check-out: ${new Date(booking.checkOut).toLocaleDateString()}`);
        console.log(`- Price: ₹${booking.pricing.monthlyRent}/month`);
      }
    } else {
      console.log('❌ Bookings API failed:', bookingsData.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testBookingService();
