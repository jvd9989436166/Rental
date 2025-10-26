import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { pgService } from '../services/pgService'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const OwnerDashboard = () => {
  const [showAdd, setShowAdd] = useState(false)
  const [pgs, setPgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    roomTypes: [{
      type: 'single',
      price: '',
      available: '',
      total: '',
      deposit: ''
    }],
    foodType: 'veg',
    foodSchedule: {
      breakfast: false,
      lunch: false,
      dinner: false
    },
    amenities: [],
    gender: 'any',
    contactInfo: {
      phone: '',
      email: '',
      whatsapp: ''
    },
    nearbyColleges: [],
    images: []
  })

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

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleRoomTypeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.map((room, i) => 
        i === index ? { ...room, [field]: value } : room
      )
    }))
  }

  const addRoomType = () => {
    setFormData(prev => ({
      ...prev,
      roomTypes: [...prev.roomTypes, {
        type: 'single',
        price: '',
        available: '',
        total: '',
        deposit: ''
      }]
    }))
  }

  const removeRoomType = (index) => {
    if (formData.roomTypes.length > 1) {
      setFormData(prev => ({
        ...prev,
        roomTypes: prev.roomTypes.filter((_, i) => i !== index)
      }))
    }
  }

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      images: files
    }))
  }

  // Handle college changes
  const handleCollegeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      nearbyColleges: prev.nearbyColleges.map((college, i) => 
        i === index ? { ...college, [field]: value } : college
      )
    }))
  }

  // Add new college
  const addCollege = () => {
    setFormData(prev => ({
      ...prev,
      nearbyColleges: [...prev.nearbyColleges, {
        name: '',
        distance: '',
        unit: 'km'
      }]
    }))
  }

  // Remove college
  const removeCollege = (index) => {
    setFormData(prev => ({
      ...prev,
      nearbyColleges: prev.nearbyColleges.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('PG name is required')
      return false
    }
    if (!formData.description.trim()) {
      toast.error('Description is required')
      return false
    }
    if (!formData.location.address.trim()) {
      toast.error('Address is required')
      return false
    }
    if (!formData.location.city.trim()) {
      toast.error('City is required')
      return false
    }
    if (!formData.location.state.trim()) {
      toast.error('State is required')
      return false
    }
    if (!formData.location.pincode.match(/^[0-9]{6}$/)) {
      toast.error('Please provide valid 6-digit pincode')
      return false
    }
    if (!formData.contactInfo.phone.match(/^[0-9]{10}$/)) {
      toast.error('Please provide valid 10-digit phone number')
      return false
    }
    if (formData.roomTypes.some(room => !room.price || !room.available || !room.total || !room.deposit)) {
      toast.error('Please fill all room type details')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        roomTypes: formData.roomTypes.map(room => ({
          ...room,
          price: Number(room.price),
          available: Number(room.available),
          total: Number(room.total),
          deposit: Number(room.deposit)
        }))
      }
      
      const response = await pgService.createPG(submitData)
      toast.success('PG created successfully!')
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        location: {
          address: '',
          city: '',
          state: '',
          pincode: '',
          landmark: ''
        },
        roomTypes: [{
          type: 'single',
          price: '',
          available: '',
          total: '',
          deposit: ''
        }],
        foodType: 'veg',
        foodSchedule: {
          breakfast: false,
          lunch: false,
          dinner: false
        },
        amenities: [],
        gender: 'any',
        contactInfo: {
          phone: '',
          email: '',
          whatsapp: ''
        },
        nearbyColleges: [],
        images: []
      })
      setShowAdd(false)
      
      // Refresh PG list
      const updatedResponse = await pgService.getMyPGs()
      setPgs(updatedResponse.data)
      
    } catch (error) {
      console.error('Error creating PG:', error)
      toast.error(error.response?.data?.message || 'Failed to create PG')
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Add New PG</h3>
                <button 
                  onClick={() => setShowAdd(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
                  <div className="grid gap-4">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="PG Name *"
                      required
                    />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="input h-24"
                      placeholder="Description *"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Location</h4>
                  <div className="grid gap-4">
                    <input
                      type="text"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Address *"
                      required
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="location.city"
                        value={formData.location.city}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="City *"
                        required
                      />
                      <input
                        type="text"
                        name="location.state"
                        value={formData.location.state}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="State *"
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="location.pincode"
                        value={formData.location.pincode}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="Pincode (6 digits) *"
                        pattern="[0-9]{6}"
                        required
                      />
                      <input
                        type="text"
                        name="location.landmark"
                        value={formData.location.landmark}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="Landmark (optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Room Types */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800">Room Types</h4>
                    <button
                      type="button"
                      onClick={addRoomType}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Room Type
                    </button>
                  </div>
                  {formData.roomTypes.map((room, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Room Type {index + 1}</h5>
                        {formData.roomTypes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRoomType(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <select
                          value={room.type}
                          onChange={(e) => handleRoomTypeChange(index, 'type', e.target.value)}
                          className="input"
                          required
                        >
                          <option value="single">Single</option>
                          <option value="double">Double</option>
                          <option value="triple">Triple</option>
                          <option value="sharing">Sharing</option>
                        </select>
                        <input
                          type="number"
                          value={room.price}
                          onChange={(e) => handleRoomTypeChange(index, 'price', e.target.value)}
                          className="input"
                          placeholder="Price per month (₹) *"
                          min="0"
                          required
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <input
                          type="number"
                          value={room.total}
                          onChange={(e) => handleRoomTypeChange(index, 'total', e.target.value)}
                          className="input"
                          placeholder="Total rooms *"
                          min="1"
                          required
                        />
                        <input
                          type="number"
                          value={room.available}
                          onChange={(e) => handleRoomTypeChange(index, 'available', e.target.value)}
                          className="input"
                          placeholder="Available rooms *"
                          min="0"
                          required
                        />
                        <input
                          type="number"
                          value={room.deposit}
                          onChange={(e) => handleRoomTypeChange(index, 'deposit', e.target.value)}
                          className="input"
                          placeholder="Security deposit (₹) *"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Food & Amenities */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Food & Amenities</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Food Type</label>
                      <select
                        name="foodType"
                        value={formData.foodType}
                        onChange={handleInputChange}
                        className="input"
                        required
                      >
                        <option value="veg">Vegetarian</option>
                        <option value="non-veg">Non-Vegetarian</option>
                        <option value="both">Both</option>
                        <option value="none">No Food</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="input"
                      >
                        <option value="any">Any</option>
                        <option value="male">Male Only</option>
                        <option value="female">Female Only</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Food Schedule</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="foodSchedule.breakfast"
                          checked={formData.foodSchedule.breakfast}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        Breakfast
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="foodSchedule.lunch"
                          checked={formData.foodSchedule.lunch}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        Lunch
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="foodSchedule.dinner"
                          checked={formData.foodSchedule.dinner}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        Dinner
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['wifi', 'ac', 'laundry', 'cctv', 'parking', 'gym', 'power-backup', 'water-purifier', 'tv', 'fridge', 'geyser', 'attached-bathroom', 'balcony'].map(amenity => (
                        <label key={amenity} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={formData.amenities.includes(amenity)}
                            onChange={() => handleAmenityChange(amenity)}
                            className="mr-2"
                          />
                          {amenity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Contact Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="tel"
                      name="contactInfo.phone"
                      value={formData.contactInfo.phone}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Phone Number (10 digits) *"
                      pattern="[0-9]{10}"
                      required
                    />
                    <input
                      type="email"
                      name="contactInfo.email"
                      value={formData.contactInfo.email}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Email (optional)"
                    />
                  </div>
                  <input
                    type="tel"
                    name="contactInfo.whatsapp"
                    value={formData.contactInfo.whatsapp}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="WhatsApp Number (optional)"
                  />
                </div>

                {/* Nearby Colleges */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800">Nearby Colleges</h4>
                    <button
                      type="button"
                      onClick={addCollege}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add College
                    </button>
                  </div>
                  {formData.nearbyColleges.map((college, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">College {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeCollege(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={college.name}
                          onChange={(e) => handleCollegeChange(index, 'name', e.target.value)}
                          className="input"
                          placeholder="College Name *"
                          required
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={college.distance}
                            onChange={(e) => handleCollegeChange(index, 'distance', e.target.value)}
                            className="input flex-1"
                            placeholder="Distance *"
                            min="0"
                            step="0.1"
                            required
                          />
                          <select
                            value={college.unit}
                            onChange={(e) => handleCollegeChange(index, 'unit', e.target.value)}
                            className="input w-20"
                          >
                            <option value="km">km</option>
                            <option value="miles">miles</option>
                            <option value="meter">meter</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.nearbyColleges.length === 0 && (
                    <p className="text-gray-600 text-sm">No colleges added yet. Click "Add College" to add nearby colleges.</p>
                  )}
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Images</h4>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="input"
                  />
                  <p className="text-sm text-gray-600">Upload multiple images to showcase your PG (max 10 images)</p>
                  
                  {/* Preview Selected Images */}
                  {formData.images && formData.images.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-md font-medium text-gray-700">Selected Images ({formData.images.length})</h5>
                      <div className="grid grid-cols-4 gap-3">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Preview ${index + 1}`}
                              className="h-20 w-full rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index)
                                }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="btn-outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create PG'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OwnerDashboard



