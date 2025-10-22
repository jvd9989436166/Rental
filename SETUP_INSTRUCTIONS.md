# RentalMate Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

## Quick Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Setup

Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rentalmate
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Database Seeding

Populate the database with sample data:
```bash
cd backend
npm run seed
```

This will create:
- 8 users (4 tenants, 3 owners, 1 admin)
- 5 PGs with realistic data
- Sample reviews and bookings

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

## User Credentials

Use any of these accounts to login:

### Tenant Accounts
- **john.doe@example.com** / password123
- **jane.smith@example.com** / password123
- **mike.johnson@example.com** / password123
- **sarah.wilson@example.com** / password123

### Owner Accounts
- **rajesh.kumar@example.com** / password123
- **priya.sharma@example.com** / password123
- **amit.patel@example.com** / password123

### Admin Account
- **admin@rentalmate.com** / admin123

## Features Available

### For Tenants
- Browse and search PGs
- View PG details with images, amenities, pricing
- Book PGs (booking flow)
- View booking history
- Rate and review PGs

### For Owners
- View dashboard with PG listings
- Add new PGs
- View analytics (views, ratings, occupancy)
- Manage bookings
- View tenant feedback

### For Admins
- Full access to all features
- User management
- PG approval system

## API Endpoints

### Public Endpoints
- `GET /api/pgs` - Get all PGs with filters
- `GET /api/pgs/top-rated` - Get top-rated PGs
- `GET /api/pgs/:id` - Get single PG details

### Protected Endpoints (require authentication)
- `GET /api/pgs/owner/my-pgs` - Get owner's PGs
- `POST /api/pgs` - Create new PG (Owner only)
- `PUT /api/pgs/:id` - Update PG (Owner only)
- `DELETE /api/pgs/:id` - Delete PG (Owner only)

## Testing

Run the integration test:
```bash
node test_integration.js
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

2. **CORS Errors**
   - Verify FRONTEND_URL in backend .env
   - Check if both servers are running

3. **Authentication Issues**
   - Clear browser storage
   - Check JWT_SECRET in .env

4. **Image Upload Issues**
   - Configure Cloudinary credentials
   - Check file size limits

### Reset Database
```bash
cd backend
npm run seed
```

This will clear existing data and repopulate with fresh sample data.

## Development Notes

- The application uses React with Vite for frontend
- Backend uses Express.js with MongoDB
- Authentication uses JWT tokens
- Images are stored on Cloudinary
- Payment integration ready for Razorpay

## File Structure

```
Rental/
├── backend/
│   ├── models/          # Database models
│   ├── controllers/     # API controllers
│   ├── routes/         # API routes
│   ├── middleware/      # Custom middleware
│   ├── config/         # Database and cloud configs
│   └── seed.js         # Database seeding script
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── store/      # State management
│   └── dist/           # Built files
└── user_credentials.txt # Login credentials
```

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check if MongoDB is running
5. Verify both frontend and backend servers are running

