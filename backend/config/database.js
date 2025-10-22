import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Use default MongoDB URI for development if not provided
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rentalmate';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    if (process.env.NODE_ENV === 'production') {
      console.log('❌ Production mode requires database connection');
      process.exit(1);
    } else {
      console.log('⚠️  Development mode: Continuing without database connection');
      console.log('💡 To use MongoDB in development:');
      console.log('   1. Install MongoDB: https://www.mongodb.com/try/download/community');
      console.log('   2. Start MongoDB service');
      console.log('   3. Or set MONGODB_URI environment variable');
    }
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error: ${err.message}`);
});

export default connectDB;
