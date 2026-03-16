import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './MapDebugPanel.css';

/**
 * MapDebugPanel - Debug tool for troubleshooting location and workers fetching
 * 
 * Usage:
 * import MapDebugPanel from './MapDebugPanel';
 * <MapDebugPanel />
 */

function MapDebugPanel() {
  const { api } = useAuth();
  const [debugInfo, setDebugInfo] = useState({
    browserSupport: false,
    hasPermission: null,
    userLocation: null,
    workers: null,
    errors: [],
  });

  const [testLat, setTestLat] = useState('28.7041');
  const [testLng, setTestLng] = useState('77.1025');
  const [testRadius, setTestRadius] = useState('5');

  // Check browser geolocation support
  useEffect(() => {
    const hasSupport = !!navigator.geolocation;
    setDebugInfo(prev => ({
      ...prev,
      browserSupport: hasSupport,
    }));
  }, []);

  // Test getting user location
  const testGetLocation = () => {
    setDebugInfo(prev => ({
      ...prev,
      errors: [...prev.errors, '🔍 Testing geolocation...'],
    }));

    if (!navigator.geolocation) {
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, '❌ Geolocation not supported'],
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setDebugInfo(prev => ({
          ...prev,
          userLocation: location,
          errors: [...prev.errors, `✅ Location found: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`],
        }));
        setTestLat(location.latitude.toString());
        setTestLng(location.longitude.toString());
      },
      (error) => {
        const errorMsg = `❌ Geolocation error: ${error.code} - ${error.message}`;
        setDebugInfo(prev => ({
          ...prev,
          hasPermission: false,
          errors: [...prev.errors, errorMsg],
        }));
      }
    );
  };

  // Test API endpoint
  const testFetchWorkers = async () => {
    setDebugInfo(prev => ({
      ...prev,
      errors: [...prev.errors, `📡 Testing API: /workers/nearby?lat=${testLat}&lng=${testLng}&radius=${testRadius}`],
    }));

    try {
      const url = `/workers/nearby?lat=${testLat}&lng=${testLng}&radius=${testRadius}`;
      const response = await api.get(url);
      
      setDebugInfo(prev => ({
        ...prev,
        workers: response.data,
        errors: [
          ...prev.errors,
          `✅ API Success! Found ${response.data.workers?.length || 0} workers`,
        ],
      }));
    } catch (error) {
      let errorMsg = '❌ API Error: ';
      if (error.response) {
        errorMsg += `${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMsg += 'No response from server (Network error)';
      } else {
        errorMsg += error.message;
      }
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, errorMsg],
      }));
    }
  };

  // Test backend connectivity
  const testBackendHealth = async () => {
    setDebugInfo(prev => ({
      ...prev,
      errors: [...prev.errors, '🔌 Testing backend connectivity...'],
    }));

    try {
      const response = await api.get('/health');
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, `✅ Backend healthy: ${response.status}`],
      }));
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, '❌ Backend unreachable. Make sure backend is running on port 5000'],
      }));
    }
  };

  const clearLogs = () => {
    setDebugInfo(prev => ({
      ...prev,
      errors: [],
    }));
  };

  return (
    <div className="map-debug-panel">
      <div className="debug-header">
        🔧 Map Debug Panel
      </div>

      {/* Browser Support Check */}
      <div className="debug-section">
        <h4>Browser Support</h4>
        <p>
          Geolocation: {debugInfo.browserSupport ? '✅ Supported' : '❌ Not Supported'}
        </p>
      </div>

      {/* Quick Tests */}
      <div className="debug-section">
        <h4>Quick Tests</h4>
        <button onClick={testGetLocation} className="debug-btn">
          📍 Test Get Location
        </button>
        <button onClick={testBackendHealth} className="debug-btn">
          🔌 Test Backend
        </button>
      </div>

      {/* Location Info */}
      {debugInfo.userLocation && (
        <div className="debug-section">
          <h4>Your Location</h4>
          <p>Lat: {debugInfo.userLocation.latitude.toFixed(6)}</p>
          <p>Lng: {debugInfo.userLocation.longitude.toFixed(6)}</p>
          <p>Accuracy: ±{debugInfo.userLocation.accuracy.toFixed(0)}m</p>
        </div>
      )}

      {/* Manual Worker Test */}
      <div className="debug-section">
        <h4>Test Worker Fetch</h4>
        <div className="debug-inputs">
          <label>
            Latitude:
            <input
              type="number"
              value={testLat}
              onChange={(e) => setTestLat(e.target.value)}
              step="0.0001"
            />
          </label>
          <label>
            Longitude:
            <input
              type="number"
              value={testLng}
              onChange={(e) => setTestLng(e.target.value)}
              step="0.0001"
            />
          </label>
          <label>
            Radius (km):
            <input
              type="number"
              value={testRadius}
              onChange={(e) => setTestRadius(e.target.value)}
            />
          </label>
        </div>
        <button onClick={testFetchWorkers} className="debug-btn">
          🔍 Fetch Workers
        </button>
      </div>

      {/* Workers Response */}
      {debugInfo.workers && (
        <div className="debug-section">
          <h4>Workers Response</h4>
          <pre>{JSON.stringify(debugInfo.workers, null, 2)}</pre>
        </div>
      )}

      {/* Logs */}
      <div className="debug-section debug-logs">
        <h4>
          Logs ({debugInfo.errors.length})
          <button onClick={clearLogs} className="debug-btn-small">Clear</button>
        </h4>
        <div className="log-entries">
          {debugInfo.errors.map((error, idx) => (
            <div key={idx} className="log-entry">
              {error}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MapDebugPanel;
