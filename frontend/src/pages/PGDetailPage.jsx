import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { pgService } from '../services/pgService'
import toast from 'react-hot-toast'

const PGDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [pg, setPg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchPG = async () => {
      try {
        setLoading(true)
        const response = await pgService.getPG(id)
        setPg(response.data)
      } catch (err) {
        setError('Failed to load PG details')
        console.error('Error fetching PG:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPG()
    }
  }, [id])

  const handleBookInstantly = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a PG')
      navigate('/test-login')
      return
    }
    
    // Navigate to booking page
    navigate(`/booking/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !pg) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 max-w-6xl mx-auto px-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">PG Not Found</h2>
            <p className="text-gray-600">{error || 'The PG you are looking for does not exist'}</p>
            <button 
              onClick={() => navigate('/')} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">About this PG</h3>
            <p className="text-gray-700">{pg.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <h4 className="font-semibold">Location</h4>
                <p className="text-gray-600">{pg.location.address}</p>
                <p className="text-gray-600">{pg.location.city}, {pg.location.state} - {pg.location.pincode}</p>
              </div>
              <div>
                <h4 className="font-semibold">Contact</h4>
                <p className="text-gray-600">Phone: {pg.contactInfo.phone}</p>
                {pg.contactInfo.email && <p className="text-gray-600">Email: {pg.contactInfo.email}</p>}
              </div>
            </div>
          </div>
        )
      case 'amenities':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Amenities</h3>
            <div className="grid grid-cols-2 gap-2">
              {pg.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="capitalize">{amenity.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'food':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Food Schedule</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className={pg.foodSchedule.breakfast ? "text-green-500" : "text-red-500"}>
                  {pg.foodSchedule.breakfast ? "✓" : "✗"}
                </span>
                <span>Breakfast</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={pg.foodSchedule.lunch ? "text-green-500" : "text-red-500"}>
                  {pg.foodSchedule.lunch ? "✓" : "✗"}
                </span>
                <span>Lunch</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={pg.foodSchedule.dinner ? "text-green-500" : "text-red-500"}>
                  {pg.foodSchedule.dinner ? "✓" : "✗"}
                </span>
                <span>Dinner</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">Food Type: {pg.foodType}</p>
          </div>
        )
      case 'rooms':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Room Types & Pricing</h3>
            <div className="space-y-4">
              {pg.roomTypes.map((room, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold capitalize">{room.type} Room</h4>
                    <span className="text-lg font-bold">₹{room.price}/month</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Available: {room.available} of {room.total} rooms</p>
                    <p>Security Deposit: ₹{room.deposit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'reviews':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Reviews</h3>
            {pg.reviews && pg.reviews.length > 0 ? (
              <div className="space-y-4">
                {pg.reviews.map((review, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold">{review.tenant?.name || 'Anonymous'}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? "text-yellow-500" : "text-gray-300"}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No reviews yet</p>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {pg.images && pg.images.length > 0 ? (
              <img 
                src={pg.images[0].url} 
                alt={pg.name}
                className="h-72 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="h-72 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
            <div className="mt-6">
              <h1 className="text-3xl font-bold mb-2">{pg.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                {pg.rating && pg.rating.average > 0 && (
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{pg.rating.average} ({pg.rating.count} reviews)</span>
                  </div>
                )}
                <span className="text-gray-600">{pg.location.city}, {pg.location.state}</span>
              </div>
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`tab ${activeTab === 'amenities' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('amenities')}
                >
                  Amenities
                </button>
                <button 
                  className={`tab ${activeTab === 'food' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('food')}
                >
                  Food Schedule
                </button>
                <button 
                  className={`tab ${activeTab === 'rooms' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('rooms')}
                >
                  Room Details
                </button>
                <button 
                  className={`tab ${activeTab === 'reviews' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews
                </button>
              </div>
              <div className="mt-4">
                {renderTabContent()}
              </div>
            </div>
          </div>
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border p-4 sticky top-28">
              <div className="text-2xl font-bold">
                ₹{pg.roomTypes[0]?.price || 'N/A'} 
                <span className="text-sm text-gray-500">/ month</span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {pg.roomTypes[0]?.type || 'Room'} room available
              </div>
              <button 
                onClick={handleBookInstantly}
                className="btn-primary w-full mt-4"
              >
                Book Instantly
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PGDetailPage



