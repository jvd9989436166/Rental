// Test the exact login controller logic
import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testLoginController = async () => {
  try {
    console.log('🔍 Testing login controller logic...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rentalmate');
    console.log('✅ Connected to MongoDB');
    
    const email = 'john.doe@example.com';
    const password = 'password123';
    
    console.log(`\n🔍 Simulating login controller...`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    // This is exactly what the login controller does
    const user = await User.findOne({ email }).select('+password');
    
    console.log('\n📊 User query result:');
    if (!user) {
      console.log('❌ User not found - this would return 401');
      return;
    }
    
    console.log('✅ User found:', {
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      hasPassword: !!user.password
    });
    
    console.log('\n🔐 Testing password comparison (exactly like controller)...');
    const isPasswordMatch = await user.comparePassword(password);
    
    console.log('Password match result:', isPasswordMatch ? '✅ CORRECT' : '❌ INCORRECT');
    
    if (!isPasswordMatch) {
      console.log('❌ This would return 401 - Invalid email or password');
      return;
    }
    
    console.log('\n🎫 Testing token generation...');
    try {
      const token = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();
      
      console.log('✅ Tokens generated successfully');
      console.log('Auth token preview:', token.substring(0, 50) + '...');
      console.log('Refresh token preview:', refreshToken.substring(0, 50) + '...');
      
      console.log('\n✅ Login would be successful!');
      console.log('User data that would be returned:', {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified
      });
      
    } catch (error) {
      console.log('❌ Token generation failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testLoginController();
