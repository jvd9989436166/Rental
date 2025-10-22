import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const TestLogin = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const testUsers = [
    {
      name: 'John Doe (Tenant)',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'tenant'
    },
    {
      name: 'Rajesh Kumar (Owner)',
      email: 'rajesh.kumar@example.com',
      password: 'password123',
      role: 'owner'
    },
    {
      name: 'Admin User',
      email: 'admin@rentalmate.com',
      password: 'admin123',
      role: 'admin'
    }
  ]

  const handleTestLogin = async (user) => {
    setIsLoading(true)
    try {
      const response = await authService.login({
        email: user.email,
        password: user.password
      })

      if (response.success) {
        setAuth(response.user, response.token, response.refreshToken)
        toast.success(`Logged in as ${user.name}`)
        
        // Redirect based on role
        if (user.role === 'tenant') {
          navigate('/explore')
        } else if (user.role === 'owner') {
          navigate('/owner/dashboard')
        } else {
          navigate('/explore')
        }
      }
    } catch (error) {
      toast.error('Login failed: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Test Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose a test user to login and test the booking functionality
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          {testUsers.map((user, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'tenant' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'owner' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => handleTestLogin(user)}
                  disabled={isLoading}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>These are test users for development. In production, users would register normally.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestLogin

