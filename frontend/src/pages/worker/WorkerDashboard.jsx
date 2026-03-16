import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RatingStars from '../../components/rating/RatingStars';
import StatusBadge from '../../components/shared/StatusBadge';
import WorkerRegister from '../../components/worker/WorkerRegister';
import BookingRequests from '../../components/booking/BookingRequests';
import LocationMapPicker from '../../components/location/LocationMapPicker';
import '../shared/Dashboard.css';

function WorkerDashboard() {
  const { user, logout, api, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [workerProfile, setWorkerProfile] = useState(null);
  const [status, setStatus] = useState('available');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Check authentication and redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (!authLoading && user && user.role !== 'worker') {
      navigate('/customer-dashboard');
    }
  }, [user, authLoading, navigate]);

  // Fetch worker profile only after auth is loaded
  useEffect(() => {
    if (!authLoading && user && user.role === 'worker') {
      fetchWorkerProfile();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchWorkerProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/auth/me');
      if (response.data.workerProfile) {
        // Check if worker profile is complete and verified
        const workerData = response.data.workerProfile;
        if (!workerData.profileCompleted || !workerData.isVerified) {
          setError('');
          setLoading(false);
          // Redirect to complete profile if not verified
          navigate('/complete-profile');
          return;
        }

        setWorkerProfile(workerData);
        setStatus(workerData.status);
        if (workerData.latitude && workerData.longitude) {
          setWorkerLocation({ lat: workerData.latitude, lng: workerData.longitude });
        }
        
        // Auto-fetch and update location after profile is fetched
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              let locationName = workerData.location;
              
              // Reverse geocode to get location name
              try {
                const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                if (googleMapsApiKey) {
                  const geocodingResponse = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`
                  );
                  const geocodingData = await geocodingResponse.json();
                  if (geocodingData.results && geocodingData.results.length > 0) {
                    const addressComponents = geocodingData.results[0].address_components;
                    const cityComponent = addressComponents.find(comp => 
                      comp.types.includes('locality') || 
                      comp.types.includes('administrative_area_level_3') ||
                      comp.types.includes('administrative_area_level_2')
                    );
                    if (cityComponent) {
                      locationName = cityComponent.long_name;
                    }
                  }
                }
              } catch (geoErr) {
                console.log('Reverse geocoding failed, keeping existing location');
              }
              
              try {
                const updateResponse = await api.put(`/workers/${response.data.workerProfile._id}`, {
                  skill: response.data.workerProfile.skill,
                  experience: response.data.workerProfile.experience,
                  phone: response.data.workerProfile.phone,
                  location: locationName,
                  latitude,
                  longitude,
                });
                setWorkerLocation({ lat: latitude, lng: longitude });
                setWorkerProfile(updateResponse.data.worker);
              } catch (err) {
                console.log('Auto-location update skipped:', err.message);
              }
            },
            (error) => {
              console.log('Geolocation not available or denied:', error.message);
            }
          );
        }
        
        await fetchReviews(response.data.workerProfile._id);
      } else {
        // Worker profile doesn't exist yet
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching worker profile:', err);
      setError('Failed to fetch worker profile');
      setLoading(false);
    }
  };

  const fetchReviews = async (workerId) => {
    try {
      const response = await api.get(`/reviews/${workerId}`);
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update worker location - Open map picker
  const handleUpdateLocation = () => {
    setShowMapPicker(true);
  };

  // Handle location selected from map picker
  const handleLocationSelect = async (location) => {
    try {
      setLoading(true);
      const { lat, lng, location: locationName } = location;

      // Update worker profile with new location
      const response = await api.put(`/workers/${workerProfile._id}`, {
        skill: workerProfile.skill,
        experience: workerProfile.experience,
        phone: workerProfile.phone,
        location: locationName,
        latitude: lat,
        longitude: lng,
      });

      setWorkerLocation({ lat, lng });
      setWorkerProfile(response.data.worker);
      setShowMapPicker(false);
      setSuccess(`📍 Location updated: ${locationName} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      setLoading(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update location:', err);
      setError('Failed to update location');
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setError('');
      setSuccess('');
      
      const response = await api.put(`/workers/status/${workerProfile._id}`, {
        status: newStatus,
      });
      
      setStatus(newStatus);
      setWorkerProfile({
        ...workerProfile,
        status: newStatus,
      });
      setSuccess('Status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show loading while auth is being restored
  if (authLoading) {
    return (
      <div className="dashboard">
        <nav className="dashboard-nav">
          <div className="nav-left">
            <h2>👷 Worker Dashboard</h2>
          </div>
        </nav>
        <div className="dashboard-content" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!user || loading) return null;

  // Check if profile is incomplete
  const isProfileIncomplete = !workerProfile?.skill || !workerProfile?.experience || !workerProfile?.location;

  // Auto-show form if profile is incomplete
  const shouldShowEditForm = showEditForm || isProfileIncomplete;

  if (!workerProfile) {
    return (
      <div className="dashboard">
        <nav className="dashboard-nav">
          <div className="nav-left">
            <h2>👷 Worker Dashboard</h2>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </nav>
        <div className="dashboard-content">
          <div className="no-profile">
            <p>No worker profile found. Please register as a worker first.</p>
            <button onClick={() => navigate('/register')}>Register as Worker</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <button 
            className="profile-icon-btn"
            onClick={() => setShowProfileModal(true)}
            title="Click to view profile"
          >
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="profile-icon-img" />
            ) : (
              <div className="profile-icon-placeholder">👤</div>
            )}
          </button>
          
          <div className="nav-left-text">
            <h2>👷 Worker Dashboard</h2>
            <p>Welcome, {user.name}!</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
              <div className="profile-modal-header">
                <h3>Your Profile</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowProfileModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="profile-modal-content">
                {user?.profilePhoto && (
                  <img src={user.profilePhoto} alt="Profile" className="profile-modal-photo" />
                )}
                <div className="profile-info">
                  <div className="info-row">
                    <span className="label">Name:</span>
                    <span className="value">{user?.name || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Skill:</span>
                    <span className="value">{workerProfile?.skill ? workerProfile.skill.toUpperCase() : 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Experience:</span>
                    <span className="value">{workerProfile?.experience ? `${workerProfile.experience} years` : 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{user?.phone || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Location:</span>
                    <span className="value">{workerProfile?.location || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className="value"><StatusBadge status={status} /></span>
                  </div>
                </div>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowEditForm(true);
                  }}
                  style={{ marginTop: '20px', width: '100%' }}
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {shouldShowEditForm ? (
          <WorkerRegister
            workerId={workerProfile?._id}
            initialData={workerProfile}
            onSuccess={async (updatedWorker) => {
              setWorkerProfile(updatedWorker);
              if (updatedWorker.latitude && updatedWorker.longitude) {
                setWorkerLocation({ lat: updatedWorker.latitude, lng: updatedWorker.longitude });
              }
              
              // Refresh user data to get updated phone number
              try {
                const response = await api.get('/auth/me');
                if (response.data.user) {
                  localStorage.setItem('user', JSON.stringify(response.data.user));
                  // Trigger AuthContext update by reloading
                  window.location.reload();
                }
              } catch (err) {
                console.error('Failed to refresh user data:', err);
              }
              
              setShowEditForm(false);
              setSuccess('Profile updated successfully!');
              
              // Scroll to status section after profile update
              setTimeout(() => {
                const statusControl = document.querySelector('.status-control');
                if (statusControl) {
                  statusControl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 100);
              
              setTimeout(() => setSuccess(''), 3000);
            }}
            onCancel={() => isProfileIncomplete ? null : setShowEditForm(false)}
          />
        ) : (
          <>
            <section className="location-update-section">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Your Location
              </h3>
              <div className="location-info">
                {workerLocation ? (
                  <div className="location-details">
                    <p>✅ Location detected: ({workerLocation.lat.toFixed(4)}, {workerLocation.lng.toFixed(4)})</p>
                    <p className="location-text">{workerProfile?.location || 'Not set'}</p>
                  </div>
                ) : (
                  <p className="no-location">No location set. Update your location to appear in nearby workers!</p>
                )}
                <button 
                  className="btn-update-location"
                  onClick={handleUpdateLocation}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update My Location Now'}
                </button>
                
                {/* Map Picker Modal */}
                {showMapPicker && (
                  <LocationMapPicker
                    initialLocation={workerLocation}
                    onLocationSelect={handleLocationSelect}
                    onCancel={() => setShowMapPicker(false)}
                  />
                )}
              </div>
            </section>

            <section className="profile-section">
              <div className="profile-card">
                <div className="card-header">
                  <h3>Your Profile</h3>
                  {workerProfile && (
                    <button className="edit-btn" onClick={() => setShowEditForm(true)}>
                      Edit Profile
                    </button>
                  )}
                </div>
                {isProfileIncomplete && (
                  <div className="warning-message" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
                    ⚠️ Your profile is incomplete. Complete your profile to start receiving bookings!
                  </div>
                )}
                <div className="profile-info">
                  <div className="info-row">
                    <span className="label">Name:</span>
                    <span className="value">{user?.name || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Skill:</span>
                    <span className="value">{workerProfile?.skill ? workerProfile.skill.toUpperCase() : 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Experience:</span>
                    <span className="value">{workerProfile?.experience ? `${workerProfile.experience} years` : 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{user?.phone || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Location:</span>
                    <span className="value">
                      {workerProfile?.location || 'Not set'}
                      {workerProfile?.latitude && workerProfile?.longitude && (
                        <span className="coords"> ({workerProfile.latitude.toFixed(4)}, {workerProfile.longitude.toFixed(4)})</span>
                      )}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <StatusBadge status={status} />
                  </div>
                  {workerProfile?.isVerified && (
                    <div className="info-row">
                      <span className="label">Verification:</span>
                      <span className="verified-badge">✅ Verified Worker</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="status-control">
                <h3>Update Your Status</h3>
                {isProfileIncomplete && (
                  <p style={{ color: '#c33', fontSize: '14px', marginBottom: '10px' }}>
                    ⚠️ Complete your profile first to update status
                  </p>
                )}
                <div className="status-buttons">
                  <button
                    className={`status-btn available ${status === 'available' ? 'active' : ''}`}
                    onClick={() => handleStatusChange('available')}
                    disabled={isProfileIncomplete}
                    title={isProfileIncomplete ? 'Complete profile first' : 'Set yourself available'}
                  >
                    Set Available
                  </button>
                  <button
                    className={`status-btn busy ${status === 'busy' ? 'active' : ''}`}
                    onClick={() => handleStatusChange('busy')}
                    disabled={isProfileIncomplete}
                    title={isProfileIncomplete ? 'Complete profile first' : 'Set yourself busy'}
                  >
                    Set Busy
                  </button>
                </div>
              </div>
            </section>

            <BookingRequests />

            <section className="reviews-section">
              <div className="section-header">
                <h3>Your Reviews</h3>
                {workerProfile?.totalReviews > 0 && (
                  <RatingStars rating={workerProfile.averageRating} reviews={workerProfile.totalReviews} />
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="no-reviews">
                  <p>No reviews yet. Start getting reviews by completing jobs!</p>
                </div>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <strong>{review.userId.name}</strong>
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="review-rating">
                          {'⭐'.repeat(review.rating)}
                          <span className="rating-badge">{review.rating}/5</span>
                        </div>
                      </div>
                      <p className="review-text">{review.review}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default WorkerDashboard;
