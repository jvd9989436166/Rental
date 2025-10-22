import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { pgService } from '../services/pgService'
import { Link } from 'react-router-dom'

const OwnerDashboard = () => {
  const [showAdd, setShowAdd] = useState(false)
  const [pgs, setPgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMyPGs = async () => {
      try {
        setLoading(true)
        const response = await pgService.getMyPGs()
        setPgs(response.data)
      } catch (err) {
        setError('Failed to load your PGs')
        console.error('Error fetching PGs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMyPGs()
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>Add New PG</button>
        </div>

        <div className="mt-6 grid gap-6">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Your PG Listings</h2>
            {error ? (
              <p className="text-red-600">{error}</p>
            ) : pgs.length === 0 ? (
              <p className="text-gray-600">No PGs listed yet. Add your first PG!</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pgs.map((pg) => (
                  <Link key={pg._id} to={`/pg/${pg._id}`} className="border rounded-lg p-4 hover:shadow-md transition">
                    {pg.images && pg.images.length > 0 ? (
                      <img 
                        src={pg.images[0].url} 
                        alt={pg.name}
                        className="h-32 w-full rounded-lg object-cover mb-3"
                      />
                    ) : (
                      <div className="h-32 w-full rounded-lg bg-gray-200 flex items-center justify-center mb-3">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    <h3 className="font-semibold">{pg.name}</h3>
                    <p className="text-sm text-gray-600">{pg.location.city}, {pg.location.state}</p>
                    <p className="text-sm text-gray-600">From ₹{pg.roomTypes[0]?.price || 'N/A'}/month</p>
                    {pg.rating && pg.rating.average > 0 && (
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1 text-sm">{pg.rating.average} ({pg.rating.count})</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{pgs.length}</div>
                <div className="text-sm text-gray-600">Total PGs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {pgs.reduce((sum, pg) => sum + pg.views, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {pgs.length > 0 ? (pgs.reduce((sum, pg) => sum + pg.rating.average, 0) / pgs.length).toFixed(1) : '0'}
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {pgs.reduce((sum, pg) => sum + pg.roomTypes.reduce((roomSum, room) => roomSum + room.available, 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Available Rooms</div>
              </div>
            </div>
          </div>
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Add PG</h3>
                <button onClick={() => setShowAdd(false)}>✕</button>
              </div>
              <div className="mt-4 grid gap-3">
                <input className="input" placeholder="PG Name" />
                <div className="grid md:grid-cols-2 gap-3">
                  <input className="input" placeholder="Rent (₹)" />
                  <input className="input" placeholder="Location" />
                </div>
                <textarea className="input" placeholder="Amenities" />
                <textarea className="input" placeholder="Food Schedule" />
                <input type="file" />
                <div className="flex justify-end gap-2">
                  <button className="btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button className="btn-primary">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OwnerDashboard



