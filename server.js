// Simple Express Server for RentalMate

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/detail', (req, res) => {
    res.sendFile(path.join(__dirname, 'detail.html'));
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'booking.html'));
});

app.get('/tenant-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'tenant-dashboard.html'));
});

app.get('/owner-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'owner-dashboard.html'));
});

// API Routes (Mock)
app.get('/api/pgs', (req, res) => {
    // Return mock PG data
    res.json({
        success: true,
        data: []
    });
});

app.post('/api/bookings', (req, res) => {
    // Handle booking creation
    res.json({
        success: true,
        bookingId: 'BK' + Date.now()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 RentalMate server running on http://localhost:${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} in your browser`);
});
