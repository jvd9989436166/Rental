// PG Detail Page Logic

let currentSlideIndex = 0;
let pgData = null;

// Mock PG Images
const pgImages = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800'
];

// Mock Reviews
const mockReviews = [
    {
        name: 'Priya Sharma',
        rating: 5,
        date: '2024-01-15',
        comment: 'Excellent PG with all amenities. The owner is very cooperative and the food quality is amazing. Highly recommended!',
        avatar: 'PS'
    },
    {
        name: 'Amit Kumar',
        rating: 4,
        date: '2024-01-10',
        comment: 'Good place to stay. Clean rooms and decent food. Location is convenient for office goers.',
        avatar: 'AK'
    },
    {
        name: 'Sneha Reddy',
        rating: 5,
        date: '2024-01-05',
        comment: 'Best PG I have stayed in Bangalore. Very safe for girls and the staff is friendly.',
        avatar: 'SR'
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPGDetails();
    loadImageCarousel();
    loadReviews();
});

// Load PG Details
function loadPGDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const pgId = urlParams.get('id');
    
    // Mock data (replace with API call)
    pgData = {
        id: pgId,
        name: 'Sunshine PG',
        location: 'Koramangala, Bangalore',
        rent: 7500,
        rating: 4.5,
        reviews: 120,
        distance: 2.3,
        roomType: 'Double Sharing',
        foodType: 'Vegetarian',
        description: 'Welcome to Sunshine PG, a premium accommodation facility in the heart of Koramangala. We offer comfortable living spaces with modern amenities, delicious home-cooked food, and a safe environment. Perfect for working professionals and students.',
        amenities: [
            { name: 'WiFi', icon: 'wifi', available: true },
            { name: 'Air Conditioning', icon: 'wind', available: true },
            { name: 'Laundry Service', icon: 'shirt', available: true },
            { name: 'Parking', icon: 'car', available: true },
            { name: 'Power Backup', icon: 'zap', available: true },
            { name: 'CCTV Security', icon: 'video', available: true },
            { name: 'Gym', icon: 'dumbbell', available: false },
            { name: 'Swimming Pool', icon: 'waves', available: false }
        ],
        securityDeposit: 15000
    };
    
    // Update UI
    document.getElementById('pgName').textContent = pgData.name;
    document.getElementById('pgLocation').textContent = pgData.location;
    document.getElementById('pgRating').textContent = pgData.rating;
    document.getElementById('pgReviews').textContent = `(${pgData.reviews} reviews)`;
    document.getElementById('pgDescription').textContent = pgData.description;
    document.getElementById('pgRoomType').textContent = pgData.roomType;
    document.getElementById('pgFoodType').textContent = pgData.foodType;
    document.getElementById('pgDistance').textContent = `${pgData.distance} km away`;
    document.getElementById('bookingRent').textContent = pgData.rent.toLocaleString();
    document.getElementById('securityDeposit').textContent = pgData.securityDeposit.toLocaleString();
    
    // Load amenities
    loadAmenities();
}

// Load Image Carousel
function loadImageCarousel() {
    const track = document.getElementById('carouselTrack');
    const thumbnailStrip = document.getElementById('thumbnailStrip');
    
    track.innerHTML = pgImages.map((img, index) => `
        <div class="carousel-slide">
            <img src="${img}" alt="PG Image ${index + 1}" class="w-full h-full object-cover">
        </div>
    `).join('');
    
    thumbnailStrip.innerHTML = pgImages.map((img, index) => `
        <img src="${img}" alt="Thumbnail ${index + 1}" 
             class="w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${index === 0 ? 'border-primary-600' : 'border-transparent'} hover:border-primary-400 transition-all"
             onclick="goToSlide(${index})">
    `).join('');
    
    document.getElementById('totalSlides').textContent = pgImages.length;
}

// Change Slide
function changeSlide(direction) {
    currentSlideIndex += direction;
    
    if (currentSlideIndex < 0) {
        currentSlideIndex = pgImages.length - 1;
    } else if (currentSlideIndex >= pgImages.length) {
        currentSlideIndex = 0;
    }
    
    updateCarousel();
}

// Go to Specific Slide
function goToSlide(index) {
    currentSlideIndex = index;
    updateCarousel();
}

// Update Carousel
function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    
    document.getElementById('currentSlide').textContent = currentSlideIndex + 1;
    
    // Update thumbnail borders
    const thumbnails = document.querySelectorAll('#thumbnailStrip img');
    thumbnails.forEach((thumb, index) => {
        if (index === currentSlideIndex) {
            thumb.classList.add('border-primary-600');
            thumb.classList.remove('border-transparent');
        } else {
            thumb.classList.remove('border-primary-600');
            thumb.classList.add('border-transparent');
        }
    });
}

// Toggle Zoom
function toggleZoom() {
    const carousel = document.getElementById('imageCarousel');
    carousel.classList.toggle('zoomed');
    // Implement full-screen zoom functionality
    showToast('Zoom feature coming soon!', 'success');
}

// Load Amenities
function loadAmenities() {
    const container = document.getElementById('amenitiesList');
    
    container.innerHTML = pgData.amenities.map(amenity => `
        <div class="flex items-center gap-3 p-4 ${amenity.available ? 'bg-green-50' : 'bg-gray-50'} rounded-lg">
            <i data-lucide="${amenity.icon}" class="w-6 h-6 ${amenity.available ? 'text-green-600' : 'text-gray-400'}"></i>
            <span class="${amenity.available ? 'text-gray-900' : 'text-gray-400'}">${amenity.name}</span>
            ${amenity.available ? 
                '<i data-lucide="check" class="w-5 h-5 text-green-600 ml-auto"></i>' : 
                '<i data-lucide="x" class="w-5 h-5 text-gray-400 ml-auto"></i>'}
        </div>
    `).join('');
    
    lucide.createIcons();
}

// Load Reviews
function loadReviews() {
    const container = document.getElementById('reviewsList');
    
    container.innerHTML = mockReviews.map(review => `
        <div class="p-4 border border-gray-200 rounded-lg">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-violet-600 rounded-full flex items-center justify-center text-white font-semibold">
                    ${review.avatar}
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                        <div>
                            <div class="font-semibold">${review.name}</div>
                            <div class="text-sm text-gray-600">${formatDate(review.date)}</div>
                        </div>
                        <div class="flex items-center gap-1">
                            ${Array(5).fill(0).map((_, i) => `
                                <i data-lucide="star" class="w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}"></i>
                            `).join('')}
                        </div>
                    </div>
                    <p class="text-gray-700">${review.comment}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

// Switch Tab
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'border-primary-600', 'text-primary-600');
    });
    
    // Show selected tab
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    // Add active class to selected button
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    activeBtn.classList.add('active', 'border-primary-600', 'text-primary-600');
}

// Book This PG
function bookThisPG() {
    const urlParams = new URLSearchParams(window.location.search);
    const pgId = urlParams.get('id');
    window.location.href = `booking.html?id=${pgId}`;
}

// Schedule Visit
function scheduleVisit() {
    showToast('Visit scheduling feature coming soon!', 'success');
}

// Share PG
function sharePG() {
    const url = window.location.href;
    shareContent('Check out this PG', `${pgData.name} - ${pgData.location}`, url);
}

// Call Owner
function callOwner() {
    window.location.href = 'tel:+919876543210';
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    }
});

// Auto-slide (optional)
let autoSlideInterval = setInterval(() => {
    changeSlide(1);
}, 5000);

// Pause auto-slide on hover
document.getElementById('imageCarousel')?.addEventListener('mouseenter', () => {
    clearInterval(autoSlideInterval);
});

document.getElementById('imageCarousel')?.addEventListener('mouseleave', () => {
    autoSlideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
});
