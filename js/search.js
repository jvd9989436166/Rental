// Search and Listing Module

let currentPage = 1;
let allPGs = [];
let filteredPGs = [];
let carouselIndex = 0;

// Mock PG Data (Replace with API calls)
const mockPGData = [
    {
        id: 1,
        name: "Sunshine PG",
        location: "Koramangala, Bangalore",
        rent: 7500,
        rating: 4.5,
        reviews: 120,
        distance: 2.3,
        roomType: "double",
        foodType: "veg",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
        amenities: ["WiFi", "AC", "Laundry", "Parking"],
        verified: true,
        featured: true
    },
    {
        id: 2,
        name: "Green Valley Residency",
        location: "HSR Layout, Bangalore",
        rent: 6000,
        rating: 4.2,
        reviews: 85,
        distance: 3.1,
        roomType: "triple",
        foodType: "both",
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
        amenities: ["WiFi", "Gym", "Food", "Security"],
        verified: true,
        featured: true
    },
    {
        id: 3,
        name: "Royal Stay PG",
        location: "Indiranagar, Bangalore",
        rent: 9500,
        rating: 4.7,
        reviews: 200,
        distance: 1.5,
        roomType: "single",
        foodType: "veg",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
        amenities: ["WiFi", "AC", "Food", "Laundry", "Parking"],
        verified: true,
        featured: true
    },
    {
        id: 4,
        name: "Comfort Zone",
        location: "Whitefield, Bangalore",
        rent: 5500,
        rating: 4.0,
        reviews: 65,
        distance: 8.2,
        roomType: "double",
        foodType: "nonveg",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
        amenities: ["WiFi", "Laundry", "Security"],
        verified: true,
        featured: false
    },
    {
        id: 5,
        name: "Elite Living",
        location: "Electronic City, Bangalore",
        rent: 8000,
        rating: 4.4,
        reviews: 110,
        distance: 12.5,
        roomType: "single",
        foodType: "both",
        image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=400",
        amenities: ["WiFi", "AC", "Gym", "Food", "Parking"],
        verified: true,
        featured: false
    },
    {
        id: 6,
        name: "Happy Homes",
        location: "Marathahalli, Bangalore",
        rent: 6500,
        rating: 4.3,
        reviews: 95,
        distance: 5.8,
        roomType: "double",
        foodType: "veg",
        image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400",
        amenities: ["WiFi", "Food", "Laundry", "Security"],
        verified: true,
        featured: false
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    allPGs = [...mockPGData];
    filteredPGs = [...mockPGData];
    loadTopRatedCarousel();
    loadPGListings();
    startAutoSlide();
});

// Load Top Rated Carousel
function loadTopRatedCarousel() {
    const carousel = document.getElementById('topRatedCarousel');
    const topRated = allPGs.filter(pg => pg.featured).slice(0, 5);
    
    carousel.innerHTML = topRated.map(pg => `
        <div class="carousel-slide min-w-full md:min-w-[calc(33.333%-1rem)]">
            ${createPGCard(pg, true)}
        </div>
    `).join('');
}

// Create PG Card
function createPGCard(pg, isCarousel = false) {
    return `
        <div class="pg-card bg-white rounded-xl overflow-hidden shadow-md cursor-pointer" onclick="viewPGDetail(${pg.id})">
            <div class="relative h-48 overflow-hidden">
                <img src="${pg.image}" alt="${pg.name}" class="w-full h-full object-cover">
                ${pg.verified ? '<div class="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1"><i data-lucide="shield-check" class="w-3 h-3"></i> Verified</div>' : ''}
                <div class="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1">
                    <i data-lucide="star" class="w-4 h-4 text-yellow-500 fill-yellow-500"></i>
                    <span class="font-semibold">${pg.rating}</span>
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-xl font-semibold text-gray-900 mb-1">${pg.name}</h3>
                <div class="flex items-center text-gray-600 text-sm mb-2">
                    <i data-lucide="map-pin" class="w-4 h-4 mr-1"></i>
                    ${pg.location}
                </div>
                <div class="flex items-center justify-between mb-3">
                    <div class="text-2xl font-bold text-primary-600">₹${pg.rent.toLocaleString()}<span class="text-sm text-gray-500 font-normal">/month</span></div>
                    <div class="text-sm text-gray-600">${pg.distance} km away</div>
                </div>
                <div class="flex flex-wrap gap-2 mb-3">
                    ${pg.amenities.slice(0, 3).map(amenity => `
                        <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">${amenity}</span>
                    `).join('')}
                    ${pg.amenities.length > 3 ? `<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">+${pg.amenities.length - 3}</span>` : ''}
                </div>
                <div class="pg-card-details">
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span><i data-lucide="users" class="w-4 h-4 inline mr-1"></i> ${pg.roomType.charAt(0).toUpperCase() + pg.roomType.slice(1)} Sharing</span>
                        <span><i data-lucide="utensils" class="w-4 h-4 inline mr-1"></i> ${pg.foodType.charAt(0).toUpperCase() + pg.foodType.slice(1)}</span>
                    </div>
                    <button onclick="event.stopPropagation(); bookNow(${pg.id})" class="w-full px-4 py-2 bg-gradient-to-r from-primary-600 to-violet-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all ripple">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Load PG Listings
function loadPGListings() {
    const container = document.getElementById('pgListings');
    const itemsPerPage = 6;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pgsToShow = filteredPGs.slice(startIndex, endIndex);
    
    if (currentPage === 1) {
        container.innerHTML = pgsToShow.map(pg => createPGCard(pg)).join('');
    } else {
        container.innerHTML += pgsToShow.map(pg => createPGCard(pg)).join('');
    }
    
    // Update result count
    document.getElementById('resultCount').textContent = `(${filteredPGs.length} results)`;
    
    // Hide load more button if no more items
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (endIndex >= filteredPGs.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
    
    // Reinitialize Lucide icons
    lucide.createIcons();
}

// Load More PGs
function loadMorePGs() {
    currentPage++;
    loadPGListings();
}

// Carousel Functions
function slideCarousel(direction) {
    const carousel = document.getElementById('topRatedCarousel');
    const slides = carousel.children;
    const totalSlides = slides.length;
    
    if (direction === 'next') {
        carouselIndex = (carouselIndex + 1) % totalSlides;
    } else {
        carouselIndex = (carouselIndex - 1 + totalSlides) % totalSlides;
    }
    
    carousel.style.transform = `translateX(-${carouselIndex * 100}%)`;
}

function startAutoSlide() {
    setInterval(() => {
        slideCarousel('next');
    }, 5000);
}

// Smart Search
function performSmartSearch() {
    const query = document.getElementById('smartSearch').value.toLowerCase();
    
    if (!query) {
        filteredPGs = [...allPGs];
        currentPage = 1;
        loadPGListings();
        return;
    }
    
    // Parse natural language query
    filteredPGs = allPGs.filter(pg => {
        // Extract budget from query
        const budgetMatch = query.match(/under\s*₹?\s*(\d+)/i);
        if (budgetMatch && pg.rent > parseInt(budgetMatch[1])) {
            return false;
        }
        
        // Check location
        if (query.includes('near') || query.includes('in')) {
            const locationKeywords = query.split(/near|in/)[1]?.trim().split(' ')[0];
            if (locationKeywords && !pg.location.toLowerCase().includes(locationKeywords)) {
                return false;
            }
        }
        
        // Check room type
        if (query.includes('single') && pg.roomType !== 'single') return false;
        if (query.includes('double') && pg.roomType !== 'double') return false;
        if (query.includes('triple') && pg.roomType !== 'triple') return false;
        
        // Check amenities
        if (query.includes('wifi') && !pg.amenities.some(a => a.toLowerCase().includes('wifi'))) return false;
        if (query.includes('ac') && !pg.amenities.some(a => a.toLowerCase().includes('ac'))) return false;
        if (query.includes('food') && !pg.amenities.some(a => a.toLowerCase().includes('food'))) return false;
        
        // General text search
        return pg.name.toLowerCase().includes(query) || 
               pg.location.toLowerCase().includes(query) ||
               pg.amenities.some(a => a.toLowerCase().includes(query));
    });
    
    currentPage = 1;
    loadPGListings();
    showToast(`Found ${filteredPGs.length} PGs matching your search`, 'success');
}

// Quick Filters
function applyQuickFilter(type, value) {
    if (type === 'budget') {
        filteredPGs = allPGs.filter(pg => pg.rent <= parseInt(value));
    } else if (type === 'roomType') {
        filteredPGs = allPGs.filter(pg => pg.roomType === value);
    } else if (type === 'amenity') {
        filteredPGs = allPGs.filter(pg => 
            pg.amenities.some(a => a.toLowerCase().includes(value.toLowerCase()))
        );
    } else if (type === 'food') {
        filteredPGs = allPGs.filter(pg => pg.foodType === value || pg.foodType === 'both');
    }
    
    currentPage = 1;
    loadPGListings();
}

// Toggle Filters
function toggleFilters() {
    const panel = document.getElementById('filterPanel');
    if (panel.classList.contains('collapsed')) {
        panel.classList.remove('collapsed');
        panel.classList.add('expanded');
    } else {
        panel.classList.add('collapsed');
        panel.classList.remove('expanded');
    }
}

// Apply Filters
function applyFilters() {
    const location = document.getElementById('filterLocation').value.toLowerCase();
    const budget = document.getElementById('filterBudget').value;
    const roomType = document.getElementById('filterRoomType').value;
    const foodType = document.getElementById('filterFoodType').value;
    
    filteredPGs = allPGs.filter(pg => {
        if (location && !pg.location.toLowerCase().includes(location)) return false;
        if (budget && pg.rent > parseInt(budget)) return false;
        if (roomType && pg.roomType !== roomType) return false;
        if (foodType && pg.foodType !== foodType && pg.foodType !== 'both') return false;
        return true;
    });
    
    currentPage = 1;
    loadPGListings();
    toggleFilters();
    showToast(`Applied filters - ${filteredPGs.length} results found`, 'success');
}

// Reset Filters
function resetFilters() {
    document.getElementById('filterLocation').value = '';
    document.getElementById('filterBudget').value = '';
    document.getElementById('filterRoomType').value = '';
    document.getElementById('filterFoodType').value = '';
    filteredPGs = [...allPGs];
    currentPage = 1;
    loadPGListings();
    toggleFilters();
}

// Sort Listings
function sortListings() {
    const sortBy = document.getElementById('sortBy').value;
    
    switch(sortBy) {
        case 'price-low':
            filteredPGs.sort((a, b) => a.rent - b.rent);
            break;
        case 'price-high':
            filteredPGs.sort((a, b) => b.rent - a.rent);
            break;
        case 'rating':
            filteredPGs.sort((a, b) => b.rating - a.rating);
            break;
        case 'distance':
            filteredPGs.sort((a, b) => a.distance - b.distance);
            break;
        default:
            filteredPGs = [...allPGs];
    }
    
    currentPage = 1;
    loadPGListings();
}

// View PG Detail
function viewPGDetail(pgId) {
    window.location.href = `detail.html?id=${pgId}`;
}

// Book Now
function bookNow(pgId) {
    window.location.href = `booking.html?id=${pgId}`;
}

// Search on Enter key
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('smartSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSmartSearch();
            }
        });
    }
});
