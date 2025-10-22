import api from '../lib/axios'

export const bookingService = {
  // Create Razorpay order (or mock order in development)
  createOrder: async (orderData) => {
    const { data } = await api.post('/bookings/create-order', orderData)
    return data
  },

  // Verify payment and create booking (or mock verification in development)
  verifyPayment: async (paymentData) => {
    const { data } = await api.post('/bookings/verify-payment', paymentData)
    return data
  },

  // Mock payment for development mode
  mockPayment: async (orderData) => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      data: {
        orderId: `order_dev_${Date.now()}`,
        amount: orderData.total * 100,
        currency: 'INR',
        isDevelopment: true,
        message: 'Development mode: Payment simulation'
      }
    }
  },

  // Get all bookings
  getBookings: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const { data } = await api.get(`/bookings?${params.toString()}`)
    return data
  },

  // Get my bookings (for current user)
  getMyBookings: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const { data } = await api.get(`/bookings?${params.toString()}`)
    return data
  },

  // Get single booking
  getBooking: async (id) => {
    const { data } = await api.get(`/bookings/${id}`)
    return data
  },

  // Update booking status (Owner)
  updateBookingStatus: async (id, status) => {
    const { data } = await api.put(`/bookings/${id}/status`, { status })
    return data
  },

  // Cancel booking
  cancelBooking: async (id, reason) => {
    const { data } = await api.put(`/bookings/${id}/cancel`, { reason })
    return data
  },

  // Get booking statistics
  getBookingStats: async () => {
    const { data } = await api.get('/bookings/stats/overview')
    return data
  },

  // Load Razorpay script
  loadRazorpayScript: () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  },
}
