import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

const roles = [
  { key: 'tenant', label: 'Tenant' },
  { key: 'owner', label: 'Owner' },
]

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login') // or 'signup'
  const [role, setRole] = useState('tenant')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const presetRole = params.get('role')
    if (presetRole === 'owner' || presetRole === 'tenant') setRole(presetRole)
  }, [params])

  const canSubmit = useMemo(() => {
    if (mode === 'signup') {
      return form.name && form.email && form.phone && form.password
    }
    return form.email && form.password
  }, [mode, form])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (!canSubmit) return
    
    // Validation
    if (mode === 'login') {
      if (!form.email.trim()) {
        toast.error('Email is required')
        return
      }
      if (!form.password.trim()) {
        toast.error('Password is required')
        return
      }
      if (!form.email.includes('@')) {
        toast.error('Please enter a valid email')
        return
      }
    } else {
      if (!form.name.trim()) {
        toast.error('Name is required')
        return
      }
      if (!form.email.trim()) {
        toast.error('Email is required')
        return
      }
      if (!form.phone.trim()) {
        toast.error('Phone is required')
        return
      }
      if (!form.password.trim()) {
        toast.error('Password is required')
        return
      }
      if (!form.email.includes('@')) {
        toast.error('Please enter a valid email')
        return
      }
      if (form.password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }
      if (form.phone.length < 10) {
        toast.error('Please enter a valid phone number')
        return
      }
    }
    
    setLoading(true)
    try {
      let res
      if (mode === 'signup') {
        res = await authService.register({ ...form, role })
        setAuth(res.user, res.token, res.refreshToken)
        toast.success('Account created successfully!')
      } else {
        res = await authService.login({ email: form.email, password: form.password })
        setAuth(res.user, res.token, res.refreshToken)
        toast.success('Welcome back!')
      }
      
      onClose?.()
      
      // Owner approval flow: if owner and not approved, redirect to license page
      const finalRole = res?.user?.role || role
      const isApproved = Boolean(res?.user?.isApproved)
      if (finalRole === 'owner' && !isApproved) {
        navigate('/owner/license-approval')
      } else if (finalRole === 'tenant') {
        navigate('/tenant/dashboard')
      } else if (finalRole === 'owner' && isApproved) {
        navigate('/owner/dashboard')
      }
    } catch (err) {
      console.error('Auth error:', err)
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Authentication failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await authService.googleLogin({ credential: credentialResponse?.credential })
      setAuth(res.user, res.token, res.refreshToken)
      toast.success('Logged in with Google')
      onClose?.()
    } catch (err) {
      toast.error('Google login failed')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold">{mode === 'login' ? 'Login' : 'Create account'}</h3>
              <button className="text-gray-500 hover:text-gray-700 text-xl" onClick={onClose}>✕</button>
            </div>

            <div className="mt-4 flex gap-2">
              {roles.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs sm:text-sm font-medium ${
                    role === r.key ? 'border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className="input" />
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="input" />
                </>
              )}
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="input" />
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="input" />

              <button type="submit" disabled={!canSubmit || loading} className="btn-primary w-full">
                {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>

            <div className="my-4 text-center text-sm text-gray-500">or</div>

            <div className="flex justify-center">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Google login failed')} useOneTap={false} />
            </div>

            <div className="mt-4 text-center text-sm">
              {mode === 'login' ? (
                <button className="text-indigo-600 hover:underline" onClick={() => setMode('signup')}>New here? Create an account</button>
              ) : (
                <button className="text-indigo-600 hover:underline" onClick={() => setMode('login')}>Already have an account? Login</button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AuthModal


