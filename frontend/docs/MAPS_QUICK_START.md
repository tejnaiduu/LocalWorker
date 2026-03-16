# Google Maps Integration - Quick Start

## What Was Added

### 1. **NearbyWorkersMap.jsx** (Component)
   - Location: `frontend/src/components/NearbyWorkersMap.jsx`
   - Displays interactive Google Map with worker locations
   - Auto-detects user's current location
   - Shows worker markers and info windows
   - Fetches workers from backend `/api/workers/nearby` endpoint
   - Includes call button linking to phone

### 2. **NearbyWorkersMap.css** (Styling)
   - Location: `frontend/src/components/NearbyWorkersMap.css`
   - Responsive map container
   - Info window styling
   - Worker list card styling
   - Mobile optimized

### 3. **Setup Guide**
   - Location: `GOOGLE_MAPS_SETUP.md`
   - Detailed setup instructions
   - API key configuration
   - Integration examples
   - Troubleshooting guide

### 4. **Environment Template**
   - Location: `frontend/.env.local.example`
   - Copy to `.env.local` and add your API key

## Quick Integration (3 Steps)

### Step 1: Get Google Maps API Key
1. Visit: https://console.cloud.google.com/
2. Create project → Enable "Maps JavaScript API"
3. Create API key in Credentials section
4. Copy the key

### Step 2: Add to Frontend .env
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local and add your API key
```

### Step 3: Use the Component
```jsx
import NearbyWorkersMap from '../components/NearbyWorkersMap';

// In your component:
<NearbyWorkersMap radius={10} />

// With skill filter:
<NearbyWorkersMap skill="electrician" radius={10} />
```

## Component Features

✅ **Real-time Geolocation**
   - Auto-detects user location on load
   - Blue marker for user position

✅ **Worker Display**
   - Green markers for each worker
   - Click to see details
   - Shows name, skill, phone, rating, distance

✅ **Interactive Elements**
   - Click markers to view info
   - Call button launches phone dialer
   - List view below map with all workers

✅ **Filtering**
   - Filter by skill (electrician/plumber/carpenter)
   - Adjust search radius (1-25 km)
   - Distance calculation (backend handled)

✅ **Responsive Design**
   - Works on desktop and mobile
   - Touch-friendly markers
   - Scrollable worker list

## Backend Dependencies

Already set up:
- ✅ Worker model with latitude/longitude fields
- ✅ `/api/workers/nearby` endpoint (supports geolocation)
- ✅ Distance calculation (Haversine formula)
- ✅ Skill filtering
- ✅ Worker data with phone and ratings

## What You Need to Do

1. **Add Google Maps API Key** → `.env.local`
2. **Populate Worker Locations** → Ensure workers have latitude/longitude (can be added during registration or separately)
3. **Import & Use Component** → Add to your dashboard or create a dedicated page

## Worker Location Data

Workers need latitude/longitude coordinates. You can populate these in 3 ways:

**A. Manual Entry (Simplest)**
   - Let workers enter their address or coordinates during registration
   - Use Google Geocoding API to convert address → coordinates

**B. Auto Geolocation (Recommended)**
   - Auto-capture worker location on registration form load
   - Code example in `GOOGLE_MAPS_SETUP.md`

**C. Bulk Update (Admin)**
   - Create admin endpoint to batch update coordinates
   - Use external geocoding service

## Example Usage in Dashboard

```jsx
import NearbyWorkersMap from '../components/NearbyWorkersMap';

export function CustomerDashboard() {
  return (
    <div className="dashboard">
      {/* ... existing code ... */}
      
      <section className="nearby-section">
        <h2>Find Workers Near You</h2>
        <NearbyWorkersMap radius={10} />
      </section>
    </div>
  );
}
```

## Example: Full-Page Map with Filters

```jsx
import { useState } from 'react';
import NearbyWorkersMap from '../components/NearbyWorkersMap';

export function WorkersMapPage() {
  const [skill, setSkill] = useState(null);
  const [radius, setRadius] = useState(5);

  return (
    <div style={{ padding: '20px' }}>
      <h1>🗺️ Find Workers Near You</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <select value={skill || ''} onChange={(e) => setSkill(e.target.value || null)}>
          <option value="">All Skills</option>
          <option value="electrician">⚡ Electrician</option>
          <option value="plumber">🚰 Plumber</option>
          <option value="carpenter">🪵 Carpenter</option>
        </select>

        <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
          <option value={1}>1 km</option>
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={25}>25 km</option>
        </select>
      </div>

      <NearbyWorkersMap skill={skill} radius={radius} />
    </div>
  );
}
```

## Testing

1. Add the component to your dashboard
2. Open in browser and allow location access
3. Should see:
   - Blue marker at your location
   - Green markers for nearby workers
   - Worker list below map
   - Click markers to see details and call workers

## Important Notes

- **Geolocation requires HTTPS** (or localhost) → Use https in production
- **Browser permission** → Users must allow location access
- **Worker data** → Only workers with latitude/longitude will appear
- **API calls** → UseAuth context for authentication (already configured)
- **Markers** → Green for workers, Blue for user location

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── NearbyWorkersMap.jsx      ← NEW
│   │   └── NearbyWorkersMap.css      ← NEW
│   └── ...
├── .env.local                         ← ADD API KEY HERE
├── .env.local.example                 ← NEW (template)
└── package.json                       (updated with @react-google-maps/api)

backend/
├── models/
│   └── Worker.js                      (already has lat/lng fields)
├── routes/
│   └── workerRoutes.js                (has /nearby endpoint)
└── ...
```

## Next Steps

1. ✅ **Install package** → npm install @react-google-maps/api (done)
2. ✅ **Create components** → NearbyWorkersMap.jsx & CSS (done)
3. 🔄 **Add API Key** → Put in `.env.local`
4. 🔄 **Test component** → Integrate into dashboard
5. 🔄 **Populate worker data** → Add latitude/longitude to workers
6. 🔄 **Deploy** → Use HTTPS in production

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "API key not configured" | Add `VITE_GOOGLE_MAPS_API_KEY` to `.env.local` |
| "Cannot read property 'maps' of undefined" | Ensure LoadScript loads before Marker components |
| "Workers not appearing" | Check if workers have latitude/longitude in DB |
| "Cannot get user location" | Allow browser location permission in settings |
| "Map not visible on mobile" | Map container needs `height: '500px'` |

---

**Setup Time: ~10 minutes**
**Integration Time: ~5 minutes**
**Total: ~15 minutes**
