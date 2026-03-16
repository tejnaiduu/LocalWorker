# 🏢 Hyperlocal Worker Finder v1.0

A full-stack MERN application that helps customers find and connect with skilled workers like plumbers, electricians, and carpenters in their area. Workers can manage their profiles, update availability, and receive reviews from customers.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)

## ✨ Features

### 🔐 Authentication & Authorization
- ✅ User registration (Customer or Worker)
- ✅ Secure JWT-based login
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control

### 👥 Customer Features
- ✅ Browse all registered workers
- ✅ Filter workers by skill (Electrician, Plumber, Carpenter)
- ✅ View detailed worker profiles with ratings
- ✅ Emergency service buttons for quick access
- ✅ Leave reviews and rate workers (1-5 stars)
- ✅ Contact workers via phone or WhatsApp

### 👷 Worker Features  
- ✅ Complete worker profile setup
- ✅ Update availability status (🟢 Available / 🔴 Busy)
- ✅ View all received customer reviews
- ✅ Track average rating and reviews count
- ✅ Worker verification badge (✅ Verified)
- ✅ Profile visibility to customers

### ⭐ Review & Rating System
- ✅ Leave detailed reviews with ratings
- ✅ Average rating calculation
- ✅ Review history tracking
- ✅ Customer feedback on worker profiles

### 📍 Location-Based Search
- ✅ Store worker coordinates (latitude/longitude)
- ✅ Find nearby workers using Haversine formula
- ✅ Filter by skill and distance radius
- ✅ Sorted results by proximity

### 🏅 Worker Verification
- ✅ ID proof upload capability
- ✅ Admin worker verification
- ✅ Verified badge display
- ✅ Searchable verified workers list

## 🛠️ Tech Stack

**Frontend:**
- React 19 with Vite
- React Router v6 (routing)
- Axios (HTTP client)
- CSS3 (responsive design)
- Context API (state management)

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT (authentication)
- bcryptjs (password hashing)
- CORS enabled

**Database:**
- MongoDB (Local or MongoDB Atlas cloud)

## 📁 Project Structure

```
LOCAL_WORKER/
├── backend/
│   ├── models/
│   │   ├── User.js              # User schema (auth)
│   │   ├── Worker.js            # Worker schema
│   │   └── Review.js            # Review schema
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication endpoints
│   │   ├── workerRoutes.js      # Worker management
│   │   ├── reviewRoutes.js      # Review endpoints
│   │   └── adminRoutes.js       # Admin endpoints
│   ├── middleware/
│   │   └── auth.js              # JWT verification
│   ├── server.js                # Express server
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx             # Login page
    │   │   ├── Register.jsx          # Registration page
    │   │   ├── CustomerDashboard.jsx # Customer main dashboard
    │   │   ├── WorkerDashboard.jsx   # Worker main dashboard
    │   │   ├── Auth.css              # Auth pages styling
    │   │   └── Dashboard.css         # Dashboard styling
    │   ├── components/
    │   │   ├── WorkerCard.jsx        # Worker card component
    │   │   ├── WorkerCard.css
    │   │   ├── WorkerList.jsx        # Workers list with filters
    │   │   ├── WorkerList.css
    │   │   ├── WorkerDetails.jsx     # Worker details modal
    │   │   ├── WorkerDetails.css
    │   │   ├── StatusBadge.jsx       # Status indicator
    │   │   ├── RatingStars.jsx       # Star rating display
    │   │   ├── EmergencyButton.jsx   # Emergency action button
    │   │   └── UIComponents.css      # UI component styles
    │   ├── context/
    │   │   └── AuthContext.jsx       # Authentication context
    │   ├── App.jsx                   # Main app with routing
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── index.html
    
├── docs/
│   ├── README.md          # Documentation index
│   ├── IMPLEMENTATION.md  # Full feature documentation
│   ├── COMMANDS.md        # Useful command reference
│   └── ...                # Location and map feature guides
├── QUICKSTART.md          # Quick start guide
└── README.md              # This file
```

## 📦 Prerequisites

- **Node.js** v18+ -[Download](https://nodejs.org/)
- **MongoDB** - [Local](https://www.mongodb.com/try/download/community) or [Atlas Cloud](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn**

## 🚀 Installation

### Step 1: Navigate to Project
```bash
cd LOCAL_WORKER
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies  
```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Setup

Create `backend/.env` file:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/hyperlocal-workers

# Server Config
PORT=5000
NODE_ENV=development

# JWT Secret (change in production!)
JWT_SECRET=your-secret-key-change-this
```

### MongoDB Setup

**Option 1: Local MongoDB**
- Download and install from [mongodb.com](https://www.mongodb.com/try/download/community)
- Start MongoDB: `mongod`

**Option 2: MongoDB Atlas (Cloud)**
- Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create cluster and get connection string
- Update MONGODB_URI in .env

## 🏃 Quick Start

### Terminal 1: Start Backend
```bash
cd backend
npm start
```
Server runs on: `http://localhost:5000`

### Terminal 2: Start Frontend  
```bash
cd frontend
npm run dev
```
App runs on: `http://localhost:5173`

**Visit**: `http://localhost:5173/`

## 📖 Usage Guide

### For Customers

1. **Register**: Click "Register" → Select role "Customer" → Fill form
2. **Login**: Enter credentials
3. **Browse Workers**: See all workers on dashboard
4. **Filter**: Click  skill buttons to filter (⚡ Electrician, 🚰 Plumber, 🪵 Carpenter)
5. **View Details**: Click worker card to see full profile, reviews, ratings
6. **Contact**: Use "📞 Call" or "💬 WhatsApp" buttons
7. **Emergency**: Use emergency buttons for quick service access
8. **Review**: Add reviews with ratings (1-5 stars)

### For Workers

1. **Register**: Click "Register" → Select role "Worker" → Complete profile
2. **Dashboard**: View your profile and reviews
3. **Update Status**: Toggle between 🟢 Available and 🔴 Busy
4. **View Reviews**: See all customer feedback and ratings
5. **Manage Profile**: Update skills, experience, location, contact info

## 📡 API Documentation

[Full API documentation available in docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md#api-documentation)

### Key Endpoints

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

Workers:
GET    /api/workers
GET    /api/workers/skill/:skill
GET    /api/workers/nearby?lat=X&lng=Y&radius=5
POST   /api/workers/register
PUT    /api/workers/status/:id

Reviews:
POST   /api/reviews/add
GET    /api/reviews/:workerId

Admin:
PUT    /api/admin/verify-worker/:workerId
GET    /api/admin/unverified-workers
```

## 🧪 Test Account

```
Customer:
Email: customer@example.com
Password: password123
Role: Customer

Worker:
Email: worker@example.com  
Password: password123
Role: Worker
Skill: Electrician
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Ensure MongoDB is running, check MONGODB_URI |
| Port 5000 in use | Change PORT in .env or kill process |
| Frontend can't reach API | Verify backend is running on port 5000 |
| Authentication failed | Verify JWT_SECRET matches in .env |
| CORS errors | Check backend CORS configuration |

## 📚 Documentation

- **[docs/README.md](docs/README.md)** - Documentation index
- **[docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md)** - Complete feature documentation
- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup guide
- **[docs/COMMANDS.md](docs/COMMANDS.md)** - Useful commands

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Heroku/Railway)
```bash
# Update MONGODB_URI to Atlas
# Update JWT_SECRET for production
# Push to Git and deploy
```

## 📅 Future Enhancements

- [ ] Real-time chat between customers and workers
- [ ] Job booking and scheduling system
- [ ] Payment integration (Stripe/Razorpay)
- [ ] Advanced filtering (rating, price range, etc.)
- [ ] Mobile app (React Native)
- [ ] Two-factor authentication
- [ ] Email notifications
- [ ] Worker portfolio/gallery

## 📄 License

MIT License - Feel free to use this project 

## 👨‍💻 Support

For issues or questions:
1. Check [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md)
2. Review code comments
3. Check browser console for errors
4. Verify backend is running

---

**Built with ❤️ - Hyperlocal Worker Finder v1.0**

Happy coding! 🚀

#### 1. Register a Worker
```
POST /api/workers/register
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "skill": "plumber",
  "experience": 5,
  "location": "San Francisco, CA"
}

Response (201): {
  "message": "Worker registered successfully",
  "worker": {
    "_id": "...",
    "name": "John Doe",
    "phone": "+1234567890",
    "skill": "plumber",
    "experience": 5,
    "location": "San Francisco, CA",
    "createdAt": "2026-03-14T...",
    "updatedAt": "2026-03-14T..."
  }
}
```

#### 2. Get All Workers
```
GET /api/workers

Response (200): [
  {
    "_id": "...",
    "name": "John Doe",
    "phone": "+1234567890",
    "skill": "plumber",
    "experience": 5,
    "location": "San Francisco, CA"
  },
  ...
]
```

#### 3. Get Workers by Skill
```
GET /api/workers/skill/plumber

Valid skills: plumber, electrician, carpenter

Response (200): [
  {
    "_id": "...",
    "name": "John Doe",
    "phone": "+1234567890",
    "skill": "plumber",
    "experience": 5,
    "location": "San Francisco, CA"
  },
  ...
]
```

#### 4. Get Single Worker
```
GET /api/workers/:id

Response (200): {
  "_id": "...",
  "name": "John Doe",
  "phone": "+1234567890",
  "skill": "plumber",
  "experience": 5,
  "location": "San Francisco, CA"
}
```

#### 5. Health Check
```
GET /api/health

Response (200): {
  "message": "Server is running"
}
```

## 📱 Usage Guide

### For Customers

1. **View Workers**
   - Click "👥 Find Workers" tab on home page
   - See all registered workers in card format
   - Each card shows: Name, Skill, Experience, Location, Phone

2. **Filter by Skill**
   - Click filter buttons: Plumber, Electrician, or Carpenter
   - Only workers with selected skill will be shown
   - Click "All Workers" to reset filter

3. **Contact a Worker**
   - **Call**: Click the "📞 Call" button to initiate a phone call
   - **WhatsApp**: Click the "💬 WhatsApp" button to message on WhatsApp

### For Workers

1. **Register**
   - Click "📝 Register as Worker" tab
   - Fill in your details:
     - Name: Your full name
     - Phone: Your phone number (with country code recommended)
     - Skill: Select from Plumber, Electrician, or Carpenter
     - Experience: Years of experience (0 or higher)
     - Location: Your city/area
   - Click "Register" button
   - Success message confirms registration

2. **Update Profile**
   - Re-register with same phone number to update profile
   - All fields can be changed

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clean Interface**: Simple, intuitive layout
- **Card-based Layout**: Workers displayed as interactive cards
- **Smooth Animations**: Fade-in effects and hover animations
- **Color-coded Skills**: Emoji icons for different worker types
  - 🔧 Plumber
  - ⚡ Electrician
  - 🪵 Carpenter

## 🔧 Troubleshooting

### Issue: MongoDB Connection Error

**Solution 1**: Start MongoDB service
- Windows: Open Command Prompt and run `mongod`
- Mac: `brew services start mongodb-community`

**Solution 2**: Check MongoDB URI in `.env`
- Verify the connection string is correct
- For local: `mongodb://localhost:27017/hyperlocal-workers`
- For Atlas: Check username, password, cluster name

### Issue: CORS Error

Ensure backend is running and CORS is enabled in `server.js`. It's already configured to accept requests from localhost:5173.

### Issue: Frontend can't reach backend

1. Verify backend is running on port 5000
2. Check API_BASE_URL in component files: `http://localhost:5000`
3. Ensure there are no firewall restrictions

### Issue: Port 5000 or 5173 already in use

**For Backend**:
```bash
# Change PORT in backend/.env
PORT=5001
```

**For Frontend**:
```bash
# Specify port in npm command
npm run dev -- --port 5174
```

### Issue: Modules not found

Run `npm install` in both backend and frontend directories.

## 📝 Adding More Features

### Future Enhancements
- User authentication and login
- Worker ratings and reviews
- Location-based search (using geolocation)
- Real-time chat messaging
- Payment integration
- Admin dashboard
- Worker profile images
- Service booking and scheduling

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Support

For issues or questions, please check:
1. MongoDB connection status
2. Environment variables in `.env`
3. Browser console for frontend errors
4. Terminal output for backend errors

---

**Happy coding! 🚀**
