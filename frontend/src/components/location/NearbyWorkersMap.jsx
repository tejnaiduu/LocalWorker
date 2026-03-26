import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useAuth } from '../../context/AuthContext';
import './NearbyWorkersMap.css';

function NearbyWorkersMap({ skill = null, radius = 5 }) {
  const { api } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 28.7041, lng: 77.1025 }); // Default: Delhi

  // Get user's current location
  useEffect(() => {
    console.log(' Attempting to get user location...');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          console.log(' Location found:', location);
          setUserLocation(location);
          setMapCenter(location);
          setLoading(false); // Stop loading once we have location
        },
        (error) => {
          console.error(' Geolocation error:', error.code, error.message);
          console.log('Using default location (Delhi)');
          setError(`Location access: ${error.message}. Using default location.`);
          setLoading(false); // Stop loading even with error
          // Use default location (Delhi) if geolocation fails
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.error(' Geolocation not supported');
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);

  // Fetch nearby workers when user location is available
  useEffect(() => {
    if (!userLocation && mapCenter === { lat: 28.7041, lng: 77.1025 }) {
      // Only fetch if we have actual user location OR default was used
      console.log(' Waiting for valid location...');
      return;
    }

    const fetchNearbyWorkers = async () => {
      try {
        setLoading(true);
        setError('');

        const currentLat = userLocation?.lat || mapCenter.lat;
        const currentLng = userLocation?.lng || mapCenter.lng;

        console.log(' Fetching workers near:', { lat: currentLat, lng: currentLng, radius });

        let url = `/workers/nearby?lat=${currentLat}&lng=${currentLng}&radius=${radius}`;
        if (skill) {
          url += `&skill=${skill}`;
        }

        console.log(' API Request:', url);
        const response = await api.get(url);
        
        console.log(' Workers fetched:', response.data);
        setWorkers(response.data.workers || []);
        
        if (!response.data.workers || response.data.workers.length === 0) {
          console.warn(' No workers found in response');
        }
      } catch (err) {
        console.error(' Error fetching workers:', {
          status: err.response?.status,
          error: err.response?.data?.error,
          message: err.message,
          url: err.config?.url,
        });
        setError(err.response?.data?.error || err.message || 'Failed to fetch nearby workers');
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyWorkers();
  }, [userLocation, skill, radius, api, mapCenter]);

  const handleMarkerClick = useCallback((worker) => {
    setSelectedWorker(worker);
  }, []);

  const handleCallWorker = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '8px',
  };

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <div className="map-error">
        <p>Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.</p>
      </div>
    );
  }

  return (
    <div className="nearby-workers-map">
      {/* Debug Info - Location Status */}
      <div className="location-status">
        {userLocation ? (
          <div className="location-found">
             Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </div>
        ) : (
          <div className="location-searching">
             Searching for your location... Make sure location permission is enabled in your browser.
          </div>
        )}
      </div>

      {error && <div className="map-error-message">{error}</div>}

      {loading && userLocation && (
        <div className="map-loading">Loading nearby workers...</div>
      )}

      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={13}
          options={{
            styles: [
              {
                featureType: 'poi',
                cementElementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              title="Your Location"
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
            />
          )}

          {/* Worker Markers */}
          {workers.map((worker) => (
            <Marker
              key={worker._id}
              position={{
                lat: worker.latitude,
                lng: worker.longitude,
              }}
              title={worker.name || 'Unknown Worker'}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#34A853',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
              onClick={() => handleMarkerClick(worker)}
            />
          ))}

          {/* Info Window for Selected Worker */}
          {selectedWorker && (
            <InfoWindow
              position={{
                lat: selectedWorker.latitude,
                lng: selectedWorker.longitude,
              }}
              onCloseClick={() => setSelectedWorker(null)}
            >
              <div className="info-window-content">
                <h4>{selectedWorker.name || 'Worker'}</h4>
                <p className="skill-badge">{selectedWorker.skill}</p>
                <div className="worker-info">
                  <p>
                    <strong>Phone:</strong> {selectedWorker.phone || 'Not provided'}
                  </p>
                  {selectedWorker.distance && (
                    <p>
                      <strong>Distance:</strong> {selectedWorker.distance.toFixed(1)} km
                    </p>
                  )}
                  {selectedWorker.averageRating > 0 && (
                    <p>
                      <strong>Rating:</strong>  {selectedWorker.averageRating.toFixed(1)}/5 (
                      {selectedWorker.totalReviews} reviews)
                    </p>
                  )}
                </div>
                {selectedWorker.phone && (
                  <button
                    className="call-btn"
                    onClick={() => handleCallWorker(selectedWorker.phone)}
                  >
                     Call Now
                  </button>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Workers List Below Map */}
      {!loading && workers.length > 0 && (
        <div className="workers-list-below-map">
          <h3>Nearby Workers ({workers.length})</h3>
          <div className="workers-list">
            {workers.map((worker) => (
              <div key={worker._id} className="worker-list-item">
                <div className="worker-info-compact">
                  <h4>{worker.name || 'Unnamed Worker'}</h4>
                  <p className="skill">{worker.skill}</p>
                  <p className="distance"> {worker.distance.toFixed(1)} km away</p>
                  <p className="phone"> {worker.phone || 'No phone'}</p>
                  {worker.averageRating > 0 && (
                    <p className="rating"> {worker.averageRating.toFixed(1)}/5</p>
                  )}
                </div>
                <button
                  className="call-btn-compact"
                  onClick={() => handleCallWorker(worker.phone)}
                >
                  Call
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && workers.length === 0 && userLocation && (
        <div className="no-workers">
          <p>No workers found in your area. Try increasing the search radius.</p>
        </div>
      )}
    </div>
  );
}

export default NearbyWorkersMap;




