import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

const roles = [
  { key: 'tenant', label: 'Tenant' },
  { key: 'owner', label: 'Owner' },
]

const AuthModalDebug = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('tenant')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
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
    
    setLoading(true)
    setDebugInfo('Starting login process...')
    
    try {
      console.log('🔍 Login attempt with:', { email: form.email, password: '***' })
      setDebugInfo('Calling authService.login...')
      
      const res = await authService.login({ email: form.email, password: form.password })
      
      console.log('✅ Login response:', res)
      setDebugInfo(`Login successful! User: ${res.user?.name}, Role: ${res.user?.role}`)
      
      console.log('🔍 Setting auth state...')
      setAuth(res.user, res.token, res.refreshToken)
      
      console.log('🔍 Auth state set, checking store...')
      const authState = useAuthStore.getState()
      console.log('Current auth state:', authState)
      
      toast.success('Welcome back!')
      onClose?.()
      
      // Navigate based on role
      const finalRole = res?.user?.role || role
      console.log('🔍 Navigating to dashboard for role:', finalRole)
      
      if (finalRole === 'tenant') {
        navigate('/tenant/dashboard')
      } else if (finalRole === 'owner') {
        navigate('/owner/dashboard')
      }
      
    } catch (err) {
      console.error('❌ Login error:', err)
      console.error('Error response:', err?.response?.data)
      setDebugInfo(`Login failed: ${err?.response?.data?.message || err?.message}`)
      
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Authentication failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
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
              <h3 className="text-lg sm:text-xl font-bold">Debug Login</h3>
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
              <input 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="Email (try: john.doe@example.com)" 
                className="input" 
              />
              <input 
                name="password" 
                type="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="Password (try: password123)" 
                className="input" 
              />

              <button type="submit" disabled={!canSubmit || loading} className="btn-primary w-full">
                {loading ? 'Please wait…' : 'Debug Login'}
              </button>
            </form>

            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <h4 className="font-semibold text-sm">Debug Info:</h4>
                <p className="text-xs text-gray-600 mt-1">{debugInfo}</p>
              </div>
            )}

            <div className="mt-4 text-center text-sm">
              <button className="text-indigo-600 hover:underline" onClick={() => setMode('signup')}>
                New here? Create an account
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AuthModalDebug
