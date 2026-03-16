# Quick Start Guide - Hyperlocal Worker Finder v1.0

Get the application running in 5 minutes!

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or use MongoDB Atlas)
- npm or yarn

## Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend directory
cd backend

# Install dependencies (should be already installed)
npm install

# Start the server
npm start
```

**Expected Output:**
```
MongoDB connected successfully
Server is running on port 5000
```

✅ **Backend is now running on** `http://localhost:5000`

## Step 2: Frontend Setup (2 minutes)

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies (should be already installed)
npm install

# Start the development server
npm run dev
```

**Expected Output:**
```
VITE v8.0.0  ready in xxx ms

➜  Local:   http://localhost:5173/
```

✅ **Frontend is now running on** `http://localhost:5173`

## Step 3: Test the Application (1 minute)

### Walk Through the Demo

1. **Open your browser** and go to `http://localhost:5173`

2. **Home Page**: Browse all workers without logging in

3. **Register as Customer**:
   - Click "Register"
   - Fill in the form (name, email, password)
   - Select role: **Customer**
   - Click "Register"
   - You'll be redirected to Customer Dashboard

4. **Customer Dashboard**:
   - View emergency service buttons (⚡ Need Electrician NOW, etc.)
   - Browse workers by skill category
   - Click on a worker card to see details
   - View worker reviews and ratings

5. **Register as Worker**:
   - Click "Login" if already registered, or "Register" to create new account
   - Select role: **Worker**
   - Complete registration
   - You'll be redirected to Worker Dashboard

6. **Worker Dashboard**:
   - View your profile details
   - Update your availability status (🟢 Available / 🔴 Busy)
   - See reviews from customers
   - View your rating

## Key Routes

### Customer Routes
- `http://localhost:5173/` - Home page
- `http://localhost:5173/register` - Register/Login
- `http://localhost:5173/login` - Login page
- `http://localhost:5173/customer-dashboard` - Main dashboard

### Worker Routes
- `http://localhost:5173/worker-dashboard` - Worker dashboard

## API Testing with cURL

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

### Get All Workers
```bash
curl http://localhost:5000/api/workers
```

### Filter by Skill
```bash
curl http://localhost:5000/api/workers/skill/electrician
```

## Features Overview

### 🔐 Authentication
- Register as Customer or Worker
- Secure JWT-based authentication
- Login persistence

### 👷 Worker Features
- Complete profile setup
- Update availability status
- Receive customer reviews
- Track average rating
- Worker verification badge

### 🔍 Customer Features
- Browse all workers
- Filter by skill (Electrician, Plumber, Carpenter)
- View worker details and reviews
- Emergency service buttons for quick access
- Contact via phone or WhatsApp

### ⭐ Reviews & Ratings
- Leave reviews for workers
- Rate services 1-5 stars
- View average ratings
- See review history

### 📍 Location-Based Search
- Find nearby workers using coordinates
- Haversine formula for accurate distance
- Filter by skill and radius

## Configuration

### Backend Environment Variables

Create or update `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/hyperlocal-workers
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

### MongoDB Setup

**Option 1: Local MongoDB**
- Install MongoDB Community Edition
- Start MongoDB service
- Default connection: `mongodb://localhost:27017/hyperlocal-workers`

**Option 2: MongoDB Atlas (Cloud)**
- Create account at mongodb.com
- Create a cluster
- Update MONGODB_URI with connection string
- Format: `mongodb+srv://username:password@cluster.mongodb.net/hyperlocal-workers`

## Troubleshooting

### "MongoDB connection error"
- Ensure MongoDB is running locally
- Or update .env with MongoDB Atlas connection string
- Default: `mongodb://localhost:27017/hyperlocal-workers`

### "Port 5000 already in use"
- Change PORT in backend `.env`
- Or kill the process using that port

### "Frontend not connecting to API"
- Ensure backend is running first
- Check that API URL in frontend is correct: `http://localhost:5000/api`
- Clear browser cache and reload

### Dependencies not installing
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

## Sample Test Data

### Test Customer Account
```
Email: customer@example.com
Password: password123
Role: Customer
```

### Test Worker Account
```
Email: worker@example.com
Password: password123
Role: Worker
Skill: Electrician
Experience: 5 years
Location: Mumbai
Phone: 9876543210
```

## Technology Stack

- **Frontend**: React (Vite), React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Styling**: CSS3

## File Structure Quick Reference

```
LOCAL_WORKER/
├── backend/
│   ├── models/          (User, Worker, Review schemas)
│   ├── routes/          (Auth, Worker, Review, Admin APIs)
│   ├── middleware/      (JWT authentication)
│   ├── server.js        (Express server)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  (StatusBadge, RatingStars, EmergencyButton)
│   │   ├── pages/       (Login, Register, Dashboards)
│   │   ├── context/     (AuthContext for auth state)
│   │   ├── App.jsx      (Main app with routing)
│   │   └── main.jsx     (Entry point)
│   └── package.json
├── docs/
│   ├── IMPLEMENTATION.md (Full feature documentation)
│   └── COMMANDS.md       (Command reference)
└── QUICKSTART.md         (This file)
```

## Next Steps

1. **Customize**: Modify colors, fonts, and styling in CSS files
2. **Add Features**: Implement job booking, chat, payments
3. **Deploy**: Push to production using Vercel, Heroku, or AWS
4. **Database**: Switch to MongoDB Atlas for cloud hosting
5. **Email**: Add email notifications and verification

## Need Help?

- Check docs/IMPLEMENTATION.md for full API documentation
- Review code comments for explanations
- Check browser console for error messages
- Check terminal output for backend errors

---

🎉 **You're all set!** Enjoy using Hyperlocal Worker Finder!

For detailed information about all features, refer to [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md)
