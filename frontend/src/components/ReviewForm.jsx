import { useState } from 'react'
import { motion } from 'framer-motion'
import { reviewService } from '../services/reviewService'
import toast from 'react-hot-toast'

const ReviewForm = ({ pgId, bookingId, onReviewSubmitted, onCancel }) => {
  const [formData, setFormData] = useState({
    ratings: {
      cleanliness: 0,
      food: 0,
      safety: 0,
      location: 0,
      valueForMoney: 0
    },
    comment: '',
    images: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ratingCategories = [
    { key: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
    { key: 'food', label: 'Food Quality', icon: '🍽️' },
    { key: 'safety', label: 'Safety & Security', icon: '🔒' },
    { key: 'location', label: 'Location', icon: '📍' },
    { key: 'valueForMoney', label: 'Value for Money', icon: '💰' }
  ]

  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: rating
      }
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }))
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate ratings
    const allRated = Object.values(formData.ratings).every(rating => rating > 0)
    if (!allRated) {
      toast.error('Please rate all categories')
      return
    }

    if (!formData.comment.trim()) {
      toast.error('Please write a review comment')
      return
    }

    setIsSubmitting(true)
    try {
      const reviewData = {
        pg: pgId,
        booking: bookingId,
        ratings: formData.ratings,
        comment: formData.comment,
        images: formData.images
      }

      await reviewService.createReview(reviewData)
      toast.success('Review submitted successfully!')
      onReviewSubmitted()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ category, rating, onRatingChange }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(category, star)}
          className={`text-2xl transition-colors ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6"
    >
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Categories */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Rate your experience</h4>
          {ratingCategories.map(({ key, label, icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{icon}</span>
                <span className="font-medium">{label}</span>
              </div>
              <StarRating
                category={key}
                rating={formData.ratings[key]}
                onRatingChange={handleRatingChange}
              />
            </div>
          ))}
        </div>

        {/* Overall Rating Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Rating:</span>
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i < Math.round(Object.values(formData.ratings).reduce((a, b) => a + b, 0) / 5)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="font-semibold">
                {Object.values(formData.ratings).every(r => r > 0)
                  ? (Object.values(formData.ratings).reduce((a, b) => a + b, 0) / 5).toFixed(1)
                  : '0.0'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share your experience
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Tell others about your stay..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={1000}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {formData.comment.length}/1000
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add photos (optional)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {formData.images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              {formData.images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Review ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default ReviewForm
