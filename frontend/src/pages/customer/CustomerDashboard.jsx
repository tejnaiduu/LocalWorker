import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WorkerCard from '../../components/worker/WorkerCard';
import WorkerDetails from '../../components/worker/WorkerDetails';
import EmergencyButton from '../../components/shared/EmergencyButton';
import CustomerProfileForm from '../../components/customer/CustomerProfileForm';
import BookingForm from '../../components/booking/BookingForm';
import BookingHistory from '../../components/booking/BookingHistory';
import '../shared/Dashboard.css';

function CustomerDashboard() {
  const { user, logout, api, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(user);
  const [successMessage, setSuccessMessage] = useState('');
  const [customerLocation, setCustomerLocation] = useState(user?.latitude && user?.longitude ? { lat: user.latitude, lng: user.longitude } : null);
  const [workersWithDistance, setWorkersWithDistance] = useState([]);
  const [nearbyWorkers, setNearbyWorkers] = useState([]);
  const [showLocationUpdate, setShowLocationUpdate] = useState(false);
  const [showBookingHistory, setShowBookingHistory] = useState(false);

  useEffect(() => {
    setProfileData(user);
    if (user?.latitude && user?.longitude) {
      setCustomerLocation({ lat: user.latitude, lng: user.longitude });
    }
  }, [user]);

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Sort workers by distance if customer has location
  const sortWorkersByDistance = (workerList) => {
    if (!customerLocation) return workerList;

    return workerList.map((worker) => {
      let distance = null;
      if (worker.latitude && worker.longitude) {
        distance = calculateDistance(
          customerLocation.lat,
          customerLocation.lng,
          worker.latitude,
          worker.longitude
        );
      }
      return { ...worker, distance };
    }).sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  };

  // Update customer location
  const handleUpdateLocation = async () => {
    try {
      setLoading(true);
      if (!navigator.geolocation) {
        setError('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 Location updated:', { latitude, longitude });

          // Reverse geocode to get location name
          let locationName = profileData.location;
          try {
            const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            if (googleMapsApiKey) {
              const geocodingResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`
              );
              const geocodingData = await geocodingResponse.json();
              if (geocodingData.results && geocodingData.results.length > 0) {
                // Extract city/area name from the results
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

          // Update profile with new location
          const response = await api.put('/auth/profile', {
            name: profileData.name,
            phone: profileData.phone,
            location: locationName,
            latitude,
            longitude,
          });

          setCustomerLocation({ lat: latitude, lng: longitude });
          setProfileData(response.data.user);
          setShowLocationUpdate(false);
          setSuccessMessage(`📍 Location: ${locationName} (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) - Refreshing nearby workers...`);
          
          // Refetch workers after location update
          await fetchWorkers();
          setLoading(false);
          setTimeout(() => setSuccessMessage(''), 3000);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get location. Make sure you granted permission.');
          setLoading(false);
        }
      );
    } catch (err) {
      setError('Failed to update location');
      setLoading(false);
    }
  };

  // Check authentication and redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (!authLoading && user && user.role !== 'customer') {
      navigate('/worker-dashboard');
    }
  }, [user, authLoading, navigate]);

  // Fetch workers only after auth is fully loaded
  useEffect(() => {
    if (!authLoading && user && user.role === 'customer') {
      fetchWorkers();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading, filter]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = '/workers';
      if (filter !== 'all') {
        url = `/workers/skill/${filter}`;
      }
      
      const response = await api.get(url);
      const workerList = response.data;

      // Sort by distance
      const sorted = sortWorkersByDistance(workerList);
      setWorkers(sorted);
      setWorkersWithDistance(sorted);

      // Separate nearby workers (within 10 km) from all workers
      const nearby = sorted.filter((w) => w.distance !== null && w.distance <= 10);
      const all = sorted;
      
      setNearbyWorkers(nearby);
      console.log(`Found ${nearby.length} nearby workers (within 10km), ${all.length} total workers`);
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError(err.message || 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencySearch = async (skill) => {
    try {
      setLoading(true);
      setError('');

      let url;
      // If customer has location, use nearby workers API
      if (customerLocation) {
        url = `/workers/nearby?lat=${customerLocation.lat}&lng=${customerLocation.lng}&radius=10&skill=${skill}`;
        console.log('Searching for nearby workers:', url);
        const response = await api.get(url);
        const workerList = response.data.workers || [];
        
        // Add distance info
        const withDistance = workerList.map((worker) => ({
          ...worker,
          distance: response.data.searchLocation ? 
            calculateDistance(
              response.data.searchLocation.lat,
              response.data.searchLocation.lng,
              worker.latitude,
              worker.longitude
            ) : null
        }));
        
        setWorkers(withDistance);
        setWorkersWithDistance(withDistance);
        setNearbyWorkers(withDistance);
        setFilter(skill);
        setSuccessMessage(`Found ${withDistance.length} nearby ${skill}s within 10km!`);
      } else {
        // Fallback to regular search
        url = `/workers/skill/${skill}`;
        const response = await api.get(url);
        setWorkers(response.data);
        setFilter(skill);
        setSuccessMessage('⚠️ Update your location to see distance-based results!');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to search for workers');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBookClick = (worker) => {
    setSelectedWorkerForBooking(worker);
    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedWorkerForBooking(null);
    setSelectedWorker(null);
    setSuccessMessage('✅ Booking created successfully! Check your bookings history.');
    setTimeout(() => setSuccessMessage(''), 3000);
    // Optionally refresh workers list
    fetchWorkers();
  };

  const handleProfileUpdate = (updatedUser) => {
    setProfileData(updatedUser);
    setCustomerLocation({ lat: updatedUser.latitude, lng: updatedUser.longitude });
    setShowProfileForm(false);
    setSuccessMessage('✅ Profile updated! Refreshing workers list...');
    // Refetch workers with new location
    fetchWorkers();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Show loading while auth is being restored
  if (authLoading) {
    return (
      <div className="dashboard">
        <nav className="dashboard-nav">
          <div className="nav-left">
            <h2>👤 Customer Dashboard</h2>
          </div>
        </nav>
        <div className="dashboard-content" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-left">
          {/* Profile Icon in Header */}
          <button 
            className="profile-icon-btn"
            onClick={() => setShowProfileModal(true)}
            title="Click to view profile"
          >
            {profileData?.profilePhoto ? (
              <img src={profileData.profilePhoto} alt="Profile" className="profile-icon-img" />
            ) : (
              <div className="profile-icon-placeholder">👤</div>
            )}
          </button>
          
          <div className="nav-left-text">
            <h2>Customer Dashboard</h2>
            <p>Welcome, {user.name}!</p>
          </div>
        </div>
        
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
                {profileData?.profilePhoto && (
                  <img src={profileData.profilePhoto} alt="Profile" className="profile-modal-photo" />
                )}
                <div className="profile-modal-info">
                  <h4>{profileData?.name}</h4>
                  <p className="modal-email">{profileData?.email}</p>
                  <div className="modal-details">
                    {profileData?.phone && (
                      <div className="detail-item">
                        <span className="detail-label">📱 Phone:</span>
                        <span className="detail-value">{profileData.phone}</span>
                      </div>
                    )}
                    {profileData?.location && (
                      <div className="detail-item">
                        <span className="detail-label">📍 Location:</span>
                        <span className="detail-value">{profileData.location}</span>
                      </div>
                    )}
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowProfileModal(false);
                      setShowProfileForm(true);
                    }}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowProfileModal(false);
                      setShowBookingHistory(true);
                    }}
                  >
                    📅 My Bookings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Profile Edit Form */}
        {showProfileForm && (
          <div className="profile-form-section">
            <CustomerProfileForm
              onSuccess={handleProfileUpdate}
              onCancel={() => setShowProfileForm(false)}
            />
          </div>
        )}

        {/* Emergency Section */}
        {!showProfileForm && (
          <>
            <section className="location-update-section">
              <h3>📍 Your Location</h3>
              <div className="location-info">
                {customerLocation ? (
                  <div className="location-details">
                    <p>✅ Location detected: ({customerLocation.lat.toFixed(4)}, {customerLocation.lng.toFixed(4)})</p>
                    <p className="location-text">{profileData?.location || 'Not set'}</p>
                  </div>
                ) : (
                  <p className="no-location">No location set. Update your location to find nearby workers!</p>
                )}
                <button 
                  className="btn-update-location"
                  onClick={handleUpdateLocation}
                  disabled={loading}
                >
                  {loading ? '📍 Updating...' : '📍 Update My Location Now'}
                </button>
              </div>
            </section>

            <section className="emergency-section">
            <h3>🚨 Emergency Services</h3>
            <div className="emergency-buttons">
              <EmergencyButton skill="electrician" onSearch={() => handleEmergencySearch('electrician')} />
              <EmergencyButton skill="plumber" onSearch={() => handleEmergencySearch('plumber')} />
              <EmergencyButton skill="carpenter" onSearch={() => handleEmergencySearch('carpenter')} />
            </div>
          </section>
          </>
        )}

        {/* Workers Section */}
        {!showProfileForm && (
          <section className="workers-section">
            {/* Nearby Workers Section */}
            {customerLocation && nearbyWorkers.length > 0 && (
              <div className="nearby-workers-subsection">
                <div className="section-header">
                  <h3>🎯 Nearby Workers (Within 10km)</h3>
                  <span className="worker-count">{nearbyWorkers.length} found</span>
                </div>

                {filter !== 'all' && (
                  <div className="filter-badge">
                    Filtered by: {filter}
                    <button 
                      className="clear-filter-btn"
                      onClick={() => setFilter('all')}
                    >
                      ✕ Clear
                    </button>
                  </div>
                )}

                <div className="workers-grid">
                  {nearbyWorkers.map((worker) => (
                    <WorkerCard 
                      key={worker._id}
                      worker={worker}
                      distance={worker.distance}
                      onClick={() => setSelectedWorker(worker)}
                      onBookClick={handleBookClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Workers Section */}
            <div className="all-workers-subsection">
              <div className="section-header">
                <h3>{customerLocation && nearbyWorkers.length > 0 ? '📋 All Available Workers' : '🔍 Find Workers'}</h3>
                <div className="filters">
                  <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${filter === 'electrician' ? 'active' : ''}`}
                    onClick={() => setFilter('electrician')}
                  >
                    ⚡ Electrician
                  </button>
                  <button
                    className={`filter-btn ${filter === 'plumber' ? 'active' : ''}`}
                    onClick={() => setFilter('plumber')}
                  >
                    🚰 Plumber
                  </button>
                  <button
                    className={`filter-btn ${filter === 'carpenter' ? 'active' : ''}`}
                    onClick={() => setFilter('carpenter')}
                  >
                    🪵 Carpenter
                  </button>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              {loading ? (
                <div className="loading">Loading workers...</div>
              ) : workersWithDistance.length === 0 ? (
                <div className="no-workers">No workers found</div>
              ) : (
                <div className="workers-grid">
                  {workersWithDistance.map((worker) => (
                    <WorkerCard 
                      key={worker._id}
                      worker={worker}
                      distance={worker.distance}
                      onClick={() => setSelectedWorker(worker)}
                      onBookClick={handleBookClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {selectedWorker && (
        <WorkerDetails
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
          onBookClick={handleBookClick}
        />
      )}

      {showBookingForm && selectedWorkerForBooking && (
        <BookingForm
          worker={selectedWorkerForBooking}
          onSuccess={handleBookingSuccess}
          onCancel={() => {
            setShowBookingForm(false);
            setSelectedWorkerForBooking(null);
          }}
        />
      )}

      {showBookingHistory && (
        <div className="booking-history-modal-overlay" onClick={() => setShowBookingHistory(false)}>
          <div className="booking-history-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="booking-history-header">
              <h2>📅 Your Bookings</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowBookingHistory(false)}
              >
                ✕
              </button>
            </div>
            <BookingHistory />
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
