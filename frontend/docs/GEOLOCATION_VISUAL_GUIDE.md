# Geolocation System - Visual Flow Guide

## 🎯 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

User Opens Registration Page
         ↓
    ┌─────────────────────┐
    │ Browser Geolocation │
    │ Permission Request  │
    └─────────────────────┘
         ↓
    ┌────┴────┐
    │          │
   YES       NO
    │          │
    ↓          ↓
┌────────┐  ┌──────────┐
│✅ Allowed  │⚠️ Denied  │
└────────┘  └──────────┘
    │          │
    ↓          ↓
Coordinates  Form Still
Captured     Works (null coords)
    │          │
    └─────┬────┘
         │
         ↓
   ┌────────────────────┐
   │  User Fills Form   │
   │  (coords auto-set) │
   └────────────────────┘
         │
         ↓
   ┌────────────────────┐
   │ User Clicks Submit │
   └────────────────────┘
         │
         ↓
   ┌────────────────────────────┐
   │ POST /api/auth/register    │
   │ {name, email, ..., lat,lng}│
   └────────────────────────────┘
         │
         ↓ Backend Processing
    ┌─────────────────────┐
    │ Create User Record  │
    └─────────────────────┘
    ├─ name
    ├─ email
    ├─ password
    ├─ role
    └─ phone, location (customers)
         │
         ├─ If Worker:
         │  ├─ Create Worker Profile
         │  ├─ Add latitude
         │  ├─ Add longitude
         │  └─ Status: "busy"
         │
         └─ If Customer:
            ├─ Avatar: profile photo
            ├─ Phone: optional
            └─ Location: optional text
         │
         ↓
   ┌────────────────────┐
   │  User Logged In    │
   │  Redirected        │
   └────────────────────┘
         │
         ├─ Worker → /worker-dashboard
         └─ Customer → /customer-dashboard
```

---

## 🗺️ Map Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  MAP VIEW FLOW                                  │
└─────────────────────────────────────────────────────────────────┘

Customer Clicks "Find Workers" / "Map"
         │
         ↓
   ┌────────────────────────┐
   │ NearbyWorkersMap.jsx   │
   │ Component Loads        │
   └────────────────────────┘
         │
         ↓
   ┌────────────────────────┐
   │ Browser Geolocation    │
   │ Get Customer Location  │
   └────────────────────────┘
         │
    ┌────┴────┐
    │          │
  Success    Error
    │          │
    ↓          ↓
  ┌──────┐   ┌──────────────┐
  │ lat │   │ Use Default  │
  │ lng │   │ Location     │
  └──────┘   │ (Delhi)      │
    │        └──────────────┘
    │              │
    └──────┬───────┘
          ↓
   ┌──────────────────────────┐
   │ Status Banner Shows:     │
   │ ✅ "Location: 28.70..."  │
   │ or ⚠️ "Using default..." │
   └──────────────────────────┘
          │
          ↓
   ┌──────────────────────────────────┐
   │ API Call to Backend:             │
   │ GET /workers/nearby             │
   │ ?lat=28.7050                     │
   │ &lng=77.1030                     │
   │ &radius=5                        │
   │ &skill=electrician (optional)    │
   └──────────────────────────────────┘
          │
          ↓ Backend Processing
   ┌─────────────────────────┐
   │ Find All Workers Near   │
   │ Usage Haversine Formula │
   │ Calculate Distances     │
   │ Filter by Radius        │
   │ Sort by Distance        │
   └─────────────────────────┘
          │
          ↓
   ┌──────────────────────┐
   │ Return Workers List: │
   │ [{                   │
   │   name: "John",      │
   │   skill: "electric", │
   │   lat: 28.7050,      │
   │   lng: 77.1030,      │
   │   distance: 1.2km    │
   │ }, ...]              │
   └──────────────────────┘
          │
          ↓
   ┌──────────────────────────┐
   │ Render Map with:         │
   │                          │
   │ 🔵 Blue = Customer       │
   │ 🟢 Green = Each Worker   │
   │                          │
   │ Info windows on click    │
   │ Show details             │
   │ Call button works        │
   └──────────────────────────┘
          │
          ↓
   Customer sees nearby workers!
```

---

## 💾 Database Schema Updates

### Workers Collection:
```javascript
db.workers.find()
// Returns:
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),      // Link to User
  
  // --- Auto-captured during registration ---
  latitude: 28.7050,            // From browser geolocation
  longitude: 77.1030,           // From browser geolocation
  
  // --- From registration form ---
  skill: "electrician",
  status: "available",
  phone: "+91999...",
  
  // --- Auto-calculated ---
  averageRating: 4.5,
  totalReviews: 8,
  
  createdAt: ISODate("2026-03-14..."),
  updatedAt: ISODate("2026-03-14..."),
}
```

### Users Collection:
```javascript
db.users.find()
// Returns:
{
  _id: ObjectId("..."),
  
  // --- From registration ---
  name: "John Doe",
  email: "john@example.com",
  password: "hashed...",
  role: "customer"  // or "worker"
  
  // --- Customer-only fields ---
  phone: "+9199...",
  location: "Kolkata",
  profilePhoto: "https://...",
  
  // --- Auto-captured (if provided) ---
  latitude: 28.7050,            // Optional: from registration
  longitude: 77.1030,           // Optional: from registration
  
  createdAt: ISODate("2026-03-14..."),
  updatedAt: ISODate("2026-03-14..."),
}
```

---

## 🔄 Request/Response Examples

### 1️⃣ Registration with Location

**Request (Frontend → Backend):**
```javascript
POST /api/auth/register
{
  name: "John Worker",
  email: "john@example.com",
  password: "securepass123",
  role: "worker",
  latitude: 28.7050,              // ← Auto-captured
  longitude: 77.1030              // ← Auto-captured
}
```

**Response (Backend → Frontend):**
```javascript
200 OK
{
  message: "User registered successfully",
  token: "eyJhbGciOi...",
  user: {
    id: "507...",
    name: "John Worker",
    email: "john@example.com",
    role: "worker"
  }
}
```

**Database Update:**
```javascript
db.workers.insertOne({
  userId: ObjectId("507..."),
  latitude: 28.7050,              // ← Stored
  longitude: 77.1030,             // ← Stored
  skill: null,
  status: "busy",
  createdAt: new Date()
})
```

---

### 2️⃣ Find Nearby Workers

**Request (Frontend → Backend):**
```javascript
GET /api/workers/nearby?lat=28.7050&lng=77.1030&radius=5&skill=electrician

// What it means:
// "Find electricians within 5km of (28.7050, 77.1030)"
```

**Response (Backend → Frontend):**
```javascript
200 OK
{
  searchLocation: {
    lat: 28.7050,
    lng: 77.1030
  },
  radius: 5,
  count: 3,
  workers: [
    {
      _id: "507...",
      name: "John Electrician",
      skill: "electrician",
      phone: "+91999...",
      latitude: 28.7055,
      longitude: 77.1035,
      distance: 0.8,              // ← Calculated distance in km
      averageRating: 4.5,
      totalReviews: 12
    },
    {
      _id: "508...",
      name: "Raj Electrician",
      skill: "electrician",
      phone: "+91888...",
      latitude: 28.7070,
      longitude: 77.1010,
      distance: 1.2,              // ← Calculated distance in km
      averageRating: 4.2,
      totalReviews: 8
    },
    // ... more workers ...
  ]
}
```

---

## 📊 Geolocation Data Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    DATA JOURNEY                                │
└────────────────────────────────────────────────────────────────┘

Browser Geolocation API
         │
         ├─ Request user permission
         ├─ Get latitude & longitude
         ├─ Get accuracy estimate
         └─ Return coordinates

         ↓ (Auto-filled in form)

Registration Form
         │
         ├─ name, email, password
         ├─ role (customer/worker)
         └─ latitude, longitude ✨ (auto)

         ↓ (POST /auth/register)

Node.js Backend
         │
         ├─ Validate data
         ├─ Create User document
         ├─ If worker: Create Worker document
         │  └─ Store: latitude, longitude
         └─ Generate JWT token

         ↓ (User logs in)

MongoDB Database
         │
         ├─ users collection
         │  └─ Stores all user data
         │
         └─ workers collection
            ├─ Link to user
            ├─ Skills, status
            ├─ latitude, longitude ✨
            └─ Ratings, reviews

         ↓ (Customer opens map)

NearbyWorkersMap.jsx
         │
         ├─ Get customer's location
         └─ API call with coordinates

         ↓ (Backend searches)

Haversine Algorithm
         │
         ├─ Calculate distance for each worker
         ├─ Filter by search radius
         ├─ Sort by distance
         └─ Return results

         ↓ (Display results)

Google Maps
         │
         ├─ Show customer location (blue)
         ├─ Show worker locations (green)
         ├─ Draw lines/distances
         └─ Show info windows on click

         ↓

Customer sees nearby workers! 🎉
```

---

## 🎨 UI State Transitions

### Registration Form Location Status:

```
INITIAL STATE
┌─────────────────────────────┐
│ (No banner, waiting...)     │
└─────────────────────────────┘
         ↓ (useEffect runs)
┌─────────────────────────────┐
│ 🔍 Detecting location...    │ (Yellow, animated)
│ (Spinner spinning)          │
└─────────────────────────────┘
         ↓
    ┌────┴────┐
    │          │
  Success   Error
    │          │
    ↓          ↓
┌─────────┐  ┌──────────────┐
│✅ Location│ │⚠️ Not Available│
│28.70,    │ │Permission     │
│77.10     │ │maybe denied   │
└─────────┘  └──────────────┘
(Green)      (Red)
```

### Map Component Location Status:

```
INITIAL
┌────────────────────────┐
│ 🔍 Searching location… │ (Yellow)
│ (Map loading)          │
└────────────────────────┘
         ↓
┌────────────────────────┐
│ ✅ Location found      │  (Green)
│ (Blue marker appears)  │
│ (API call in progress) │
└────────────────────────┘
         ↓
┌────────────────────────┐
│ 🟢 Workers loaded!     │ (Ready)
│ (Green markers appear) │
│ (List below map)       │
└────────────────────────┘
         ↓
Customer can interact! ✨
```

---

## 🔍 Distance Calculation

```
Haversine Formula (Used on Backend):

Given:
  - Customer: lat1 = 28.7050, lng1 = 77.1030
  - Worker:   lat2 = 28.7055, lng2 = 77.1035

Calculation:
  1. R = 6371 km (Earth's radius)
  2. dLat = (lat2 - lat1) * π/180
  3. dLng = (lng2 - lng1) * π/180
  4. a = sin²(dLat/2) + cos(lat1*π/180) * cos(lat2*π/180) * sin²(dLng/2)
  5. c = 2 * atan2(√a, √(1-a))
  6. distance = R * c

Result: ~0.8 km (or 800 meters)

Accuracy:
  - ±0.1 km for distances < 5 km
  - Great for local worker discovery
```

---

## ✅ Complete Feature Checklist

```
REGISTRATION
  [✅] Location auto-detected on form load
  [✅] Status banner shows detection progress
  [✅] Graceful error handling if permission denied
  [✅] Coordinates sent with registration
  [✅] Worker created with coordinates
  [✅] Database stores latitude/longitude

MAPPING
  [✅] Customer location auto-detected on map load
  [✅] API fetches nearby workers within radius
  [✅] Blue marker shows customer location
  [✅] Green markers show worker locations
  [✅] Info windows show worker details
  [✅] Distance calculated and displayed
  [✅] Worker list below map with details
  [✅] Call button initiates phone call

BACKEND
  [✅] /auth/register accepts latitude, longitude
  [✅] Worker model has latitude, longitude fields
  [✅] /workers/nearby endpoint filters by distance
  [✅] Haversine distance formula implemented
  [✅] Results sorted by closest distance first

MOBILE
  [✅] Works on smartphone browsers
  [✅] Responsive map design
  [✅] Touch-friendly markers and buttons
  [✅] Works with device GPS
```

---

**Geolocation System: Fully Operational ✨**
