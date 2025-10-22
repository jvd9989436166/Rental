import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { pgService } from '../services/pgService'

const HomePage = () => {
  const [pgs, setPgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPGs = async () => {
      try {
        setLoading(true)
        const response = await pgService.getPGs({ limit: 12 })
        setPgs(response.data)
      } catch (err) {
        setError('Failed to load PGs')
        console.error('Error fetching PGs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPGs()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 max-w-7xl mx-auto px-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load PGs</h2>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-6">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold">Explore PGs</motion.h1>
        <p className="mt-2 text-gray-600">Browse available PG listings</p>

        {pgs.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No PGs Available</h2>
            <p className="text-gray-600">Check back later for new listings</p>
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pgs.map((pg) => (
              <Link key={pg._id} to={`/pg/${pg._id}`} className="rounded-xl bg-white shadow hover:shadow-md transition p-4">
                {pg.images && pg.images.length > 0 ? (
                  <img 
                    src={pg.images[0].url} 
                    alt={pg.name}
                    className="h-40 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-40 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <div className="mt-3 font-semibold">{pg.name}</div>
                <div className="text-sm text-gray-500">
                  {pg.location.city}, {pg.location.state} · From ₹{pg.roomTypes[0]?.price || 'N/A'}
                </div>
                {pg.rating && pg.rating.average > 0 && (
                  <div className="mt-2 flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm text-gray-600">
                      {pg.rating.average} ({pg.rating.count} reviews)
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage



