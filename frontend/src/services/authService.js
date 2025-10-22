import api from '../lib/axios'

export const authService = {
  // Register new user
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData)
    return data
  },

  // Login user
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    return data
  },

  // Google OAuth login
  googleLogin: async (googleData) => {
    const { data } = await api.post('/auth/google', googleData)
    return data
  },

  // Get current user
  getMe: async () => {
    const { data } = await api.get('/auth/me')
    return data
  },

  // Logout
  logout: async () => {
    const { data } = await api.post('/auth/logout')
    return data
  },

  // Update profile
  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/update-profile', profileData)
    return data
  },

  // Update password
  updatePassword: async (passwordData) => {
    const { data } = await api.put('/auth/update-password', passwordData)
    return data
  },
}
