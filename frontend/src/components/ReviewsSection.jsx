import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { reviewService } from '../services/reviewService'
import { useAuthStore } from '../store/authStore'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'
import toast from 'react-hot-toast'

const ReviewsSection = ({ pgId, pgReviews = [], userBookings = [] }) => {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState(pgReviews)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('recent')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [ratingStats, setRatingStats] = useState(null)

  // Check if user can write a review
  const canWriteReview = user && user.role === 'tenant' && userBookings.length > 0

  useEffect(() => {
    fetchReviews()
  }, [pgId, sortBy])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await reviewService.getPGReviews(pgId, { sort: sortBy })
      setReviews(response.data)
      setRatingStats(response.ratingDistribution)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmitted = () => {
    setShowReviewForm(false)
    setSelectedBooking(null)
    fetchReviews() // Refresh reviews
  }

  const handleWriteReview = (booking) => {
    setSelectedBooking(booking)
    setShowReviewForm(true)
  }

  const calculateRatingDistribution = () => {
    if (!ratingStats) return null

    const total = ratingStats.reduce((sum, stat) => sum + stat.count, 0)
    return ratingStats.map(stat => ({
      ...stat,
      percentage: total > 0 ? Math.round((stat.count / total) * 100) : 0
    }))
  }

  const getAverageRating = () => {
    if (!reviews.length) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const RatingBar = ({ rating, count, percentage }) => (
    <div className="flex items-center space-x-2">
      <span className="text-sm w-8">{rating}★</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className="bg-yellow-400 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 w-8">{count}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Reviews</h3>
          <p className="text-gray-600">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canWriteReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Rating Overview */}
      {reviews.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="bg-white border rounded-lg p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {getAverageRating()}
              </div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-2xl ${
                      i < Math.round(getAverageRating())
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-600">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Rating Distribution</h4>
            <div className="space-y-2">
              {calculateRatingDistribution()?.map((stat) => (
                <RatingBar
                  key={stat._id}
                  rating={stat._id}
                  count={stat.count}
                  percentage={stat.percentage}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      {reviews.length > 0 && (
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Write a Review</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {selectedBooking ? (
                <ReviewForm
                  pgId={pgId}
                  bookingId={selectedBooking._id}
                  onReviewSubmitted={handleReviewSubmitted}
                  onCancel={() => setShowReviewForm(false)}
                />
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">Select a booking to review:</p>
                  <div className="space-y-2">
                    {userBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleWriteReview(booking)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {booking.roomType} Room
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-sm text-blue-600">Review</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onUpdate={fetchReviews}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600 mb-4">
            Be the first to share your experience!
          </p>
          {canWriteReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Write First Review
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewsSection
