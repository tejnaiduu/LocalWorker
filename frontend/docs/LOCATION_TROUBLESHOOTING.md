# Location Fetching Troubleshooting Guide

## Why Location Might Not Fetch

### 1. **Browser Permission Denied** ⛔ (Most Common)

**Signs:**
- Yellow banner saying "Searching for your location..."
- But it never shows the location

**Fix:**
- **Chrome/Edge**: Click the location icon in the address bar → Change permission → Allow
- **Firefox**: Check Preferences → Privacy → Permissions → Location
- **Safari**: System Preferences → Security & Privacy → Location Services → Enable
- **Mobile**: Settings → App Permissions → Maps/Browser → Location Access

After changing permission:
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Refresh the page** (F5)
3. Location should appear

---

### 2. **HTTPS Required (Production Only)**

**When it happens:**
- Works on `localhost` ✅
- Doesn't work on `https://example.com` ❌

**Why:**
- Browsers require HTTPS for geolocation in production
- Localhost is exempt from this requirement

**Fix:**
- Ensure your production site uses HTTPS
- Install SSL certificate on your domain

---

### 3. **API Key Not Configured**

**Signs:**
- Map shows error: "Google Maps API key is not configured"

**Fix:**
```bash
# Check your .env.local file exists
ls frontend/.env.local

# Should contain:
VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
```

If missing:
```bash
echo "VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY" > frontend/.env.local
```

Then restart dev server:
```bash
cd frontend
npm run dev
```

---

### 4. **Workers Have No Location Data** 📍

**Signs:**
- Location found ✅
- "No workers found in your area. Try increasing the search radius."

**Why:**
- Workers in database don't have `latitude` and `longitude` values

**Check:**
```bash
# Backend: Check if workers have coordinates
```

**Fix - Add Location to Workers:**

**Option A: Manual Location Setup**
1. Open Worker Registration form
2. Add latitude/longitude inputs
3. Test with a worker account

**Option B: Auto-Geolocation During Registration**
Use this code in your Worker Registration form:

```jsx
useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      setFormData(prev => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));
    });
  }
}, []);
```

**Option C: Bulk Update Workers (MongoDB)**
```javascript
// Run in MongoDB shell or use a script
db.workers.updateMany(
  {},
  [
    {
      $set: {
        latitude: { $cond: [{ $eq: ["$latitude", null] }, 28.7041, "$latitude"] },
        longitude: { $cond: [{ $eq: ["$longitude", null] }, 77.1025, "$longitude"] },
      }
    }
  ]
);
```

---

### 5. **Backend Not Running** ❌

**Signs:**
- Console error: `Network error` or `Failed to fetch`

**Check:**
```bash
# Is backend on port 5000?
curl http://localhost:5000/api/health
```

**Fix:**
```bash
# Start backend
cd backend
npm start
```

---

### 6. **Network Error - Wrong API Endpoint**

**Signs:**
- Error: `GET /workers/nearby 404 Not Found`

**Check:**
- Verify backend has `/workers/nearby` route
- Check file: `backend/routes/workerRoutes.js`

Should have:
```javascript
router.get('/nearby', async (req, res) => {
  // ... implementation
});
```

---

### 7. **Browser Compatibility**

**Geolocation Support:**
- ✅ Chrome: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Edge: Full support
- ❌ Internet Explorer: No support

**Fix for older browsers:**
- Install polyfill or ask users to upgrade

---

## Debugging Steps (In Order)

### Step 1: Open Browser Console
Press `F12` → Go to **Console** tab

### Step 2: Check for Errors
Look for red error messages. Common ones:

```
❌ Location access: User denied geolocation
Fix: Allow location permission in browser

❌ Error fetching workers: 404 Not Found
Fix: Ensure /api/workers/nearby endpoint exists

❌ Error fetching workers: 401 Unauthorized
Fix: Ensure you're logged in (JWT token)

❌ Geolocation not supported by browser
Fix: Use modern browser or add polyfill
```

### Step 3: Check Location Status Banner
- 🔍 Yellow banner = Still searching (might need permission)
- ✅ Green banner = Location found
- Red error = Permission denied

### Step 4: Check Network Tab
Press `F12` → **Network** tab → Look for API calls:

1. `workers/nearby?lat=...&lng=...`
   - Should show `200 OK` ✅
   - If `404` or `5xx` → Backend issue
   - If `401` → Not authenticated

2. Google Maps API call
   - Should succeed
   - If blocked → API key issue

### Step 5: Test Location Manually
In browser console, type:
```javascript
navigator.geolocation.getCurrentPosition(
  pos => console.log('✅ Location:', pos.coords),
  err => console.log('❌ Error:', err)
);
```

---

## Quick Checklist

Before testing:
- [ ] Browser location permission enabled
- [ ] `.env.local` has `VITE_GOOGLE_MAPS_API_KEY`
- [ ] Backend running on port 5000
- [ ] Fed server running (`npm run dev`)
- [ ] At least one worker has latitude/longitude
- [ ] Using localhost or HTTPS (not HTTP)

---

## Common Error Messages & Fixes

| Error Message | Cause | Fix |
|---|---|---|
| "Geolocation is not supported" | Old browser | Use modern browser |
| "User denied geolocation" | Permission denied | Allow in browser settings |
| "Timeout" | Taking too long | Check internet connection |
| "Position unavailable" | GPS not working | Try WiFi or move location |
| "Failed to fetch nearby workers" | Backend error | Check backend logs |
| "No workers found" | Workers have no coordinates | Add lat/lng to workers |
| "API key is not configured" | Missing .env | Add key to .env.local |

---

## Test with Sample Data

If no real workers exist, add test data to MongoDB:

```javascript
db.workers.insertOne({
  userId: ObjectId(),
  name: "Test Worker",
  skill: "electrician",
  phone: "+919999999999",
  latitude: 28.7050,
  longitude: 77.1030,
  status: "available",
  averageRating: 4.5,
  totalReviews: 10,
})
```

Then test the map with different lat/lng near 28.70, 77.10

---

## Enable Debug Logging

The component now logs detailed information to the console. Check for:

```
🔍 Attempting to get user location...
✅ Location found: 28.7050, 77.1030
📍 Fetching workers near: {lat, lng}
📡 API Request: /workers/nearby?lat=...
✅ Workers fetched: [...]
❌ Error fetching workers: {...}
```

These logs help diagnose the exact problem!

---

## Still Not Working?

1. **Take a screenshot** of the console errors
2. **Check monitorin** with these commands:

```bash
# Check backend logs
tail -f backend.log

# Check if port 5000 is in use
netstat -an | grep 5000

# Test API directly
curl "http://localhost:5000/api/workers/nearby?lat=28.7&lng=77.1"

# Check MongoDB connection
mongo
> db.workers.find().count()
```

3. **Share the console errors** for detailed help
