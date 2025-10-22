import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { bookingService } from '../services/bookingService'
import { Link } from 'react-router-dom'

const TenantDashboard = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await bookingService.getMyBookings()
        setBookings(response.data)
      } catch (err) {
        setError('Failed to load your bookings')
        console.error('Error fetching bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 max-w-6xl mx-auto px-6">
        <h1 className="text-2xl font-bold">Tenant Dashboard</h1>
        
        {/* Booking Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-purple-600">
              ₹{bookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
        </div>
        <div className="mt-6 grid gap-6">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Active Bookings</h2>
            {error ? (
              <p className="text-red-600">{error}</p>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No bookings found</p>
                <Link to="/" className="btn-primary">Browse PGs</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{booking.pg?.name || 'PG Name'}</h3>
                        <p className="text-sm text-gray-600">{booking.pg?.location?.city}, {booking.pg?.location?.state}</p>
                        <p className="text-sm text-gray-600">
                          {booking.roomType} room • ₹{booking.pricing?.monthlyRent}/month
                        </p>
                        <p className="text-sm text-gray-600">
                          Check-in: {new Date(booking.checkIn).toLocaleDateString()} • 
                          Check-out: {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Duration: {booking.duration?.months || 0} months, {booking.duration?.days || 0} days
                        </p>
                        <p className="text-sm text-gray-600">
                          Total Paid: ₹{booking.pricing?.total || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">#{booking.bookingId}</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Payment: {booking.payment?.status || 'pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/" className="p-4 border rounded-lg hover:shadow-md transition text-center">
                <h3 className="font-semibold">Browse PGs</h3>
                <p className="text-sm text-gray-600">Find your perfect PG</p>
              </Link>
              <div className="p-4 border rounded-lg hover:shadow-md transition text-center">
                <h3 className="font-semibold">Maintenance</h3>
                <p className="text-sm text-gray-600">Report issues</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TenantDashboard



