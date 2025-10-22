// Test login functionality from frontend
const testLogin = async () => {
  console.log('🧪 Testing login from frontend...');
  
  const loginData = {
    email: 'john.doe@example.com',
    password: 'password123'
  };
  
  try {
    console.log('📤 Sending login request to:', 'http://localhost:5000/api/auth/login');
    console.log('Data:', loginData);
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token ? 'Present' : 'Missing');
      console.log('User:', data.user);
      console.log('Refresh Token:', data.refreshToken ? 'Present' : 'Missing');
      
      // Test if we can use the token
      if (data.token) {
        console.log('🔍 Testing token usage...');
        const meResponse = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (meResponse.ok) {
          const meData = await meResponse.json();
          console.log('✅ Token works! User data:', meData);
        } else {
          console.log('❌ Token validation failed:', meResponse.status);
        }
      }
    } else {
      console.log('❌ Login failed!');
      console.log('Error:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('💡 Make sure the backend server is running on port 5000');
  }
};

// Run the test
testLogin();
