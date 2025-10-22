// Authentication Module

// Modal Functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function openSignupModal(role = null) {
    const modal = document.getElementById('signupModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (role) {
        sessionStorage.setItem('preselectedRole', role);
    }
}

function closeSignupModal() {
    const modal = document.getElementById('signupModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function openRoleModal() {
    const modal = document.getElementById('roleModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeRoleModal() {
    const modal = document.getElementById('roleModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function selectRole(role) {
    localStorage.setItem('userRole', role);
    closeRoleModal();
    
    // Redirect based on role
    if (role === 'owner') {
        window.location.href = 'owner-dashboard.html';
    } else {
        window.location.href = 'home.html';
    }
}

// Login Form Handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                showToast('Login successful!', 'success');
                closeLoginModal();
                
                // Redirect based on role
                setTimeout(() => {
                    if (data.user.role === 'owner') {
                        if (data.user.isApproved) {
                            window.location.href = 'owner-dashboard.html';
                        } else {
                            window.location.href = 'owner-license-approval.html';
                        }
                    } else {
                        window.location.href = 'home.html';
                    }
                }, 1000);
            } else {
                showToast(data.message || 'Login failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Login failed. Please check your connection and try again.', 'error');
        }
    });
}

// Signup Form Handler
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const phone = document.getElementById('signupPhone')?.value || '0000000000'; // Default phone if not provided
        const role = sessionStorage.getItem('preselectedRole') || 'tenant';
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ name, email, password, phone, role })
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                showToast('Account created successfully!', 'success');
                closeSignupModal();
                
                // Clear preselected role
                sessionStorage.removeItem('preselectedRole');
                
                // Redirect based on role
                setTimeout(() => {
                    if (data.user.role === 'owner') {
                        window.location.href = 'owner-license-approval.html';
                    } else {
                        window.location.href = 'home.html';
                    }
                }, 1000);
            } else {
                showToast(data.message || 'Signup failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showToast('Signup failed. Please check your connection and try again.', 'error');
        }
    });
}

// Authentication helper functions
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.data;
        } else {
            // Token invalid, clear auth data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            return null;
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return null;
    }
}

// Google Sign In
async function signInWithGoogle() {
    try {
        // Implement Firebase Google Sign In
        showToast('Google Sign In coming soon!', 'success');
    } catch (error) {
        showToast('Google Sign In failed', 'error');
    }
}

// Phone OTP Sign In
async function signInWithPhone() {
    try {
        // Implement Firebase Phone Auth
        showToast('Phone OTP coming soon!', 'success');
    } catch (error) {
        showToast('Phone Sign In failed', 'error');
    }
}

// Logout
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}

// Check Auth State
async function checkAuth() {
    const user = await checkAuthStatus();
    if (!user) {
        // Redirect to login if on protected page
        const protectedPages = ['home.html', 'detail.html', 'booking.html', 'owner-dashboard.html', 'tenant-dashboard.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    }
    return user;
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type} show`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" class="w-5 h-5"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    
    // Update UI based on auth state
    if (user) {
        // Update navbar to show user info
        updateNavbarForAuthUser(user);
    }
});

function updateNavbarForAuthUser(user) {
    // This function can be customized per page
    console.log('User logged in:', user);
}
