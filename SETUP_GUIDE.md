# 🏠 RentalMate - Setup Guide

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A modern web browser (Chrome, Firefox, Safari, Edge)
- (Optional) Firebase account for production deployment

## 🚀 Quick Start

### Option 1: Simple HTML Setup (No Installation Required)

1. **Open the project folder**
   ```bash
   cd Rental
   ```

2. **Open `index.html` directly in your browser**
   - Right-click on `index.html` → Open with → Your Browser
   - Or simply double-click `index.html`

3. **That's it!** The application uses CDN links for all dependencies, so no installation needed.

### Option 2: Using Node.js Server

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```

3. **Open your browser**
   - Navigate to `http://localhost:3000`

### Option 3: Using JSON Server (Mock Backend)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start JSON Server**
   ```bash
   npm run json-server
   ```
   This will start a mock REST API at `http://localhost:3001`

3. **In another terminal, start the main server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`

## 🔥 Firebase Setup (Optional - For Production)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: "RentalMate"
4. Follow the setup wizard

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable the following sign-in methods:
   - Email/Password
   - Google
   - Phone (optional)

### Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select your region

### Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>)
4. Register your app
5. Copy the Firebase configuration object

### Step 5: Update Configuration

Open `js/firebase-config.js` and replace with your config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 6: Add Firebase SDK

Add these script tags to your HTML files (before closing `</body>`):

```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
```

## 📁 Project Structure

```
RentalMate/
├── index.html              # Landing page
├── home.html               # Explore/Search page
├── detail.html             # PG detail page
├── booking.html            # Booking flow
├── tenant-dashboard.html   # Tenant dashboard
├── owner-dashboard.html    # Owner dashboard
├── css/
│   └── styles.css         # Custom styles & animations
├── js/
│   ├── app.js             # Main application logic
│   ├── auth.js            # Authentication
│   ├── search.js          # Search & filtering
│   ├── detail.js          # Detail page logic
│   ├── booking.js         # Booking flow
│   ├── dashboard.js       # Dashboard logic
│   └── firebase-config.js # Firebase configuration
├── db.json                # JSON Server mock data
├── server.js              # Express server
├── sw.js                  # Service Worker (PWA)
├── package.json           # Dependencies
└── README.md              # Documentation
```

## 🎨 Features Implemented

### ✅ Landing Page
- Gradient hero section with animations
- Feature cards with hover effects
- Smooth scrolling navigation
- Login/Signup modals
- Role selection (Owner/Tenant)

### ✅ Home/Explore Page
- Smart search with natural language processing
- Advanced filters (location, budget, room type, food type)
- Top-rated PG carousel (auto-slide)
- PG card grid with hover animations
- Infinite scroll/pagination
- Sort functionality

### ✅ PG Detail Page
- Image carousel with zoom
- Tabbed interface (Overview, Amenities, Food, Rules, Contact)
- Animated rating bars
- Review section
- Sticky booking card
- Share functionality

### ✅ Booking Flow
- 4-step booking process
- Duration selection with auto-calculation
- Review details
- Mock Razorpay payment integration
- Confetti animation on success
- Booking confirmation

### ✅ Tenant Dashboard
- Active bookings overview
- Payment history
- Quick actions
- Maintenance requests
- Review system

### ✅ Owner Dashboard
- Property management
- Revenue analytics with Chart.js
- Occupancy tracking
- Booking management
- Tenant feedback

## 🎯 Key Technologies

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS (CDN)
- **Icons**: Lucide Icons
- **Animations**: CSS Animations, Lottie
- **Charts**: Chart.js
- **Confetti**: Canvas Confetti
- **Backend**: Express.js / JSON Server / Firebase
- **PWA**: Service Worker for offline caching

## 🌟 Special Features

### Smart Search
The search understands natural language queries like:
- "PGs under ₹8000 near IT Park"
- "Single room with WiFi"
- "2 sharing with food included"

### Dynamic Gradient Theme
Background gradients change based on time of day:
- Morning (6 AM - 12 PM): Light blues
- Afternoon (12 PM - 6 PM): Bright colors
- Evening (6 PM - 10 PM): Warm colors
- Night (10 PM - 6 AM): Dark blues

### Animations
- Fade-in on scroll
- Hover lift effects on cards
- Ripple button effects
- Smooth page transitions
- Loading spinners
- Confetti celebrations

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Touch-friendly interactions
- Optimized for all devices

## 🔧 Customization

### Change Colors
Edit the Tailwind config in each HTML file:
```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: { 500: '#YOUR_COLOR' },
                violet: { 500: '#YOUR_COLOR' }
            }
        }
    }
}
```

### Add More PGs
Edit `db.json` or add to `js/search.js` mockPGData array.

### Modify Animations
Edit `css/styles.css` to customize animations.

## 🐛 Troubleshooting

### Issue: Icons not showing
**Solution**: Make sure Lucide script is loaded and `lucide.createIcons()` is called.

### Issue: Styles not applying
**Solution**: Check if Tailwind CDN is loaded properly. Clear browser cache.

### Issue: Firebase not working
**Solution**: Verify Firebase config is correct and SDK scripts are loaded.

### Issue: JSON Server not starting
**Solution**: Make sure port 3001 is not in use. Try `npx json-server --watch db.json --port 3002`

## 📱 Testing

### Test User Accounts
- **Tenant**: john@example.com / password123
- **Owner**: rajesh@example.com / password123

### Test Booking Flow
1. Go to home page
2. Click on any PG card
3. Click "Book Instantly"
4. Fill in details
5. Complete mock payment

## 🚀 Deployment

### Deploy to Netlify
1. Create account on [Netlify](https://netlify.com)
2. Drag and drop your project folder
3. Done!

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts

### Deploy to Firebase Hosting
1. Install Firebase CLI: `npm i -g firebase-tools`
2. Run: `firebase login`
3. Run: `firebase init hosting`
4. Run: `firebase deploy`

## 📞 Support

For issues or questions:
- Check the README.md
- Review the code comments
- Test with browser console open for debugging

## 🎉 Enjoy Building!

Your RentalMate platform is ready to use. Start exploring, customize, and deploy!
