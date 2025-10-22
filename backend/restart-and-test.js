// Script to restart server and test login
import { spawn } from 'child_process';
import fetch from 'node-fetch';

const restartServerAndTest = async () => {
  console.log('🔄 Restarting server and testing login...\n');
  
  // Kill any existing server process
  console.log('🛑 Stopping existing server...');
  
  // Start server in background
  console.log('🚀 Starting server...');
  const server = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true
  });
  
  // Wait for server to start
  console.log('⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test login
  console.log('🧪 Testing login...');
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('📊 Login test result:');
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Message:', data.message);
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Token received:', !!data.token);
      console.log('User:', data.user?.name);
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  // Stop server
  console.log('\n🛑 Stopping server...');
  server.kill();
};

restartServerAndTest();
