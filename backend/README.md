# 🏠 RentalMate Backend API

Complete MERN stack backend with MongoDB, Express.js, JWT authentication, Cloudinary integration, and Razorpay payment gateway.

## ✅ Features Implemented

### 🔐 Authentication & Authorization
- ✅ JWT-based authentication with access & refresh tokens
- ✅ Secure password hashing with bcrypt
- ✅ Role-based access control (Tenant, Owner, Admin)
- ✅ Google OAuth integration ready
- ✅ Token refresh mechanism
- ✅ Cookie-based session management

### 🗄️ Database & Models
- ✅ MongoDB connection with Mongoose
- ✅ User model with virtual relationships
- ✅ PG model with location, amenities, room types
- ✅ Booking model with payment tracking
- ✅ Review model with ratings breakdown
- ✅ Maintenance model with status tracking
- ✅ Proper indexing for performance

### 📸 Image Upload
- ✅ Multer middleware for file handling
- ✅ Cloudinary integration for cloud storage
- ✅ Image optimization & transformation
- ✅ Multiple image upload support
- ✅ Automatic cleanup on deletion

### 💳 Payment Integration
- ✅ Razorpay order creation
- ✅ Payment verification with signature
- ✅ Automatic discount calculation
- ✅ Refund logic for cancellations
- ✅ Payment status tracking

### 🔍 Advanced Features
- ✅ Dynamic filtering API (location, price, amenities, etc.)
- ✅ MongoDB aggregation pipelines
- ✅ Top-rated PGs with sorting
- ✅ Text search functionality
- ✅ Pagination support
- ✅ Statistics & analytics endpoints

### 🛡️ Security & Performance
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation with express-validator
- ✅ Error handling middleware
- ✅ Compression middleware
- ✅ Request logging with Morgan

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/rentalmate

# JWT
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

### 4. Run Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📚 API Endpoints

### Authentication (`/api/auth`)
```
POST   /register          - Register new user
POST   /login             - Login user
POST   /google            - Google OAuth login
GET    /me                - Get current user
POST   /logout            - Logout user
POST   /refresh-token     - Refresh access token
PUT    /update-profile    - Update user profile
PUT    /update-password   - Update password
```

### PGs (`/api/pgs`)
```
GET    /                  - Get all PGs (with filters)
GET    /top-rated         - Get top-rated PGs
GET    /:id               - Get single PG
POST   /                  - Create PG (Owner only)
PUT    /:id               - Update PG (Owner only)
DELETE /:id               - Delete PG (Owner only)
GET    /owner/my-pgs      - Get owner's PGs
GET    /:id/stats         - Get PG statistics
```

### Bookings (`/api/bookings`)
```
POST   /create-order      - Create Razorpay order
POST   /verify-payment    - Verify payment & create booking
GET    /                  - Get all bookings
GET    /:id               - Get single booking
PUT    /:id/status        - Update booking status (Owner)
PUT    /:id/cancel        - Cancel booking
GET    /stats/overview    - Get booking statistics
```

### Reviews (`/api/reviews`)
```
POST   /                  - Create review
GET    /pg/:pgId          - Get PG reviews
GET    /my-reviews        - Get user's reviews
PUT    /:id               - Update review
DELETE /:id               - Delete review
PUT    /:id/like          - Like/unlike review
PUT    /:id/response      - Owner response to review
```

### Maintenance (`/api/maintenance`)
```
POST   /                  - Create maintenance request
GET    /                  - Get maintenance requests
GET    /:id               - Get single request
PUT    /:id/status        - Update status (Owner)
PUT    /:id/feedback      - Add feedback (Tenant)
GET    /stats/overview    - Get maintenance statistics
```

## 🔍 Query Parameters

### PG Filtering
```
GET /api/pgs?city=Bangalore&minPrice=5000&maxPrice=15000&roomType=single&foodType=veg&amenities=wifi,ac&rating=4&sort=price-low&page=1&limit=12
```

### Sorting Options
- `price-low` - Price low to high
- `price-high` - Price high to low
- `rating` - Highest rated first
- `newest` - Newest first

## 🧪 Testing with Postman/Thunder Client

### 1. Register User
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "tenant"
}
```

### 2. Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```
Copy the `token` from response for authenticated requests.

### 3. Create PG (Owner)
```json
POST /api/pgs
Headers: Authorization: Bearer <token>
Body: form-data
{
  "name": "Sunshine PG",
  "description": "Best PG in town",
  "location": {
    "address": "123 Main St",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001"
  },
  "roomTypes": [
    {
      "type": "single",
      "price": 8000,
      "available": 5,
      "total": 10,
      "deposit": 8000
    }
  ],
  "foodType": "both",
  "amenities": ["wifi", "ac", "laundry"],
  "contactInfo": {
    "phone": "9876543210"
  },
  "images": [file1, file2, file3]
}
```

## 📊 Database Schema

### User
- Authentication & profile
- Role-based access
- Virtual relationships to PGs & bookings

### PG
- Complete property details
- Location with coordinates
- Multiple room types
- Amenities & rules
- Rating system

### Booking
- Booking lifecycle management
- Payment tracking
- Auto-calculated pricing
- Cancellation handling

### Review
- Multi-criteria ratings
- Verified reviews
- Owner responses
- Like system

### Maintenance
- Request tracking
- Status history
- Priority levels
- Feedback system

## 🔒 Security Features

1. **Authentication**
   - JWT tokens with expiration
   - Refresh token rotation
   - Secure password hashing

2. **Authorization**
   - Role-based middleware
   - Resource ownership checks
   - Admin privileges

3. **Input Validation**
   - Express-validator rules
   - Sanitization
   - Type checking

4. **Rate Limiting**
   - 100 requests per 15 minutes
   - Per-IP tracking

5. **Security Headers**
   - Helmet.js protection
   - CORS configuration
   - Cookie security

## 🎯 Aggregation Examples

### Top Rated PGs
```javascript
PG.aggregate([
  { $match: { isActive: true, 'rating.count': { $gte: 5 } } },
  { $sort: { 'rating.average': -1 } },
  { $limit: 10 }
])
```

### Booking Revenue
```javascript
Booking.aggregate([
  { $match: { owner: ownerId, 'payment.status': 'completed' } },
  { $group: {
    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
    revenue: { $sum: '$pricing.total' },
    count: { $sum: 1 }
  }}
])
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Cloudinary Upload Error
- Verify credentials in `.env`
- Check file size (max 5MB)
- Ensure file format is supported

### Razorpay Payment Error
- Use test keys for development
- Check webhook configuration
- Verify signature validation

## 📦 Dependencies

### Core
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables

### Authentication
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing
- `cookie-parser` - Cookie handling

### File Upload
- `multer` - File upload middleware
- `cloudinary` - Cloud storage

### Payment
- `razorpay` - Payment gateway

### Security
- `helmet` - Security headers
- `cors` - CORS handling
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation

### Utilities
- `compression` - Response compression
- `morgan` - HTTP logging

## 🚀 Deployment

### Heroku
```bash
heroku create rentalmate-api
heroku config:set MONGODB_URI=<your-mongodb-uri>
heroku config:set JWT_SECRET=<your-secret>
git push heroku main
```

### Vercel
```bash
npm i -g vercel
vercel
```

### Railway
```bash
railway login
railway init
railway up
```

## 📝 Environment Variables Checklist

- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] JWT_REFRESH_SECRET
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] RAZORPAY_KEY_ID
- [ ] RAZORPAY_KEY_SECRET
- [ ] FRONTEND_URL

## 🎉 Features Summary

✅ **Complete MERN Backend**
✅ **JWT Authentication**
✅ **Role-Based Access Control**
✅ **Cloudinary Image Upload**
✅ **Razorpay Payment Gateway**
✅ **Advanced Filtering & Search**
✅ **MongoDB Aggregation**
✅ **RESTful API Design**
✅ **Security Best Practices**
✅ **Error Handling**
✅ **Input Validation**
✅ **Rate Limiting**
✅ **Production Ready**

---

**Built with ❤️ for RentalMate**
