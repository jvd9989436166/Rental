import { useState } from 'react'
import { motion } from 'framer-motion'
import { reviewService } from '../services/reviewService'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const ReviewCard = ({ review, onUpdate, onDelete }) => {
  const { user } = useAuthStore()
  const [isLiked, setIsLiked] = useState(review.likes?.includes(user?.id) || false)
  const [likesCount, setLikesCount] = useState(review.likes?.length || 0)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

  const handleLike = async () => {
    try {
      const response = await reviewService.likeReview(review._id)
      setIsLiked(!isLiked)
      setLikesCount(response.data.likes)
    } catch (error) {
      console.error('Error liking review:', error)
      toast.error('Failed to like review')
    }
  }

  const handleResponseSubmit = async (e) => {
    e.preventDefault()
    if (!responseText.trim()) return

    setIsSubmittingResponse(true)
    try {
      await reviewService.respondToReview(review._id, responseText)
      toast.success('Response added successfully')
      setShowResponseForm(false)
      setResponseText('')
      onUpdate?.() // Refresh reviews
    } catch (error) {
      console.error('Error submitting response:', error)
      toast.error('Failed to add response')
    } finally {
      setIsSubmittingResponse(false)
    }
  }

  const StarRating = ({ rating, size = 'text-lg' }) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`${size} ${
            i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  )

  const CategoryRating = ({ category, rating, label, icon }) => (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center space-x-2">
        <span className="text-sm">{icon}</span>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="flex items-center space-x-1">
        <StarRating rating={rating} size="text-sm" />
        <span className="text-sm text-gray-500 ml-1">{rating}</span>
      </div>
    </div>
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-lg p-6 space-y-4"
    >
      {/* Review Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {review.tenant?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {review.tenant?.name || 'Anonymous'}
            </h4>
            <div className="flex items-center space-x-2">
              <StarRating rating={review.rating} />
              <span className="text-sm text-gray-500">
                {review.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(review.createdAt)}
        </div>
      </div>

      {/* Category Ratings */}
      {review.ratings && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Detailed Ratings</h5>
          <CategoryRating
            category="cleanliness"
            rating={review.ratings.cleanliness}
            label="Cleanliness"
            icon="🧹"
          />
          <CategoryRating
            category="food"
            rating={review.ratings.food}
            label="Food Quality"
            icon="🍽️"
          />
          <CategoryRating
            category="safety"
            rating={review.ratings.safety}
            label="Safety"
            icon="🔒"
          />
          <CategoryRating
            category="location"
            rating={review.ratings.location}
            label="Location"
            icon="📍"
          />
          <CategoryRating
            category="valueForMoney"
            rating={review.ratings.valueForMoney}
            label="Value for Money"
            icon="💰"
          />
        </div>
      )}

      {/* Review Comment */}
      <p className="text-gray-700 leading-relaxed">{review.comment}</p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={`Review image ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Review Actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 text-sm ${
              isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <span className={isLiked ? '❤️' : '🤍'}>
              {isLiked ? '❤️' : '🤍'}
            </span>
            <span>{likesCount} helpful</span>
          </button>
        </div>

        {/* Owner Response Button */}
        {user?.role === 'owner' && !review.response && (
          <button
            onClick={() => setShowResponseForm(!showResponseForm)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Respond
          </button>
        )}
      </div>

      {/* Owner Response */}
      {review.response && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-blue-800">Owner Response</span>
            <span className="text-xs text-blue-600">
              {formatDate(review.response.respondedAt)}
            </span>
          </div>
          <p className="text-blue-700">{review.response.comment}</p>
        </div>
      )}

      {/* Response Form */}
      {showResponseForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleResponseSubmit}
          className="bg-gray-50 p-4 rounded-lg space-y-3"
        >
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Write a response to this review..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowResponseForm(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingResponse || !responseText.trim()}
              className="px-4 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmittingResponse ? 'Submitting...' : 'Submit Response'}
            </button>
          </div>
        </motion.form>
      )}

      {/* Verified Badge */}
      {review.isVerified && (
        <div className="flex items-center space-x-1 text-green-600 text-sm">
          <span>✓</span>
          <span>Verified Stay</span>
        </div>
      )}
    </motion.div>
  )
}

export default ReviewCard
