import { useState, useCallback, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../../styles/LocationMapPicker.css';

const LocationMapPicker = ({ initialLocation, onLocationSelect, onCancel }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || { lat: 28.7041, lng: 77.1025 } // Default: Delhi
  );
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mapboxApiKey = import.meta.env.VITE_MAPBOX_API_KEY;

  // Set Mapbox access token
  mapboxgl.accessToken = mapboxApiKey;

  // Reverse geocode coordinates to get location name using Mapbox Geocoding API
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      if (!mapboxApiKey) {
        setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxApiKey}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const placeName = data.features[0].place_name;
        setLocationName(placeName);
      } else {
        setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  }, [mapboxApiKey]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxApiKey) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        accessToken: mapboxApiKey,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: 15,
        attributionControl: true,
      });

      map.current.on('load', () => {
        console.log('Mapbox map loaded successfully');
      });

      map.current.on('error', (err) => {
        console.error('Mapbox map error:', err);
        setError('Map failed to load. Check your API key.');
      });

      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl());

      // Create marker
      const markerEl = document.createElement('div');
      markerEl.style.width = '30px';
      markerEl.style.height = '30px';
      markerEl.style.background = 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 30 30%22%3E%3Ccircle cx=%2215%22 cy=%2215%22 r=%2212%22 fill=%22%23667eea%22 stroke=%22white%22 stroke-width=%222%22/%3E%3C/svg%3E")';
      markerEl.style.backgroundSize = 'contain';
      markerEl.style.cursor = 'grab';

      marker.current = new mapboxgl.Marker({ element: markerEl, draggable: true })
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(map.current);

      // Handle map click
      const handleMapClick = (e) => {
        const { lng, lat } = e.lngLat;
        const newLocation = { lat, lng };
        setSelectedLocation(newLocation);
        marker.current.setLngLat([lng, lat]);
        reverseGeocode(lat, lng);
      };

      map.current.on('click', handleMapClick);

      // Handle marker drag
      const handleMarkerDragEnd = () => {
        const lngLat = marker.current.getLngLat();
        const newLocation = { lat: lngLat.lat, lng: lngLat.lng };
        setSelectedLocation(newLocation);
        reverseGeocode(lngLat.lat, lngLat.lng);
      };

      marker.current.on('dragend', handleMarkerDragEnd);

      // Get initial location name
      reverseGeocode(selectedLocation.lat, selectedLocation.lng);

      return () => {
        if (map.current) {
          map.current.off('click', handleMapClick);
          if (marker.current) {
            marker.current.off('dragend', handleMarkerDragEnd);
          }
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }, [mapboxApiKey, reverseGeocode]);

  // Handle location save
  const handleSaveLocation = async () => {
    if (!selectedLocation) {
      setError('Please select a location on the map');
      return;
    }

    setLoading(true);
    try {
      await onLocationSelect({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        location: locationName,
      });
    } catch (err) {
      setError('Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  // Get current position
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setSelectedLocation(newLocation);
        marker.current.setLngLat([longitude, latitude]);
        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 15,
        });
        reverseGeocode(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        setError('Unable to get your current location');
        setLoading(false);
      }
    );
  };

  if (!mapboxApiKey) {
    return (
      <div className="location-map-picker-overlay">
        <div className="location-map-picker-error">
          ⚠️ Mapbox API key not configured
        </div>
      </div>
    );
  }

  return (
    <div className="location-map-picker-overlay">
      <div className="location-map-picker-container">
        <div className="picker-header">
          <h2>📍 Select Your Location</h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="picker-content">
          <div className="map-section" ref={mapContainer}></div>

          <div className="location-details-section">
            <div className="location-info">
              <div className="info-box">
                <strong>Selected Location:</strong>
                <p>{locationName || 'No location selected'}</p>
                <small>Lat: {selectedLocation?.lat.toFixed(4)}, Lng: {selectedLocation?.lng.toFixed(4)}</small>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-primary"
                onClick={handleCurrentLocation}
                disabled={loading}
              >
                {loading ? '⏳ Getting location...' : '📍 Use Current Location'}
              </button>
              <button
                className="btn btn-success"
                onClick={handleSaveLocation}
                disabled={loading || !selectedLocation}
              >
                {loading ? '⏳ Saving...' : '✓ Save Location'}
              </button>
              <button className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMapPicker;
