import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AuthModal from '../components/AuthModal'

const Login = () => {
  const [open, setOpen] = useState(true)
  const [params] = useSearchParams()
  useEffect(() => setOpen(true), [params])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 max-w-2xl mx-auto px-6">
        <h1 className="text-2xl font-bold">Login / Sign Up</h1>
        <p className="mt-2 text-gray-600">Continue to access your dashboard.</p>
      </div>
      <AuthModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  )
}

export default Login



