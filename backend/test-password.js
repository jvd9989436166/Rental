// Test password functionality
import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testPassword = async () => {
  try {
    console.log('🔍 Testing password functionality...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rentalmate');
    console.log('✅ Connected to MongoDB');
    
    // Find user with password field
    const user = await User.findOne({ email: 'john.doe@example.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      name: user.name,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });
    
    if (!user.password) {
      console.log('❌ Password field is missing!');
      console.log('💡 This means the password was not properly saved during seeding.');
      return;
    }
    
    // Test password comparison
    console.log('\n🔐 Testing password comparison...');
    try {
      const isMatch = await user.comparePassword('password123');
      console.log('Password match result:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');
    } catch (error) {
      console.log('❌ Password comparison failed:', error.message);
    }
    
    // Test token generation
    console.log('\n🎫 Testing token generation...');
    try {
      const token = user.generateAuthToken();
      console.log('✅ Token generated successfully');
      console.log('Token preview:', token.substring(0, 50) + '...');
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

testPassword();
