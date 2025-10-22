// Debug login functionality
import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rentalmate');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugLogin = async () => {
  try {
    console.log('🔍 Debugging login functionality...\n');
    
    // Connect to database
    await connectDB();
    
    // Check if users exist
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('❌ No users found in database!');
      console.log('💡 Run: npm run seed');
      return;
    }
    
    // Check specific test user
    const testUser = await User.findOne({ email: 'john.doe@example.com' });
    if (testUser) {
      console.log('✅ Test user found:', {
        name: testUser.name,
        email: testUser.email,
        role: testUser.role,
        isVerified: testUser.isVerified
      });
      
      // Test password comparison
      const passwordMatch = await testUser.comparePassword('password123');
      console.log('🔐 Password match test:', passwordMatch ? '✅ PASS' : '❌ FAIL');
      
      // Test token generation
      try {
        const token = testUser.generateAuthToken();
        console.log('🎫 Token generation:', '✅ SUCCESS');
        console.log('Token preview:', token.substring(0, 50) + '...');
      } catch (error) {
        console.log('❌ Token generation failed:', error.message);
      }
    } else {
      console.log('❌ Test user not found!');
    }
    
    // List all users
    const allUsers = await User.find({}, 'name email role isVerified');
    console.log('\n👥 All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - Verified: ${user.isVerified}`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

debugLogin();
