# Location Fetching - Checklist & Solutions

## ✅ Before Testing the Map

### 1. Browser Permission

The **most common issue** is browser location permission being denied.

**Enable Location Permission:**

- **Chrome/Edge**: 
  - Click 🔒 icon in address bar → Site settings → Location → Allow
  
- **Firefox**: 
  - Preferences → Privacy → Permissions → Location → Allow
  
- **Safari**: 
  - System Preferences → Security & Privacy → Location Services → Enable

**After enabling:**
1. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Refresh page (F5)
3. Try again

---

### 2. Environment Variable

Ensure Google Maps API key is set:

```bash
# Check if .env.local exists
cat frontend/.env.local

# Should contain:
# VITE_GOOGLE_MAPS_API_KEY=<your_key>
```

If missing, create it:
```bash
cat > frontend/.env.local << EOF
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY
VITE_API_URL=http://localhost:5000/api
EOF
```

Then **restart dev server**:
```bash
cd frontend
npm run dev
```

---

### 3. Backend Must Be Running

```bash
# Terminal 1: Backend
cd backend
npm start
# Should see: "Server running on port 5000"

# Terminal 2: Frontend  
cd frontend
npm run dev
# Should see: "Local: http://localhost:5173"
```

---

### 4. Workers Need Location Data

Workers must have `latitude` and `longitude` in the database.

**Add test worker with location:**

```bash
# Using MongoDB directly:
mongo LOCAL_WORKER

db.workers.insertOne({
  name: "Test Electrician",
  skill: "electrician",
  phone: "+919999999999",
  latitude: 28.7050,      # IMPORTANT
  longitude: 77.1030,     # IMPORTANT
  status: "available",
  averageRating: 4.5,
  totalReviews: 10
})
```

Or register a new worker and ensure they have coordinates.

---

## 🔧 Debug Panel (Easy Troubleshooting)

Use the **MapDebugPanel** component to test everything:

```jsx
// frontend/src/pages/TestMapPage.jsx
import MapDebugPanel from '../components/MapDebugPanel';
import NearbyWorkersMap from '../components/NearbyWorkersMap';

function TestMapPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🗺️ Map Debug & Test</h1>
      <MapDebugPanel />
      <NearbyWorkersMap />
    </div>
  );
}

export default TestMapPage;
```

Then visit: `http://localhost:5173/test-map`

**The debug panel shows:**
- ✅ Browser geolocation support
- ✅ Your current location
- ✅ Backend connectivity
- ✅ Workers API response
- ✅ All errors/logs

---

## 🚨 Common Issues & Fixes

### Issue: "🔍 Searching for your location... (yellow banner)"

**Cause:** Browser permission not granted

**Solution:**
1. Click address bar location icon
2. Change permission to "Allow"
3. Hard refresh (Ctrl+Shift+R)

---

### Issue: "❌ Error fetching workers: 404 Not Found"

**Cause:** Backend endpoint missing or wrong URL

**Solution:**
```bash
# Check if /workers/nearby endpoint exists
grep -r "'/nearby'" backend/routes/

# Should find something like:
# router.get('/nearby', async (req, res) => { ... })
```

---

### Issue: "Error fetching workers: No workers found"

**Cause:** Workers don't have coordinates, or they're far away

**Solution:**
```bash
# Check workers in database
mongo LOCAL_WORKER
db.workers.find({ latitude: { $exists: true } })

# Add coordinates to existing workers:
db.workers.updateMany(
  { latitude: null },
  { $set: { latitude: 28.7050, longitude: 77.1030 } }
)
```

---

### Issue: "Network error: Backend unreachable"

**Cause:** Backend not running

**Solution:**
```bash
# Start backend in new terminal
cd backend
npm start

# Check if port 5000 is listening
netstat -an | grep 5000
```

---

### Issue: "Failed to fetch: 401 Unauthorized"

**Cause:** Not logged in (no JWT token)

**Solution:**
1. Go to Login page
2. Login with valid credentials
3. Then try map again

---

## 📋 Full Testing Steps

1. **Terminal 1:**
   ```bash
   cd backend
   npm start
   # Wait for: "Server running on port 5000"
   ```

2. **Terminal 2:**
   ```bash
   cd frontend
   npm run dev
   # Wait for: "Local: http://localhost:5173"
   ```

3. **Browser:**
   - Go to `http://localhost:5173`
   - Login to an account
   - Click to go to Map page
   - **Allow location permission** when prompted
   - Wait for location to appear (green banner)

4. **Check Browser Console (F12):**
   ```
   ✅ Location found: 28.7050, 77.1030
   📍 Fetching workers near: {...}
   ✅ Workers fetched: [...]
   ```

---

## 🎯 Debug Panel Walkthrough

### Step 1: Test Browser Support
Click **📍 Test Get Location**
- If error: Browser doesn't support geolocation (use modern browser)
- If success: Browser is ready ✅

### Step 2: Test Backend
Click **🔌 Test Backend**
- If error: Backend not running (start it)
- If success: Backend is ready ✅

### Step 3: Test Worker Fetch
Edit lat/lng to match your location, then click **🔍 Fetch Workers**
- If workers appear: Everything works ✅
- If empty: Workers don't have coordinates (add them)
- If error: API/auth issue (check logs)

---

## 📍 How to Add Coordinates to Workers

### Option A: During Registration

Update your Worker Registration form:

```jsx
import { useState, useEffect } from 'react';

function WorkerRegister() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Auto-capture location on form load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => console.error('Location error:', error)
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Include in API call:
    await api.post('/workers/register', {
      // ... other fields ...
      latitude,
      longitude,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... form fields ... */}
      <input type="hidden" value={latitude} />
      <input type="hidden" value={longitude} />
    </form>
  );
}
```

### Option B: Bulk Update in Database

```bash
mongo LOCAL_WORKER

# Add test coordinates to all workers
db.workers.updateMany(
  { latitude: { $in: [null, undefined] } },
  {
    $set: {
      latitude: 28.7041 + (Math.random() * 0.1),
      longitude: 77.1025 + (Math.random() * 0.1),
    }
  }
)
```

### Option C: Manual Update in MongoDB

```bash
mongo LOCAL_WORKER

db.workers.updateOne(
  { name: "John Plumber" },
  {
    $set: {
      latitude: 28.7050,
      longitude: 77.1030,
    }
  }
)
```

---

## 🐛 View Console Logs

Press **F12** and look for:

```
✅ = Success (green in console)
❌ = Error/Problem (red in console)
🔍 = Searching/Loading (yellow)
📍 = Location info
📡 = API call
```

Examples:
```
✅ Location found: 28.7050, 77.1030      → User location detected
📍 Fetching workers near: {lat, lng}      → Calling API
✅ Workers fetched: [5 workers]           → Success!
❌ Error fetching workers: 401            → Need to login
❌ Geolocation error: Permission denied   → Allow permission
```

---

## ✅ Success Indicators

When everything works, you should see:

1. **Map Page Loads:**
   - Map visible with initial zoom level
   
2. **Location Status:** 
   - Green banner: "✅ Location detected: 28.7050, 77.1030"
   
3. **Map Shows:**
   - Blue marker at your center location
   - Green markers for nearby workers
   
4. **Click Worker Marker:**
   - Info window shows: Name, Skill, Phone, Distance, Rating
   - "📞 Call Now" button works
   
5. **Worker List Below:**
   - Shows all nearby workers with details
   
6. **Console Shows:**
   - No red errors
   - Green checkmarks and success messages

---

## Quick Test without Registration

If you don't want to register workers:

```bash
mongo LOCAL_WORKER

# Add 3 test workers
db.workers.insertMany([
  {
    name: "Raj Electrician",
    skill: "electrician",
    phone: "+919876543210",
    latitude: 28.7050,
    longitude: 77.1030,
    status: "available",
    averageRating: 4.5,
    totalReviews: 8,
    createdAt: new Date()
  },
  {
    name: "Prabhat Plumber",
    skill: "plumber", 
    phone: "+919876543211",
    latitude: 28.7060,
    longitude: 77.1040,
    status: "available",
    averageRating: 4.2,
    totalReviews: 5,
    createdAt: new Date()
  },
  {
    name: "Vikram Carpenter",
    skill: "carpenter",
    phone: "+919876543212",
    latitude: 28.7070,
    longitude: 77.1010,
    status: "busy",
    averageRating: 4.8,
    totalReviews: 12,
    createdAt: new Date()
  }
])

# Verify
db.workers.find().count()  # Should show 3
```

Now test the map and you'll see all 3 workers.

---

## Need More Help?

1. **Check Console** (F12) for specific errors
2. **Read logs** in LOCATION_TROUBLESHOOTING.md
3. **Use MapDebugPanel** to test each component
4. **Check backend logs** for API errors
5. **Verify .env.local** has API key

---

**Happy mapping!** 🗺️
