import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ReviewsSection from '../components/ReviewsSection'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { pgService } from '../services/pgService'
import { bookingService } from '../services/bookingService'
import toast from 'react-hot-toast'
import { Edit, Settings, Trash2 } from 'lucide-react'

const PGDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [pg, setPg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showEdit, setShowEdit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [userBookings, setUserBookings] = useState([])
  
  // Form state for editing
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    roomTypes: [],
    foodType: 'veg',
    foodSchedule: {
      breakfast: false,
      lunch: false,
      dinner: false
    },
    amenities: [],
    gender: 'any',
    contactInfo: {
      phone: '',
      email: '',
      whatsapp: ''
    },
    nearbyColleges: [],
    images: []
  })

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

  // Fetch user bookings for reviews
  const fetchUserBookings = async () => {
    if (!isAuthenticated || user?.role !== 'tenant') return
    
    try {
      const response = await bookingService.getMyBookings({ pg: id })
      // Filter for completed/active bookings that can be reviewed
      const reviewableBookings = response.data.filter(booking => 
        (booking.status === 'completed' || booking.status === 'active') && 
        booking.pg === id
      )
      setUserBookings(reviewableBookings)
    } catch (error) {
      console.error('Error fetching user bookings:', error)
    }
  }

  // Fetch analytics when analytics tab is selected
  useEffect(() => {
    if (activeTab === 'analytics' && isOwner() && !analyticsData) {
      fetchAnalytics()
    }
  }, [activeTab, pg, user])

  // Fetch user bookings when PG is loaded
  useEffect(() => {
    if (pg && isAuthenticated) {
      fetchUserBookings()
    }
  }, [pg, isAuthenticated, user])

  const handleBookInstantly = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a PG')
      navigate('/login')
      return
    }
    
    // Navigate to booking page
    navigate(`/booking/${id}`)
  }

  const handleDeletePG = async () => {
    if (!window.confirm('Are you sure you want to delete this PG? This action cannot be undone.')) {
      return
    }

    try {
      setIsSubmitting(true)
      await pgService.deletePG(id)
      toast.success('PG deleted successfully')
      navigate('/owner/dashboard')
    } catch (error) {
      console.error('Error deleting PG:', error)
      toast.error(error.response?.data?.message || 'Failed to delete PG')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if current user is the owner of this PG
  const isOwner = () => {
    return isAuthenticated && user && pg && user.id === pg.owner._id
  }

  // Fetch PG analytics data
  const fetchAnalytics = async () => {
    if (!isOwner()) return
    
    try {
      setAnalyticsLoading(true)
      const response = await pgService.getPGStats(id)
      setAnalyticsData(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setAnalyticsLoading(false)
    }
  }

  // Initialize edit form with current PG data
  const initializeEditForm = () => {
    if (pg) {
      setEditFormData({
        name: pg.name || '',
        description: pg.description || '',
        location: {
          address: pg.location?.address || '',
          city: pg.location?.city || '',
          state: pg.location?.state || '',
          pincode: pg.location?.pincode || '',
          landmark: pg.location?.landmark || ''
        },
        roomTypes: pg.roomTypes || [],
        foodType: pg.foodType || 'veg',
        foodSchedule: {
          breakfast: pg.foodSchedule?.breakfast || false,
          lunch: pg.foodSchedule?.lunch || false,
          dinner: pg.foodSchedule?.dinner || false
        },
        amenities: pg.amenities || [],
        gender: pg.gender || 'any',
        contactInfo: {
          phone: pg.contactInfo?.phone || '',
          email: pg.contactInfo?.email || '',
          whatsapp: pg.contactInfo?.whatsapp || ''
        },
        nearbyColleges: pg.nearbyColleges || [],
        images: []
      })
    }
  }

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setEditFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  // Handle room type changes
  const handleRoomTypeChange = (index, field, value) => {
    setEditFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.map((room, i) => 
        i === index ? { ...room, [field]: value } : room
      )
    }))
  }

  // Add new room type
  const addRoomType = () => {
    setEditFormData(prev => ({
      ...prev,
      roomTypes: [...prev.roomTypes, {
        type: 'single',
        price: '',
        available: '',
        total: '',
        deposit: ''
      }]
    }))
  }

  // Remove room type
  const removeRoomType = (index) => {
    if (editFormData.roomTypes.length > 1) {
      setEditFormData(prev => ({
        ...prev,
        roomTypes: prev.roomTypes.filter((_, i) => i !== index)
      }))
    }
  }

  // Handle amenity changes
  const handleAmenityChange = (amenity) => {
    setEditFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  // Handle image changes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setEditFormData(prev => ({
      ...prev,
      images: files
    }))
  }

  // Handle college changes
  const handleEditCollegeChange = (index, field, value) => {
    setEditFormData(prev => ({
      ...prev,
      nearbyColleges: prev.nearbyColleges.map((college, i) => 
        i === index ? { ...college, [field]: value } : college
      )
    }))
  }

  // Add new college
  const addEditCollege = () => {
    setEditFormData(prev => ({
      ...prev,
      nearbyColleges: [...prev.nearbyColleges, {
        name: '',
        distance: '',
        unit: 'km'
      }]
    }))
  }

  // Remove college
  const removeEditCollege = (index) => {
    setEditFormData(prev => ({
      ...prev,
      nearbyColleges: prev.nearbyColleges.filter((_, i) => i !== index)
    }))
  }

  // Validate edit form
  const validateEditForm = () => {
    if (!editFormData.name.trim()) {
      toast.error('PG name is required')
      return false
    }
    if (!editFormData.description.trim()) {
      toast.error('Description is required')
      return false
    }
    if (!editFormData.location.address.trim()) {
      toast.error('Address is required')
      return false
    }
    if (!editFormData.location.city.trim()) {
      toast.error('City is required')
      return false
    }
    if (!editFormData.location.state.trim()) {
      toast.error('State is required')
      return false
    }
    if (!editFormData.location.pincode.match(/^[0-9]{6}$/)) {
      toast.error('Please provide valid 6-digit pincode')
      return false
    }
    if (!editFormData.contactInfo.phone.match(/^[0-9]{10}$/)) {
      toast.error('Please provide valid 10-digit phone number')
      return false
    }
    if (editFormData.roomTypes.some(room => !room.price || !room.available || !room.total || !room.deposit)) {
      toast.error('Please fill all room type details')
      return false
    }
    return true
  }

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateEditForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Prepare data for submission
      const submitData = {
        ...editFormData,
        roomTypes: editFormData.roomTypes.map(room => ({
          ...room,
          price: Number(room.price),
          available: Number(room.available),
          total: Number(room.total),
          deposit: Number(room.deposit)
        }))
      }
      
      const response = await pgService.updatePG(id, submitData)
      toast.success('PG updated successfully!')
      
      // Update local state
      setPg(response.data)
      setShowEdit(false)
      
    } catch (error) {
      console.error('Error updating PG:', error)
      toast.error(error.response?.data?.message || 'Failed to update PG')
    } finally {
      setIsSubmitting(false)
    }
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
            {pg.nearbyColleges && pg.nearbyColleges.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Nearby Colleges</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pg.nearbyColleges.map((college, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{college.name}</span>
                        <span className="text-blue-600 font-semibold">
                          {college.distance} {college.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
          <ReviewsSection 
            pgId={pg._id} 
            pgReviews={pg.reviews || []}
            userBookings={userBookings}
          />
        )
      case 'analytics':
        if (analyticsLoading) {
          return (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">PG Analytics</h3>
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          )
        }

        if (!analyticsData) {
          return (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">PG Analytics</h3>
              <div className="text-center py-8">
                <p className="text-gray-600">Analytics data not available</p>
                <button 
                  onClick={fetchAnalytics}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Load Analytics
                </button>
              </div>
            </div>
          )
        }

        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">PG Analytics</h3>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">Total Views</h4>
                <p className="text-2xl font-bold text-blue-600">{analyticsData.views || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Average Rating</h4>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsData.rating?.average ? analyticsData.rating.average.toFixed(1) : 'N/A'}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800">Total Reviews</h4>
                <p className="text-2xl font-bold text-purple-600">{analyticsData.rating?.count || 0}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800">Occupancy Rate</h4>
                <p className="text-2xl font-bold text-orange-600">{analyticsData.occupancyRate || 0}%</p>
              </div>
            </div>

            {/* Room Statistics */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Room Statistics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Rooms:</span>
                    <span className="font-semibold">{analyticsData.totalRooms || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Rooms:</span>
                    <span className="font-semibold text-green-600">{analyticsData.availableRooms || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Occupied Rooms:</span>
                    <span className="font-semibold text-blue-600">{(analyticsData.totalRooms || 0) - (analyticsData.availableRooms || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Booking Statistics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Booking Statistics</h4>
                {analyticsData.bookingStats && analyticsData.bookingStats.length > 0 ? (
                  <div className="space-y-2">
                    {analyticsData.bookingStats.map((stat, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="capitalize">{stat._id}:</span>
                        <span className="font-semibold">{stat.count}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total Revenue:</span>
                        <span className="text-green-600">
                          ₹{analyticsData.bookingStats.reduce((sum, stat) => sum + (stat.totalRevenue || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No booking data available</p>
                )}
              </div>
            </div>

            {/* Room Occupancy Details */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Room Occupancy Details</h4>
              <div className="space-y-3">
                {pg.roomTypes?.map((room, index) => {
                  const occupancyRate = room.total > 0 ? ((room.total - room.available) / room.total * 100).toFixed(1) : 0
                  return (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">{room.type} Room</span>
                        <span className="text-sm text-gray-600">{occupancyRate}% occupied</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${occupancyRate}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>{room.available} available</span>
                        <span>{room.total - room.available} occupied</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
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
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative">
                  <img 
                    src={pg.images[0].url} 
                    alt={pg.name}
                    className="h-72 w-full rounded-xl object-cover"
                  />
                  {pg.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      +{pg.images.length - 1} more
                    </div>
                  )}
                </div>
                
                {/* Image Gallery */}
                {pg.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {pg.images.slice(1, 5).map((image, index) => (
                      <img 
                        key={index}
                        src={image.url} 
                        alt={`${pg.name} - Image ${index + 2}`}
                        className="h-16 w-full rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          // Move this image to first position for main display
                          const newImages = [image, ...pg.images.filter((_, i) => i !== index + 1)];
                          setPg(prev => ({ ...prev, images: newImages }));
                        }}
                      />
                    ))}
                    {pg.images.length > 5 && (
                      <div className="h-16 w-full rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                        +{pg.images.length - 5}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-72 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold">{pg.name}</h1>
                {isOwner() && (
                  <button
                    onClick={() => navigate('/owner/dashboard')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Back to Dashboard
                  </button>
                )}
              </div>
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
                {isOwner() && (
                  <button 
                    className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                  >
                    Analytics
                  </button>
                )}
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
              {isOwner() ? (
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      initializeEditForm()
                      setShowEdit(true)
                    }}
                    className="btn-primary w-full"
                  >
                    <Edit size={18} className="inline mr-2" />
                    Edit PG Details
                  </button>
                  <button 
                    onClick={handleDeletePG}
                    disabled={isSubmitting}
                    className="btn-outline w-full text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={18} className="inline mr-2" />
                    {isSubmitting ? 'Deleting...' : 'Delete PG'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleBookInstantly}
                  className="btn-primary w-full mt-4"
                >
                  Book Instantly
                </button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEdit && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Edit PG Details</h3>
                <button 
                  onClick={() => setShowEdit(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
                  <div className="grid gap-4">
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      className="input"
                      placeholder="PG Name *"
                      required
                    />
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditInputChange}
                      className="input h-24"
                      placeholder="Description *"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Location</h4>
                  <div className="grid gap-4">
                    <input
                      type="text"
                      name="location.address"
                      value={editFormData.location.address}
                      onChange={handleEditInputChange}
                      className="input"
                      placeholder="Address *"
                      required
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="location.city"
                        value={editFormData.location.city}
                        onChange={handleEditInputChange}
                        className="input"
                        placeholder="City *"
                        required
                      />
                      <input
                        type="text"
                        name="location.state"
                        value={editFormData.location.state}
                        onChange={handleEditInputChange}
                        className="input"
                        placeholder="State *"
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="location.pincode"
                        value={editFormData.location.pincode}
                        onChange={handleEditInputChange}
                        className="input"
                        placeholder="Pincode (6 digits) *"
                        pattern="[0-9]{6}"
                        required
                      />
                      <input
                        type="text"
                        name="location.landmark"
                        value={editFormData.location.landmark}
                        onChange={handleEditInputChange}
                        className="input"
                        placeholder="Landmark (optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Room Types */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800">Room Types</h4>
                    <button
                      type="button"
                      onClick={addRoomType}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Room Type
                    </button>
                  </div>
                  {editFormData.roomTypes.map((room, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Room Type {index + 1}</h5>
                        {editFormData.roomTypes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRoomType(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <select
                          value={room.type}
                          onChange={(e) => handleRoomTypeChange(index, 'type', e.target.value)}
                          className="input"
                          required
                        >
                          <option value="single">Single</option>
                          <option value="double">Double</option>
                          <option value="triple">Triple</option>
                          <option value="sharing">Sharing</option>
                        </select>
                        <input
                          type="number"
                          value={room.price}
                          onChange={(e) => handleRoomTypeChange(index, 'price', e.target.value)}
                          className="input"
                          placeholder="Price per month (₹) *"
                          min="0"
                          required
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <input
                          type="number"
                          value={room.total}
                          onChange={(e) => handleRoomTypeChange(index, 'total', e.target.value)}
                          className="input"
                          placeholder="Total rooms *"
                          min="1"
                          required
                        />
                        <input
                          type="number"
                          value={room.available}
                          onChange={(e) => handleRoomTypeChange(index, 'available', e.target.value)}
                          className="input"
                          placeholder="Available rooms *"
                          min="0"
                          required
                        />
                        <input
                          type="number"
                          value={room.deposit}
                          onChange={(e) => handleRoomTypeChange(index, 'deposit', e.target.value)}
                          className="input"
                          placeholder="Security deposit (₹) *"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Food & Amenities */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Food & Amenities</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Food Type</label>
                      <select
                        name="foodType"
                        value={editFormData.foodType}
                        onChange={handleEditInputChange}
                        className="input"
                        required
                      >
                        <option value="veg">Vegetarian</option>
                        <option value="non-veg">Non-Vegetarian</option>
                        <option value="both">Both</option>
                        <option value="none">No Food</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        name="gender"
                        value={editFormData.gender}
                        onChange={handleEditInputChange}
                        className="input"
                      >
                        <option value="any">Any</option>
                        <option value="male">Male Only</option>
                        <option value="female">Female Only</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Food Schedule</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="foodSchedule.breakfast"
                          checked={editFormData.foodSchedule.breakfast}
                          onChange={handleEditInputChange}
                          className="mr-2"
                        />
                        Breakfast
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="foodSchedule.lunch"
                          checked={editFormData.foodSchedule.lunch}
                          onChange={handleEditInputChange}
                          className="mr-2"
                        />
                        Lunch
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="foodSchedule.dinner"
                          checked={editFormData.foodSchedule.dinner}
                          onChange={handleEditInputChange}
                          className="mr-2"
                        />
                        Dinner
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['wifi', 'ac', 'laundry', 'cctv', 'parking', 'gym', 'power-backup', 'water-purifier', 'tv', 'fridge', 'geyser', 'attached-bathroom', 'balcony'].map(amenity => (
                        <label key={amenity} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={editFormData.amenities.includes(amenity)}
                            onChange={() => handleAmenityChange(amenity)}
                            className="mr-2"
                          />
                          {amenity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Contact Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="tel"
                      name="contactInfo.phone"
                      value={editFormData.contactInfo.phone}
                      onChange={handleEditInputChange}
                      className="input"
                      placeholder="Phone Number (10 digits) *"
                      pattern="[0-9]{10}"
                      required
                    />
                    <input
                      type="email"
                      name="contactInfo.email"
                      value={editFormData.contactInfo.email}
                      onChange={handleEditInputChange}
                      className="input"
                      placeholder="Email (optional)"
                    />
                  </div>
                  <input
                    type="tel"
                    name="contactInfo.whatsapp"
                    value={editFormData.contactInfo.whatsapp}
                    onChange={handleEditInputChange}
                    className="input"
                    placeholder="WhatsApp Number (optional)"
                  />
                </div>

                {/* Nearby Colleges */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800">Nearby Colleges</h4>
                    <button
                      type="button"
                      onClick={addEditCollege}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add College
                    </button>
                  </div>
                  {editFormData.nearbyColleges.map((college, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">College {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeEditCollege(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={college.name}
                          onChange={(e) => handleEditCollegeChange(index, 'name', e.target.value)}
                          className="input"
                          placeholder="College Name *"
                          required
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={college.distance}
                            onChange={(e) => handleEditCollegeChange(index, 'distance', e.target.value)}
                            className="input flex-1"
                            placeholder="Distance *"
                            min="0"
                            step="0.1"
                            required
                          />
                          <select
                            value={college.unit}
                            onChange={(e) => handleEditCollegeChange(index, 'unit', e.target.value)}
                            className="input w-20"
                          >
                            <option value="km">km</option>
                            <option value="miles">miles</option>
                            <option value="meter">meter</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {editFormData.nearbyColleges.length === 0 && (
                    <p className="text-gray-600 text-sm">No colleges added yet. Click "Add College" to add nearby colleges.</p>
                  )}
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Images</h4>
                  
                  {/* Current Images */}
                  {pg.images && pg.images.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="text-md font-medium text-gray-700">Current Images ({pg.images.length})</h5>
                      <div className="grid grid-cols-3 gap-3">
                        {pg.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={image.url} 
                              alt={`${pg.name} - Image ${index + 1}`}
                              className="h-20 w-full rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await pgService.deletePGImage(pg._id, index);
                                  // Remove image from current images
                                  const updatedImages = pg.images.filter((_, i) => i !== index);
                                  setPg(prev => ({ ...prev, images: updatedImages }));
                                } catch (error) {
                                  console.error('Error deleting image:', error);
                                  alert('Failed to delete image. Please try again.');
                                }
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* New Images Upload */}
                  <div className="space-y-2">
                    <h5 className="text-md font-medium text-gray-700">Add New Images</h5>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="input"
                    />
                    <p className="text-sm text-gray-600">Upload additional images to showcase your PG (max 10 total)</p>
                  </div>
                  
                  {/* Preview New Images */}
                  {editFormData.images && editFormData.images.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-md font-medium text-gray-700">New Images to Upload ({editFormData.images.length})</h5>
                      <div className="grid grid-cols-3 gap-3">
                        {editFormData.images.map((file, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Preview ${index + 1}`}
                              className="h-20 w-full rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEditFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index)
                                }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="btn-outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update PG'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PGDetailPage



