import { useState, useCallback, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationMapPicker.css';

// Fix for default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

  // Reverse geocode coordinates to get location name using OpenStreetMap Nominatim API
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      if (data.address) {
        const addressParts = [];
        if (data.address.road) addressParts.push(data.address.road);
        if (data.address.city) addressParts.push(data.address.city);
        if (data.address.state) addressParts.push(data.address.state);
        
        if (addressParts.length > 0) {
          setLocationName(addressParts.join(', '));
        } else {
          setLocationName(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      } else {
        setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Create map
      map.current = L.map(mapContainer.current).setView(
        [selectedLocation.lat, selectedLocation.lng],
        15
      );

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '(c) OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);

      // Create draggable marker
      marker.current = L.marker(
        [selectedLocation.lat, selectedLocation.lng],
        { draggable: true }
      )
        .addTo(map.current)
        .bindPopup('Drag to move<br/>Click map to select');

      // Handle map click
      const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        const newLocation = { lat, lng };
        setSelectedLocation(newLocation);
        marker.current.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      };

      map.current.on('click', handleMapClick);

      // Handle marker drag
      const handleMarkerDragEnd = () => {
        const { lat, lng } = marker.current.getLatLng();
        const newLocation = { lat, lng };
        setSelectedLocation(newLocation);
        reverseGeocode(lat, lng);
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
  }, [reverseGeocode]);

  // Handle location save
  const handleSaveLocation = async () => {
    if (!selectedLocation) {
      setError('Please select a location on the map');
      return;
    }

    setLoading(true);
    try {
      await onLocationSelect({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
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
        marker.current.setLatLng([latitude, longitude]);
        map.current.flyTo([latitude, longitude], 15);
        reverseGeocode(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        setError('Unable to get your current location');
        setLoading(false);
      }
    );
  };

  return (
    <div className="location-map-picker-overlay">
      <div className="location-map-picker-container">
        <div className="picker-header">
          <h2>Select Your Location</h2>
          <button className="close-btn" onClick={onCancel}>X</button>
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
                {loading ? 'Getting location...' : 'Use Current Location'}
              </button>
              <button
                className="btn btn-success"
                onClick={handleSaveLocation}
                disabled={loading || !selectedLocation}
              >
                {loading ? 'Saving...' : 'Save Location'}
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


