# Google Maps Integration Guide

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geolocation API
4. Create an API key (in **Credentials** section)
5. Restrict your key to:
   - JavaScript applications
   - HTTP referrers (localhost and your domain)

### 2. Add API Key to Frontend .env

Create or update `frontend/.env.local`:

```
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

Replace `YOUR_API_KEY_HERE` with your actual Google Maps API key.

### 3. Backend Worker Location Data

The backend already has worker location fields:
- `latitude` (Number)
- `longitude` (Number)

When workers register or update their profile, ensure they provide their location coordinates. You can:

**Option A: Manual Entry (Workers provide lat/lng)**
- Add input fields for latitude and longitude in worker registration form

**Option B: Automatic Geolocation**
- Use `navigator.geolocation` in the registration form to auto-capture coordinates

**Option C: Address to Coordinates (Geocoding)**
- Add a backend endpoint that converts addresses to coordinates using Google Maps Geocoding API

### 4. Update Worker Registration Form (Optional)

To capture locations during worker registration, update your worker registration component:

```jsx
import { useState, useEffect } from 'react';

function WorkerRegister() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Auto-get location on form load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Include latitude and longitude in the API call
    const workerData = {
      // ... other fields
      latitude,
      longitude,
    };
    // Send to backend
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... other fields ... */}
      <input type="hidden" value={latitude} />
      <input type="hidden" value={longitude} />
    </form>
  );
}
```

### 5. Use the Map Component

**Option A: In Customer Dashboard**

```jsx
import NearbyWorkersMap from '../components/NearbyWorkersMap';

function CustomerDashboard() {
  return (
    <div>
      {/* ... existing code ... */}
      <section className="map-section">
        <h2>Find Workers Near You</h2>
        <NearbyWorkersMap radius={10} />
      </section>
    </div>
  );
}
```

**Option B: Full-Screen Map Page**

Create a new file: `frontend/src/pages/NearbyWorkersPage.jsx`

```jsx
import { useState } from 'react';
import NearbyWorkersMap from '../components/NearbyWorkersMap';

function NearbyWorkersPage() {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [radius, setRadius] = useState(5);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Find Workers Near You</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
        <select 
          value={selectedSkill || ''} 
          onChange={(e) => setSelectedSkill(e.target.value || null)}
        >
          <option value="">All Skills</option>
          <option value="electrician">Electrician</option>
          <option value="plumber">Plumber</option>
          <option value="carpenter">Carpenter</option>
        </select>

        <select 
          value={radius} 
          onChange={(e) => setRadius(Number(e.target.value))}
        >
          <option value={1}>1 km</option>
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={25}>25 km</option>
        </select>
      </div>

      <NearbyWorkersMap skill={selectedSkill} radius={radius} />
    </div>
  );
}

export default NearbyWorkersPage;
```

Then add this route in your React Router setup:

```jsx
import NearbyWorkersPage from './pages/NearbyWorkersPage';

<Route path="/nearby-workers" element={<NearbyWorkersPage />} />
```

### 6. Component Props

The `NearbyWorkersMap` component accepts:

- **skill** (string, optional): Filter by skill ('electrician', 'plumber', 'carpenter')
- **radius** (number, optional): Search radius in kilometers (default: 5)

Example:
```jsx
<NearbyWorkersMap skill="electrician" radius={10} />
```

## Features

✅ User location detection (blue marker)
✅ Worker markers (green circles)
✅ Info windows showing worker details
✅ Call button via tel: protocol
✅ Distance calculation (already done on backend)
✅ Worker list display below map
✅ Mobile responsive
✅ Skill filtering
✅ Radius filtering
✅ Rating display

## API Endpoints Used

- `GET /api/workers/nearby?lat={lat}&lng={lng}&radius={radius}&skill={skill}`

This endpoint returns:
```json
{
  "searchLocation": { "lat": 28.7041, "lng": 77.1025 },
  "radius": 5,
  "count": 5,
  "workers": [
    {
      "_id": "...",
      "name": "John Plumber",
      "skill": "plumber",
      "phone": "+91234567890",
      "latitude": 28.7050,
      "longitude": 77.1030,
      "distance": 1.2,
      "averageRating": 4.5,
      "totalReviews": 12
    }
  ]
}
```

## Troubleshooting

**"Google Maps API key is not configured"**
- Make sure `VITE_GOOGLE_MAPS_API_KEY` is in your `.env.local` file
- Restart the dev server after adding the key

**"Unable to get your location"**
- Your browser needs permission to access location
- Check browser privacy settings
- The map will use a default location (Delhi)

**Workers not appearing on map**
- Ensure workers have `latitude` and `longitude` values in the database
- Check the browser console for API errors
- Verify the API key has Maps JavaScript API enabled

**Markers not clickable**
- Make sure the LoadScript has the correct API key
- Check that workers array is being populated correctly

## Security Notes

- Store your Google Maps API key in environment variables (done ✓)
- Restrict your API key to specific referrers in Google Cloud Console
- Consider enabling billing alerts in Google Cloud
