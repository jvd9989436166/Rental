// Create a second test booking for reviews
import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import User from './models/User.js';
import PG from './models/PG.js';
import dotenv from 'dotenv';

dotenv.config();

const createSecondBooking = async () => {
  try {
    console.log('🔍 Creating second test booking...\n');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rentalmate');
    console.log('✅ Connected to MongoDB');
    
    // Get all tenants and PGs
    const tenants = await User.find({ role: 'tenant' });
    const pgs = await PG.find();
    
    if (tenants.length < 2 || pgs.length < 2) {
      console.log('❌ Not enough data for second booking');
      return;
    }
    
    const tenant = tenants[1]; // Second tenant
    const pg = pgs[1]; // Second PG
    
    console.log('✅ Creating booking for:', {
      tenant: tenant.name,
      tenantEmail: tenant.email,
      pg: pg.name
    });
    
    // Check if booking already exists
    const existingBooking = await Booking.findOne({ 
      tenant: tenant._id, 
      pg: pg._id,
      status: { $in: ['completed', 'active'] }
    });
    
    if (existingBooking) {
      console.log('✅ Booking already exists for this tenant and PG');
      return;
    }
    
    const testBooking = new Booking({
      bookingId: `BK${Date.now()}`,
      tenant: tenant._id,
      owner: pg.owner,
      pg: pg._id,
      roomType: 'double',
      checkIn: new Date('2024-02-01'),
      checkOut: new Date('2024-05-01'),
      duration: { months: 3, days: 0 },
      pricing: {
        monthlyRent: 7000,
        deposit: 8000,
        discount: 0,
        total: 21000
      },
      payment: {
        method: 'cash',
        status: 'completed',
        paidAt: new Date()
      },
      status: 'completed',
      tenantDetails: {
        name: tenant.name,
        phone: tenant.phone,
        email: tenant.email
      }
    });
    
    await testBooking.save();
    console.log('✅ Second booking created successfully!');
    console.log('Booking ID:', testBooking.bookingId);
    console.log('Tenant:', tenant.name);
    console.log('PG:', pg.name);
    
  } catch (error) {
    console.error('❌ Failed to create booking:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

createSecondBooking();
