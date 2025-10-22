// Test login endpoint directly
import fetch from 'node-fetch';

const testLogin = async () => {
  console.log('🧪 Testing login endpoint...\n');
  
  const loginData = {
    email: 'john.doe@example.com',
    password: 'password123'
  };
  
  try {
    console.log('📤 Sending login request...');
    console.log('Data:', loginData);
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('\n📥 Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Login successful!');
      console.log('Token received:', data.token ? 'Yes' : 'No');
      console.log('User data:', data.user);
    } else {
      console.log('\n❌ Login failed!');
      console.log('Error:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('\n💡 Make sure the backend server is running:');
    console.log('cd backend && npm run dev');
  }
};

// Test different scenarios
const testScenarios = async () => {
  console.log('🧪 Testing different login scenarios...\n');
  
  const scenarios = [
    { email: 'john.doe@example.com', password: 'password123', description: 'Valid tenant' },
    { email: 'rajesh.kumar@example.com', password: 'password123', description: 'Valid owner' },
    { email: 'admin@rentalmate.com', password: 'admin123', description: 'Valid admin' },
    { email: 'nonexistent@example.com', password: 'password123', description: 'Invalid email' },
    { email: 'john.doe@example.com', password: 'wrongpassword', description: 'Invalid password' }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n🔍 Testing: ${scenario.description}`);
    console.log(`Email: ${scenario.email}`);
    console.log(`Password: ${scenario.password}`);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: scenario.email,
          password: scenario.password
        })
      });
      
      const data = await response.json();
      console.log(`Status: ${response.status} - ${response.ok ? 'SUCCESS' : 'FAILED'}`);
      console.log(`Message: ${data.message}`);
      
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
};

// Run tests
console.log('🚀 Starting login tests...\n');
testLogin().then(() => {
  console.log('\n' + '='.repeat(50));
  return testScenarios();
}).then(() => {
  console.log('\n🎉 All tests completed!');
});
