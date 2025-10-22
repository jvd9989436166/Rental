// Test if the running server can access the database
const testServerDB = async () => {
  console.log('🔍 Testing server database connection...\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/pgs');
    const data = await response.json();
    
    console.log('📊 PGs endpoint response:');
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Count:', data.count);
    console.log('Total:', data.total);
    
    if (data.data && data.data.length > 0) {
      console.log('\n✅ Server can access database and PGs exist');
      console.log('First PG:', data.data[0].name);
    } else {
      console.log('\n❌ No PGs found - database might not be seeded');
    }
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
  }
};

testServerDB();
