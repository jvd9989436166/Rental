// Booking Flow Logic

let currentStep = 1;
let bookingData = {
    pgId: null,
    pgName: 'Sunshine PG',
    monthlyRent: 7500,
    securityDeposit: 15000,
    moveInDate: '',
    duration: 6,
    totalAmount: 0
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    bookingData.pgId = urlParams.get('id');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('moveInDate').setAttribute('min', today);
    
    calculateRent();
});

// Calculate Rent
function calculateRent() {
    const duration = parseInt(document.getElementById('duration').value);
    bookingData.duration = duration;
    
    const subtotal = bookingData.monthlyRent * duration;
    const discount = duration >= 12 ? subtotal * 0.1 : 0; // 10% discount for 12+ months
    bookingData.totalAmount = subtotal + bookingData.securityDeposit - discount;
    
    // Update summary
    document.getElementById('summaryMonthlyRent').textContent = bookingData.monthlyRent.toLocaleString();
    document.getElementById('summaryDuration').textContent = duration;
    document.getElementById('summaryDeposit').textContent = bookingData.securityDeposit.toLocaleString();
    document.getElementById('summaryTotal').textContent = bookingData.totalAmount.toLocaleString();
}

// Next Step
function nextStep(step) {
    // Validate current step
    if (currentStep === 1) {
        const moveInDate = document.getElementById('moveInDate').value;
        if (!moveInDate) {
            showToast('Please select a move-in date', 'error');
            return;
        }
        bookingData.moveInDate = moveInDate;
        
        // Update review section
        document.getElementById('reviewMoveInDate').textContent = formatDate(moveInDate);
        document.getElementById('reviewDuration').textContent = `${bookingData.duration} months`;
    }
    
    // Hide current step
    document.getElementById(`step${currentStep}`).classList.add('hidden');
    
    // Update progress
    updateProgress(step);
    
    // Show next step
    document.getElementById(`step${step}`).classList.remove('hidden');
    currentStep = step;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Previous Step
function prevStep(step) {
    document.getElementById(`step${currentStep}`).classList.add('hidden');
    updateProgress(step);
    document.getElementById(`step${step}`).classList.remove('hidden');
    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update Progress
function updateProgress(step) {
    for (let i = 1; i <= 4; i++) {
        const circle = document.getElementById(`step${i}Circle`);
        const line = document.getElementById(`step${i}Line`);
        
        if (i < step) {
            circle.classList.remove('bg-gray-300');
            circle.classList.add('bg-gradient-to-br', 'from-blue-600', 'to-purple-600');
            if (line) line.style.width = '100%';
        } else if (i === step) {
            circle.classList.remove('bg-gray-300');
            circle.classList.add('bg-gradient-to-br', 'from-blue-600', 'to-purple-600');
        } else {
            circle.classList.add('bg-gray-300');
            circle.classList.remove('bg-gradient-to-br', 'from-blue-600', 'to-purple-600');
            if (line) line.style.width = '0%';
        }
    }
}

// Process Payment (Development Mode)
function processPayment() {
    showLoader();
    
    // Simulate payment processing in development mode
    setTimeout(() => {
        hideLoader();
        
        // Development mode: Skip actual payment processing
        console.log('🔧 Development mode: Simulating payment processing');
        
        // Mock payment response for development
        const mockPaymentResponse = {
            razorpay_payment_id: 'pay_dev_' + Date.now(),
            razorpay_order_id: 'order_dev_' + Date.now(),
            razorpay_signature: 'dev_signature'
        };
        
        completeBooking(mockPaymentResponse);
    }, 2000);
}

// Complete Booking
function completeBooking(paymentResponse) {
    const bookingId = 'BK' + Date.now();
    
    // Check if it's a development mode payment
    const isDevelopment = paymentResponse.razorpay_payment_id.startsWith('pay_dev_');
    
    // Save booking to localStorage
    const booking = {
        id: bookingId,
        pgId: bookingData.pgId,
        pgName: bookingData.pgName,
        moveInDate: bookingData.moveInDate,
        duration: bookingData.duration,
        monthlyRent: bookingData.monthlyRent,
        totalAmount: bookingData.totalAmount,
        paymentId: paymentResponse.razorpay_payment_id,
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
        isDevelopment: isDevelopment
    };
    
    // Get existing bookings
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('userBookings', JSON.stringify(bookings));
    
    // Show success step
    nextStep(4);
    
    // Trigger confetti
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
    
    const successMessage = isDevelopment 
        ? 'Booking confirmed successfully! (Development Mode)' 
        : 'Booking confirmed successfully!';
    showToast(successMessage, 'success');
}

// Download Receipt
function downloadReceipt() {
    showToast('Receipt download feature coming soon!', 'success');
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}
