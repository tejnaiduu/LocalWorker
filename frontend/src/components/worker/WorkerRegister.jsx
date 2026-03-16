import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LocationMapPicker from '../location/LocationMapPicker';
import './WorkerRegister.css';

export default function WorkerRegister({ workerId, onSuccess, onCancel }) {
  const { api } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    skill: '',
    experience: '',
    location: '',
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const formRef = useRef(null);

  // Populate form if updating existing profile
  useEffect(() => {
    if (workerId) {
      // Load existing worker data if updating
      const loadWorkerData = async () => {
        try {
          const response = await api.get(`/workers/${workerId}`);
          if (response.data) {
            setFormData({
              name: response.data.name || '',
              phone: response.data.phone || '',
              skill: response.data.skill || '',
              experience: response.data.experience || '',
              location: response.data.location || '',
            });
          }
        } catch (err) {
          console.error('Failed to load worker data');
        }
      };
      loadWorkerData();
    }
  }, [workerId, api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = async (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData.location,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    }));
    setShowMapPicker(false);
    setLocationStatus('success');
    setTimeout(() => setLocationStatus(''), 3000);
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setError('Geolocation not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    setLocationStatus('loading');
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: `${prev.location || 'Location'} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          latitude,
          longitude,
        }));
        setLocationStatus('success');
        setFetchingLocation(false);
        setTimeout(() => setLocationStatus(''), 3000);
      },
      (err) => {
        setLocationStatus('error');
        setFetchingLocation(false);
        if (err.code === 1) {
          setError('Location permission denied. Enable it in browser settings.');
        } else if (err.code === 2) {
          setError('Location unavailable. Check your connection.');
        } else {
          setError('Failed to fetch location');
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validation
      if (!formData.name || !formData.phone || !formData.skill || formData.experience === '' || !formData.location) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      if (isNaN(formData.experience) || formData.experience < 0) {
        setError('Experience must be a valid number');
        setLoading(false);
        return;
      }

      let response;
      if (workerId) {
        // Update existing worker profile
        response = await api.put(`/workers/${workerId}`, {
          ...formData,
          experience: Number(formData.experience),
          latitude: formData.latitude || undefined,
          longitude: formData.longitude || undefined,
        });
      } else {
        // Create new worker profile
        response = await api.post('/workers/register', {
          ...formData,
          experience: Number(formData.experience),
          latitude: formData.latitude || undefined,
          longitude: formData.longitude || undefined,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) {
          onSuccess(response.data.worker);
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving worker profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>{workerId ? 'Update Your Profile' : 'Complete Your Worker Profile'}</h2>
        
        {success && (
          <div className="alert success">
            ✓ Profile saved successfully!
          </div>
        )}

        {error && (
          <div className="alert error">
            ✗ {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="skill">Skill</label>
            <select
              id="skill"
              name="skill"
              value={formData.skill}
              onChange={handleChange}
              required
            >
              <option value="">Select a skill</option>
              <option value="plumber">Plumber</option>
              <option value="electrician">Electrician</option>
              <option value="carpenter">Carpenter</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="experience">Experience (years)</label>
            <input
              id="experience"
              type="number"
              name="experience"
              placeholder="Years of experience"
              value={formData.experience}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <div className="location-input-wrapper">
              <input
                id="location"
                type="text"
                name="location"
                placeholder="City / Area"
                value={formData.location}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="fetch-location-btn"
                onClick={handleFetchLocation}
                disabled={fetchingLocation}
                title="Fetch your current location"
              >
                {fetchingLocation ? '📍 Fetching...' : '📍 Fetch Location'}
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
            {locationStatus && (
              <div className={`location-status-message location-${locationStatus}`}>
                {locationStatus === 'loading' && '🔍 Detecting your location...'}
                {locationStatus === 'success' && '✅ Location updated successfully!'}
                {locationStatus === 'error' && '⚠️ Failed to fetch location'}
              </div>
            )}
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? (workerId ? 'Updating...' : 'Creating...') : (workerId ? 'Update Profile' : 'Complete Profile')}
          </button>

          {onCancel && (
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          )}
        </form>
      </div>

      {showMapPicker && (
        <LocationMapPicker
          initialLocation={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : null}
          onLocationSelect={handleLocationSelect}
          onCancel={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
}
