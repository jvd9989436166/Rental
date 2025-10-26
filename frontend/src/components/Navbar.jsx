import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, User, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import AuthModal from './AuthModal'

const Navbar = ({ transparent = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getDashboardLink = () => {
    if (user?.role === 'owner') return '/owner/dashboard'
    return '/tenant/dashboard'
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 ${
          transparent ? 'glass' : 'bg-white shadow-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="text-2xl sm:text-3xl"
              >
                🏠
              </motion.div>
              <span className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-gradient">
                RentalMate
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Link
                to="/explore"
                className="text-gray-700 hover:text-primary-500 transition-colors font-medium text-sm lg:text-base"
              >
                Explore PGs
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-primary-500 transition-colors font-medium text-sm lg:text-base"
              >
                Contact
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 transition-colors"
                  >
                    <User size={20} />
                    <span>{user?.name}</span>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center space-x-2 btn-outline"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </motion.button>
                </>
                ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary"
                >
                  Login / Sign Up
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t"
            >
              <div className="px-4 py-4 space-y-3">
                <Link
                  to="/explore"
                  className="block py-2 text-gray-700 hover:text-primary-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Explore PGs
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link
                      to={getDashboardLink()}
                      className="block py-2 text-gray-700 hover:text-primary-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/contact"
                      className="block py-2 text-gray-700 hover:text-primary-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contact
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left py-2 text-red-600 hover:text-red-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthModal(true)
                      setIsMenuOpen(false)
                    }}
                    className="w-full btn-primary"
                  >
                    Login / Sign Up
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}

export default Navbar
