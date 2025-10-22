import { motion } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'

const LandingPage = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const handleOwnerCTA = () => {
    navigate('/login?role=owner')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600">
      <Navbar transparent />
      <div className="pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
              >
                Find Your Perfect PG Stay, Book Instantly
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="mt-4 text-indigo-100 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0"
              >
                Discover verified PGs with transparent pricing, amenities, food schedules,
                and real reviews.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
              >
                <Link to="/explore" className="btn-white text-center">
                  Explore PGs
                </Link>
                <button onClick={handleOwnerCTA} className="btn-outline-white text-center">
                  List Your PG
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/10 rounded-3xl backdrop-blur p-6 sm:p-8 shadow-2xl flex items-center justify-center h-64 sm:h-80 lg:h-96 text-6xl sm:text-8xl"
            >
              🏠
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage


