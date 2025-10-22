import api from '../lib/axios'

export const maintenanceService = {
  // Create maintenance request
  createRequest: async (requestData) => {
    const formData = new FormData()
    
    Object.entries(requestData).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file) => {
          formData.append('images', file)
        })
      } else {
        formData.append(key, value)
      }
    })

    const { data } = await api.post('/maintenance', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  // Get maintenance requests
  getRequests: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const { data } = await api.get(`/maintenance?${params.toString()}`)
    return data
  },

  // Get single request
  getRequest: async (id) => {
    const { data } = await api.get(`/maintenance/${id}`)
    return data
  },

  // Update request status (Owner)
  updateStatus: async (id, statusData) => {
    const { data } = await api.put(`/maintenance/${id}/status`, statusData)
    return data
  },

  // Add feedback (Tenant)
  addFeedback: async (id, feedback) => {
    const { data } = await api.put(`/maintenance/${id}/feedback`, feedback)
    return data
  },

  // Get maintenance statistics
  getStats: async () => {
    const { data } = await api.get('/maintenance/stats/overview')
    return data
  },
}
