import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const OwnerLicenseApproval = () => {
  const [form, setForm] = useState({ ownerName: '', businessName: '', licenseNumber: '', location: '', agree: false })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const canSubmit = form.ownerName && form.businessName && (form.licenseNumber || file) && form.location && form.agree

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    try {
      // TODO: integrate with backend endpoint when available
      await new Promise((r) => setTimeout(r, 900))
      setSubmitted(true)
      toast.success('License submitted for review')
      setTimeout(() => navigate('/owner/dashboard'), 1200)
    } catch (e) {
      toast.error('Submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 max-w-3xl mx-auto px-6">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold">Owner License Approval</motion.h1>
        <p className="mt-2 text-gray-600">Please submit your PG ownership details to unlock the Owner Dashboard.</p>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          {submitted ? (
            <div className="flex flex-col items-center py-8">
              <div className="h-44 w-44 flex items-center justify-center text-6xl">✅</div>
              <p className="text-lg font-medium text-green-600">License Submitted for Review</p>
              <p className="text-sm text-gray-500 mt-1">We will notify you once approved.</p>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <input name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Owner Name" className="input" />
              <input name="businessName" value={form.businessName} onChange={handleChange} placeholder="Registered Business Name" className="input" />
              <div className="grid md:grid-cols-2 gap-4">
                <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="License Number" className="input" />
                <input name="location" value={form.location} onChange={handleChange} placeholder="Location of Property" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload License Proof (optional if number provided)</label>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
                I confirm I own this PG
              </label>
              <div className="flex justify-end">
                <button type="submit" disabled={!canSubmit || loading} className="btn-primary">
                  {loading ? 'Submitting…' : 'Submit for Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default OwnerLicenseApproval


