import api from '../lib/axios'

export const reviewService = {
  // Create review
  createReview: async (reviewData) => {
    const formData = new FormData()
    
    Object.entries(reviewData).forEach(([key, value]) => {
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

    const { data } = await api.post('/reviews', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  // Get PG reviews
  getPGReviews: async (pgId, params = {}) => {
    const queryParams = new URLSearchParams(params)
    const { data } = await api.get(`/reviews/pg/${pgId}?${queryParams.toString()}`)
    return data
  },

  // Get user's reviews
  getMyReviews: async () => {
    const { data } = await api.get('/reviews/my-reviews')
    return data
  },

  // Update review
  updateReview: async (id, reviewData) => {
    const { data } = await api.put(`/reviews/${id}`, reviewData)
    return data
  },

  // Delete review
  deleteReview: async (id) => {
    const { data } = await api.delete(`/reviews/${id}`)
    return data
  },

  // Like/Unlike review
  likeReview: async (id) => {
    const { data } = await api.put(`/reviews/${id}/like`)
    return data
  },

  // Owner response to review
  respondToReview: async (id, comment) => {
    const { data } = await api.put(`/reviews/${id}/response`, { comment })
    return data
  },
}
