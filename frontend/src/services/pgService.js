import api from '../lib/axios'

export const pgService = {
  // Get all PGs with filters
  getPGs: async (filters = {}) => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','))
        } else {
          params.append(key, value)
        }
      }
    })

    const { data } = await api.get(`/pgs?${params.toString()}`)
    return data
  },

  // Get top-rated PGs
  getTopRatedPGs: async (limit = 10) => {
    const { data } = await api.get(`/pgs/top-rated?limit=${limit}`)
    return data
  },

  // Get single PG
  getPG: async (id) => {
    const { data } = await api.get(`/pgs/${id}`)
    return data
  },

  // Create PG (Owner only)
  createPG: async (pgData) => {
    const formData = new FormData()
    
    // Append all fields
    Object.entries(pgData).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file) => {
          formData.append('images', file)
        })
      } else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value)
      }
    })

    const { data } = await api.post('/pgs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  // Update PG
  updatePG: async (id, pgData) => {
    const formData = new FormData()
    
    Object.entries(pgData).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            formData.append('images', file)
          }
        })
      } else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value)
      }
    })

    const { data } = await api.put(`/pgs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  // Delete PG
  deletePG: async (id) => {
    const { data } = await api.delete(`/pgs/${id}`)
    return data
  },

  // Get owner's PGs
  getMyPGs: async () => {
    const { data } = await api.get('/pgs/owner/my-pgs')
    return data
  },

  // Get PG statistics
  getPGStats: async (id) => {
    const { data } = await api.get(`/pgs/${id}/stats`)
    return data
  },
}
