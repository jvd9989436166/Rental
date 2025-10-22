// Detailed login debugging
import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const debugLoginDetailed = async () => {
  try {
    console.log('🔍 Detailed login debugging...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rentalmate');
    console.log('✅ Connected to MongoDB');
    
    const email = 'john.doe@example.com';
    const password = 'password123';
    
    console.log(`\n🔍 Looking for user with email: ${email}`);
    
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found!');
      
      // Let's see what users exist
      const allUsers = await User.find({}, 'name email role');
      console.log('\n👥 All users in database:');
      allUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.name} (${u.email}) - ${u.role}`);
      });
      return;
    }
    
    console.log('✅ User found:', {
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });
    
    if (!user.password) {
      console.log('❌ Password field is missing!');
      return;
    }
    
    console.log('\n🔐 Testing password comparison...');
    console.log(`Comparing: "${password}" with stored hash`);
    
    try {
      const isMatch = await user.comparePassword(password);
      console.log('Password match result:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');
      
      if (!isMatch) {
        console.log('💡 Password comparison failed. This could mean:');
        console.log('1. The password was not hashed correctly during seeding');
        console.log('2. The password field is corrupted');
        console.log('3. The comparePassword method has an issue');
        
        // Let's try to create a new user with the same password to test
        console.log('\n🧪 Testing with a new user...');
        const testUser = new User({
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          password: 'password123',
          role: 'tenant'
        });
        
        await testUser.save();
        console.log('✅ Test user created');
        
        const testMatch = await testUser.comparePassword('password123');
        console.log('Test user password match:', testMatch ? '✅ CORRECT' : '❌ INCORRECT');
        
        // Clean up test user
        await User.deleteOne({ email: 'test@example.com' });
        console.log('🧹 Test user cleaned up');
      }
      
    } catch (error) {
      console.log('❌ Password comparison error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

debugLoginDetailed();
