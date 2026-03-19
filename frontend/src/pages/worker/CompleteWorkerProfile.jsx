import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LocationMapPicker from '../../components/location/LocationMapPicker';
import '../shared/Dashboard.css';
import './CompleteWorkerProfile.css';

export default function CompleteWorkerProfile() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    skill: '',
    experience: '',
    location: '',
    latitude: null,
    longitude: null,
  });
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const formRef = useRef(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload JPG or PNG only.');
        setFile(null);
        return;
      }

      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setFile(null);
        return;
      }

      setError('');
      setFile(selectedFile);
    }
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location: location.location || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      latitude: location.lat,
      longitude: location.lng,
    }));
    setShowMapPicker(false);
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Get location name from coordinates
        const locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setFormData(prev => ({
          ...prev,
          location: locationName,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }));
        setFetchingLocation(false);
      },
      (err) => {
        setError('Unable to fetch location. Please ensure location permission is enabled.');
        setFetchingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.skill || !formData.experience || !formData.location) {
      setError('Please fill in all required fields (Skill, Experience, Location)');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('Please select your location using the map or fetch your current location');
      return;
    }

    // ID Proof is now optional for demo purposes
    // if (!file) {
    //   setError('ID Proof upload is required. Please upload a valid Aadhaar, PAN, or Driving License.');
    //   return;
    // }

    try {
      setLoading(true);
      const formDataPayload = new FormData();
      formDataPayload.append('skill', formData.skill);
      formDataPayload.append('experience', formData.experience);
      formDataPayload.append('location', formData.location);
      formDataPayload.append('latitude', formData.latitude);
      formDataPayload.append('longitude', formData.longitude);

      if (file) {
        formDataPayload.append('idProof', file);
      }

      console.log('API Base URL:', api.defaults.baseURL);
      console.log('Token present:', !!api.defaults.headers.common.Authorization);
      console.log('Submitting complete profile request...');

      const response = await api.post('/workers/complete-profile', formDataPayload);

      setSuccess('✓ Profile completed successfully!');
      
      // Navigate immediately without delay
      navigate('/worker-dashboard');
    } catch (err) {
      console.error('Complete profile error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(err.response?.data?.error || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complete-profile-container">
      <div className="complete-profile-card">
        <h2>📋 Complete Your Worker Profile</h2>
        <p className="subtitle">You're almost done! Just a few more details and your profile will be ready for verification.</p>

        {error && <div className="alert error">✗ {error}</div>}
        {success && <div className="alert success">✓ {success}</div>}

        {/* User Info Display */}
        <div className="user-info-display">
          <div className="info-item">
            <span className="label">Name:</span>
            <span className="value">{user?.name || 'Not set'}</span>
          </div>
          <div className="info-item">
            <span className="label">Email:</span>
            <span className="value">{user?.email || 'Not set'}</span>
          </div>
          <div className="info-item">
            <span className="label">Phone:</span>
            <span className="value">{user?.phone || 'Not set'}</span>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="complete-profile-form">
          {/* Skill Selection */}
          <div className="form-group">
            <label htmlFor="skill">Professional Skill *</label>
            <select
              id="skill"
              name="skill"
              value={formData.skill}
              onChange={handleInputChange}
              required
            >
              <option value="">Select your skill</option>
              <option value="plumber">🔧 Plumber</option>
              <option value="electrician">⚡ Electrician</option>
              <option value="carpenter">🪛 Carpenter</option>
            </select>
          </div>

          {/* Experience */}
          <div className="form-group">
            <label htmlFor="experience">Years of Experience *</label>
            <input
              id="experience"
              type="number"
              name="experience"
              placeholder="e.g., 5"
              value={formData.experience}
              onChange={handleInputChange}
              min="0"
              max="70"
              required
            />
          </div>

          {/* Location Selection */}
          <div className="form-group">
            <label htmlFor="location">Service Location *</label>
            <div className="location-input-wrapper">
              <input
                id="location"
                type="text"
                name="location"
                placeholder="City / Area"
                value={formData.location}
                onChange={handleInputChange}
                readOnly
              />
              <button
                type="button"
                className="fetch-location-btn"
                onClick={handleFetchLocation}
                disabled={fetchingLocation}
                title="Get your current location"
              >
                {fetchingLocation ? '📍 Fetching...' : '📍 Current Location'}
              </button>
              <button
                type="button"
                className="map-picker-btn"
                onClick={() => setShowMapPicker(true)}
                title="Select location on map"
              >
                🗺️ Select on Map
              </button>
            </div>
            {formData.location && (
              <p className="location-selected">
                ✓ Coordinates: ({formData.latitude?.toFixed(4)}, {formData.longitude?.toFixed(4)})
              </p>
            )}
          </div>

          {/* ID Proof Upload */}
          <div className="form-group">
            <label htmlFor="idProof">Upload ID Proof *</label>
            <p className="help-text">Required: Aadhaar, PAN, or Driving License (JPG/PNG, max 5MB)</p>
            <div className="file-input-wrapper">
              <input
                id="idProof"
                type="file"
                name="idProof"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/jpg"
              />
              <label htmlFor="idProof" className="file-label">
                {file ? (
                  <>
                    <span className="file-icon">📄</span>
                    <span className="file-info">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="file-icon">📤</span>
                    <span className="file-info">Click to upload or drag and drop</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-complete" disabled={loading}>
            {loading ? '⏳ Completing Profile...' : '✓ Complete Profile'}
          </button>

          <p className="info-note">
            ℹ️ <strong>Verification Process:</strong> After submission, an admin will review your ID proof and profile details. Once approved, you'll receive full dashboard access. This typically takes 24-48 hours.
          </p>
        </form>
      </div>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <LocationMapPicker
          initialLocation={formData.latitude && formData.longitude 
            ? { lat: formData.latitude, lng: formData.longitude } 
            : null}
          onLocationSelect={handleLocationSelect}
          onCancel={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
}
