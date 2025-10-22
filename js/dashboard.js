// Dashboard Logic

// Load user bookings
function loadUserBookings() {
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const container = document.getElementById('bookingsList');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center py-8">No bookings yet. <a href="home.html" class="text-blue-600 hover:underline">Find a PG</a></p>';
        return;
    }
    
    // Display bookings (implementation here)
}

// View booking details
function viewBookingDetails(bookingId) {
    showToast('Viewing booking details...', 'success');
}

// Raise maintenance request
function raiseRequest(bookingId) {
    openMaintenanceModal();
}

// Open maintenance modal
function openMaintenanceModal() {
    showToast('Maintenance request feature coming soon!', 'success');
}

// Open review modal
function openReviewModal() {
    showToast('Review feature coming soon!', 'success');
}

// Owner Dashboard Functions
function openAddPGModal() {
    showToast('Add PG feature coming soon!', 'success');
}

function editPG(pgId) {
    showToast('Edit PG feature coming soon!', 'success');
}

function viewBookings(pgId) {
    showToast('Viewing bookings...', 'success');
}

function viewReviews(pgId) {
    showToast('Viewing reviews...', 'success');
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (user && user.name) {
        const nameElement = document.getElementById('userName');
        if (nameElement) {
            nameElement.textContent = user.name;
        }
    }
    
    // Load bookings if on tenant dashboard
    if (document.getElementById('bookingsList')) {
        loadUserBookings();
    }
});
