// Test script to verify backend API integration
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

const testEndpoints = async () => {
  console.log('🧪 Testing API Integration...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test PGs endpoint
    console.log('\n2. Testing PGs endpoint...');
    const pgsResponse = await fetch(`${API_BASE}/pgs`);
    const pgsData = await pgsResponse.json();
    console.log('✅ PGs endpoint:', `Found ${pgsData.count} PGs`);

    // Test top-rated PGs
    console.log('\n3. Testing top-rated PGs...');
    const topRatedResponse = await fetch(`${API_BASE}/pgs/top-rated`);
    const topRatedData = await topRatedResponse.json();
    console.log('✅ Top-rated PGs:', `Found ${topRatedData.count} top-rated PGs`);

    // Test single PG (if any PGs exist)
    if (pgsData.data && pgsData.data.length > 0) {
      console.log('\n4. Testing single PG endpoint...');
      const singlePGResponse = await fetch(`${API_BASE}/pgs/${pgsData.data[0]._id}`);
      const singlePGData = await singlePGResponse.json();
      console.log('✅ Single PG:', singlePGData.data.name);
    }

    console.log('\n🎉 All API tests passed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend server: cd backend && npm run dev');
    console.log('2. Start the frontend server: cd frontend && npm run dev');
    console.log('3. Seed the database: cd backend && npm run seed');
    console.log('4. Open http://localhost:5173 in your browser');
    console.log('5. Use credentials from user_credentials.txt to login');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the backend server is running on port 5000');
    console.log('2. Check if MongoDB is connected');
    console.log('3. Run the seed script to populate data');
  }
};

testEndpoints();

