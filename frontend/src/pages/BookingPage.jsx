import Navbar from '../components/Navbar'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { bookingService } from '../services/bookingService'
import { pgService } from '../services/pgService'
import { useAuthStore } from '../store/authStore'

const BookingPage = () => {
  const { pgId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [pg, setPg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedRoomType, setSelectedRoomType] = useState('single')

  // Fetch PG details
  useEffect(() => {
    const fetchPG = async () => {
      try {
        setLoading(true)
        const response = await pgService.getPG(pgId)
        setPg(response.data)
        // Set default room type to first available
        if (response.data.roomTypes && response.data.roomTypes.length > 0) {
          setSelectedRoomType(response.data.roomTypes[0].type)
        }
      } catch (error) {
        toast.error('Failed to load PG details')
        console.error('Error fetching PG:', error)
      } finally {
        setLoading(false)
      }
    }

    if (pgId) {
      fetchPG()
    }
  }, [pgId])

  const handleCreateOrder = async () => {
    if (!from || !to) return toast.error('Select dates')
    if (!pg) return toast.error('PG details not loaded')
    
    setIsProcessing(true)
    
    try {
      // Calculate pricing based on actual PG data
      const checkInDate = new Date(from)
      const checkOutDate = new Date(to)
      const diffTime = Math.abs(checkOutDate - checkInDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const months = Math.floor(diffDays / 30)
      
      // Find the selected room type pricing
      const roomType = pg.roomTypes.find(rt => rt.type === selectedRoomType)
      if (!roomType) {
        toast.error('Selected room type not available')
        return
      }

      const monthlyRent = roomType.price
      const deposit = roomType.deposit
      let discount = 0
      if (months >= 6) discount = 10
      else if (months >= 3) discount = 5

      const rentAmount = monthlyRent * months
      const discountAmount = (rentAmount * discount) / 100
      const total = rentAmount - discountAmount + deposit

      const orderRequest = {
        pg: pgId, // Use actual PG ID
        roomType: selectedRoomType,
        checkIn: from,
        checkOut: to,
        monthlyRent,
        deposit
      }

      const response = await bookingService.createOrder(orderRequest)
      setOrderData(response.data)
      
      toast.success('Order created successfully!')
    } catch (error) {
      toast.error('Failed to create order')
      console.error('Order creation error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVerifyPayment = async () => {
    if (!orderData) return toast.error('Please create order first')
    if (!pg) return toast.error('PG details not loaded')
    
    setIsProcessing(true)
    
    try {
      const paymentData = {
        razorpayOrderId: orderData.orderId,
        razorpayPaymentId: `pay_dev_${Date.now()}`,
        razorpaySignature: 'dev_signature',
        pg: pgId, // Use actual PG ID
        roomType: selectedRoomType,
        checkIn: from,
        checkOut: to,
        monthlyRent: orderData.monthlyRent || pg.roomTypes.find(rt => rt.type === selectedRoomType)?.price,
        deposit: orderData.deposit || pg.roomTypes.find(rt => rt.type === selectedRoomType)?.deposit,
        discount: orderData.discount || 0,
        total: orderData.total,
        tenantDetails: {
          name: user?.name || 'User',
          phone: user?.phone || '9876543210',
          email: user?.email || 'user@example.com'
        }
      }

      const response = await bookingService.verifyPayment(paymentData)
      
      toast.success('Booking Confirmed!')
      navigate('/tenant/dashboard')
    } catch (error) {
      toast.error('Payment verification failed')
      console.error('Payment verification error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 max-w-xl mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!pg) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 max-w-xl mx-auto px-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">PG Not Found</h2>
            <p className="text-gray-600">The PG you are looking for does not exist</p>
            <button 
              onClick={() => navigate('/explore')} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse PGs
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* PG Details */}
          <div>
            <h1 className="text-2xl font-bold mb-4">Book {pg.name}</h1>
            
            {/* PG Info */}
            <div className="bg-white rounded-lg p-4 shadow mb-4">
              <div className="flex items-center space-x-4 mb-3">
                {pg.images && pg.images.length > 0 && (
                  <img 
                    src={pg.images[0].url} 
                    alt={pg.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{pg.name}</h3>
                  <p className="text-sm text-gray-600">{pg.location.city}, {pg.location.state}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{pg.description}</p>
            </div>

            {/* Room Type Selection */}
            <div className="bg-white rounded-lg p-4 shadow mb-4">
              <h3 className="font-semibold mb-3">Select Room Type</h3>
              <div className="space-y-2">
                {pg.roomTypes.map((roomType) => (
                  <label key={roomType.type} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="roomType"
                      value={roomType.type}
                      checked={selectedRoomType === roomType.type}
                      onChange={(e) => setSelectedRoomType(e.target.value)}
                      className="text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{roomType.type} Room</span>
                        <span className="font-semibold">₹{roomType.price}/month</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Deposit: ₹{roomType.deposit} • Available: {roomType.available}/{roomType.total}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div>
            {/* Development Mode Notice */}
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    <p>Payments are simulated. Bookings will be saved to the database.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                  <input 
                    className="input w-full" 
                    type="date" 
                    value={from} 
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                  <input 
                    className="input w-full" 
                    type="date" 
                    value={to} 
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </div>
              
              {orderData && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <h4 className="font-semibold text-green-800">Order Created Successfully!</h4>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Order ID: {orderData.orderId}</p>
                    <p>Total Amount: ₹{orderData.total}</p>
                    <p>Discount: {orderData.discount}%</p>
                  </div>
                </div>
              )}
              
              <div className="text-gray-600 mb-4">
                <p className="text-sm">Selected Room: <span className="font-medium capitalize">{selectedRoomType}</span></p>
                <p className="text-sm">Monthly Rent: ₹{pg.roomTypes.find(rt => rt.type === selectedRoomType)?.price || 0}</p>
                <p className="text-sm">Security Deposit: ₹{pg.roomTypes.find(rt => rt.type === selectedRoomType)?.deposit || 0}</p>
                {orderData && (
                  <p className="text-lg font-semibold mt-2">Total: ₹{orderData.total}</p>
                )}
              </div>
              
              <div className="flex gap-3">
                {!orderData ? (
                  <button 
                    className={`btn-primary flex-1 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    onClick={handleCreateOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Creating Order...' : 'Create Order'}
                  </button>
                ) : (
                  <button 
                    className={`btn-primary flex-1 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    onClick={handleVerifyPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing Payment...' : 'Complete Booking'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage