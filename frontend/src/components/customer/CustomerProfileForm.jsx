import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LocationMapPicker from '../location/LocationMapPicker';
import './CustomerProfileForm.css';

function CustomerProfileForm({ onSuccess, onCancel }) {
  const { user, api, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    profilePhoto: user?.profilePhoto || '',
    latitude: user?.latitude || null,
    longitude: user?.longitude || null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      location: user?.location || '',
      profilePhoto: user?.profilePhoto || '',
      latitude: user?.latitude || null,
      longitude: user?.longitude || null,
    });
    setLocationStatus(''); // Clear any previous status on load
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        // Format coordinates with city/area (could use reverse geocoding)
        // For now, store the coordinates in a hidden field
        setFormData((prev) => ({
          ...prev,
          location: `${prev.location || 'Location'} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
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
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put('/auth/profile', formData);
      setSuccess('Profile updated successfully!');
      
      // Update global user state and localStorage
      updateUser(response.data.user);
      
      if (onSuccess) {
        onSuccess(response.data.user);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-form-container">
      <div className="profile-form-card">
        <h3>Edit Profile</h3>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <div className="location-input-wrapper">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your location (city/area)"
                required
              />
              <button
                type="button"
                className="fetch-location-btn"
                onClick={handleFetchLocation}
                disabled={fetchingLocation}
                title="Fetch your current location"
              >
                {fetchingLocation ? ' Fetching...' : ' Fetch Location'}
              </button>
              <button
                type="button"
                className="map-picker-btn"
                onClick={() => setShowMapPicker(true)}
                title="Select location on map"
              >
                 Select on Map
              </button>
            </div>
            {locationStatus && (
              <div className={`location-status-message location-${locationStatus}`}>
                {locationStatus === 'loading' && ' Detecting your location...'}
                {locationStatus === 'success' && ' Location updated successfully!'}
                {locationStatus === 'error' && ' Failed to fetch location'}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Profile Photo URL</label>
            <input
              type="url"
              name="profilePhoto"
              value={formData.profilePhoto}
              onChange={handleChange}
              placeholder="Enter profile photo URL"
            />
          </div>

          {formData.profilePhoto && (
            <div className="photo-preview">
              <p>Preview:</p>
              <img src={formData.profilePhoto} alt="Profile Preview" />
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            {onCancel && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
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

export default CustomerProfileForm;




