import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Pages
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import PGDetailPage from './pages/PGDetailPage'
import BookingPage from './pages/BookingPage'
import TenantDashboard from './pages/TenantDashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import OwnerLicenseApproval from './pages/OwnerLicenseApproval'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import TestLogin from './pages/TestLogin'
import Contact from './pages/Contact'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#0ea5e9',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<HomePage />} />
        <Route path="/pg/:id" element={<PGDetailPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test-login" element={<TestLogin />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Protected Routes */}
        <Route
          path="/booking/:pgId"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tenant/dashboard"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Owner License Approval */}
        <Route path="/owner/license-approval" element={<OwnerLicenseApproval />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
