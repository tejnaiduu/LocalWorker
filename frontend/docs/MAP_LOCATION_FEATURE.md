# 🗺️ Map Location Selection Feature - Implementation Guide

## Overview
Added interactive map-based location selection for both **workers** and **customers** using Mapbox GL JS. Users can select their location by clicking on the map, dragging a marker, or using the "Current Location" button.

---

## Features Implemented

### 1. **Worker Location Selection** ✅
**Component**: `WorkerRegister.jsx`

**Functionality**:
- Traditional text input for location name
- **"📍 Fetch Location"** button - Quick GPS-based location auto-fill
- **"🗺️ Select on Map"** button - Opens interactive Mapbox map picker
- Map allows:
  - **Click anywhere** to place marker
  - **Drag marker** to adjust position
  - **Use Current Location** button (with geolocation API)
  - **Reverse geocoding** to get place name from coordinates

**Data Captured**:
- `location` - Place name (from reverse geocoding or user input)
- `latitude` - Decimal coordinates
- `longitude` - Decimal coordinates

**Storage**:
- Stored in `Worker` model
- Also synced to `User` model for reference

---

### 2. **Customer Location Selection** ✅
**Component**: `CustomerProfileForm.jsx`

**Functionality**:
- Traditional text input for location name
- **"📍 Fetch Location"** button - Quick GPS-based location auto-fill
- **"🗺️ Select on Map"** button - Opens interactive Mapbox map picker
- Same map features as worker

**Data Captured**:
- `location` - Place name
- `latitude` - Optional but stored
- `longitude` - Optional but stored

**Storage**:
- Stored in `User` model via `/auth/profile` endpoint
- Used for customer service location tracking

---

## Technical Implementation

### Frontend Components

#### **LocationMapPicker.jsx** (Existing - Enhanced)
- Already provides full map interface
- Handles Mapbox GL initialization
- Manages marker creation and positioning
- Implements reverse geocoding using Mapbox Geocoding API
- Returns: `{ location, latitude, longitude }`

#### **WorkerRegister.jsx** (Updated)
```jsx
// New imports
import LocationMapPicker from './LocationMapPicker';

// New state
const [showMapPicker, setShowMapPicker] = useState(false);

// New handler
const handleLocationSelect = (locationData) => {
  setFormData(prev => ({
    ...prev,
    location: locationData.location,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
  }));
  setShowMapPicker(false);
};

// New button in form
<button 
  onClick={() => setShowMapPicker(true)}
  className="map-picker-btn"
>
  🗺️ Select on Map
</button>
```

#### **CustomerProfileForm.jsx** (Updated)
- Similar implementation to WorkerRegister
- Adds latitude/longitude to form state
- Updates backend via `/auth/profile` endpoint with coordinates

---

### Backend Support

#### **User Model** (Already Supports)
```javascript
latitude: {
  type: Number,
  default: null,
}
longitude: {
  type: Number,
  default: null,
}
```

#### **Worker Model** (Already Supports)
```javascript
latitude: {
  type: Number,
  default: null,
}
longitude: {
  type: Number,
  default: null,
}
```

#### **API Endpoints**

**Worker Registration/Update**:
- `POST /api/workers/register`
- `PUT /api/workers/:id`
- Both accept: `latitude`, `longitude`

**Customer Profile Update**:
- `PUT /api/auth/profile`
- Accepts: `latitude`, `longitude`

---

## UI/UX Features

### Location Input Wrapper
```css
.location-input-wrapper {
  display: flex;
  gap: 10px;
  align-items: stretch;
}
```
- Contains: text input + Fetch Location button + Select on Map button
- Responsive single row layout

### Map Picker Button Styling
```css
.map-picker-btn {
  background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.map-picker-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4);
}
```

---

## User Flow

### For Workers 👷
1. Fill basic info (name, phone, skill, experience)
2. For location, choose one of three methods:
   - **Type manually**: Enter location name directly
   - **Use GPS**: Click "📍 Fetch Location" button
   - **Use Map**: Click "🗺️ Select on Map" button
3. Map picker shows:
   - Interactive map centered on selected location
   - Draggable marker
   - Reverse geocoded place name
   - Buttons: "Use Current Location", "Save Location", "Cancel"
4. Map data automatically populates location + coordinates
5. Submit form with complete location data

### For Customers 👥
- Same workflow as workers
- Location stored in user profile
- Can be used later for finding nearby workers

---

## Benefits

✅ **Accurate Location Data**: Precise GPS coordinates (not just text)  
✅ **Better UX**: Interactive map beats manual text entry  
✅ **Flexible Input**: Users can type OR use map  
✅ **Works Offline**: Geolocation works without internet  
✅ **Reverse Geocoding**: Shows place name from coordinates  
✅ **Mobile Friendly**: Full touch support for phones  
✅ **Future Ready**: Coordinates enable:
  - Distance calculations
  - Nearby worker searches
  - Route optimization
  - Service area mapping

---

## Files Modified

| File | Changes |
|------|---------|
| `frontend/src/components/WorkerRegister.jsx` | Added LocationMapPicker, map button, handlers |
| `frontend/src/components/CustomerProfileForm.jsx` | Added LocationMapPicker, map button, handlers |
| `frontend/src/components/WorkerRegister.css` | Added `.map-picker-btn` styles |
| `frontend/src/components/CustomerProfileForm.css` | Added `.map-picker-btn` styles |

---

## Environment Requirements

**Mapbox API Key Required**:
- Set `VITE_MAPBOX_API_KEY` in `.env.local`
- Get free key from [mapbox.com](https://mapbox.com)

```env
VITE_MAPBOX_API_KEY=your_mapbox_api_key_here
```

---

## Testing Checklist

- [ ] Worker registration - Map picker opens
- [ ] Worker registration - Clicking map places marker
- [ ] Worker registration - Dragging marker updates location
- [ ] Worker registration - "Current Location" button works
- [ ] Worker registration - Reverse geocoding shows place name
- [ ] Worker registration - Location data saves to database
- [ ] Customer profile - Map picker works
- [ ] Customer profile - Location coordinates saved
- [ ] Mobile - Touch interactions work
- [ ] Edge case - No Mapbox key shows error message

---

## Example Data Flow

```
User clicks "🗺️ Select on Map"
        ↓
LocationMapPicker opens in overlay
        ↓
User clicks on map (or uses current location)
        ↓
Marker appears, reverse geocoding fetches place name
        ↓
User clicks "Save Location"
        ↓
onLocationSelect callback fires
        ↓
Form state updated: {location, latitude, longitude}
        ↓
User submits form
        ↓
API POST/PUT with all three fields
        ↓
Database stores worker/customer with coordinates
```

---

## Future Enhancements

- [ ] Distance matrix calculations
- [ ] Service radius mapping
- [ ] Worker availability zones
- [ ] Route optimization
- [ ] Real-time location tracking option
- [ ] Saved location favorites
