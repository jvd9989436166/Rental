// Simple login test using built-in fetch (Node 18+)
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
    console.log('npm run dev');
  }
};

testLogin();
