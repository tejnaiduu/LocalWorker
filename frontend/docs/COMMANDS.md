# 🚀 Command Reference Guide

Quick reference for all common commands needed to run the Hyperlocal Worker Finder project.

## 📦 Installation Commands

### Backend Setup
```bash
cd backend
npm install
```

**What gets installed:**
- express (web server)
- mongoose (database ODM)
- cors (cross-origin support)
- dotenv (environment config)

### Frontend Setup
```bash
cd frontend
npm install
```

**What gets installed:**
- react & react-dom
- axios (HTTP client)
- react-router-dom (routing)
- vite & plugins (build tool)

---

## ▶️ Running Commands

### Start Backend Server
```bash
cd backend
npm start
```

**Or with development mode:**
```bash
npm run dev
```

**Expected output:**
```
Server is running on port 5000
MongoDB connected successfully
```

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v8.0.0  ready in XXX ms

➜ Local:   http://localhost:5173/
```

---

## 🔗 Access Points

Once both servers are running:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend App | http://localhost:5173 | Main web application |
| Backend API | http://localhost:5000 | API endpoints |
| Health Check | http://localhost:5000/api/health | Verify backend is running |

---

## 🧪 API Testing Commands

### Test with curl or Postman

#### 1. Register a Worker
```bash
curl -X POST http://localhost:5000/api/workers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Plumber",
    "phone": "9876543210",
    "skill": "plumber",
    "experience": 5,
    "location": "New York"
  }'
```

#### 2. Get All Workers
```bash
curl http://localhost:5000/api/workers
```

#### 3. Filter by Skill
```bash
curl http://localhost:5000/api/workers/skill/plumber
```

#### 4. Get Single Worker (replace ID)
```bash
curl http://localhost:5000/api/workers/{WORKER_ID}
```

#### 5. Health Check
```bash
curl http://localhost:5000/api/health
```

---

## 📁 File Management Commands

### Navigate Directories
```bash
# Go to project root
cd hyperlocal-worker-finder

# Go to backend
cd backend

# Go to frontend
cd frontend

# Go back
cd ..
```

### View Files
```bash
# List files in current directory
ls                    # Mac/Linux
dir                   # Windows

# List all files including hidden
ls -la                # Mac/Linux

# Find MongoDB URI in config
cat backend/.env      # Mac/Linux
type backend\.env     # Windows
```

### Edit Configuration
```bash
# Edit backend environment variables
# Edit backend/.env and update MONGODB_URI

# Edit frontend API URL (optional)
# Edit src/components/WorkerRegister.jsx
# Change: const API_BASE_URL = 'http://localhost:5000'
```

---

## 🗄️ MongoDB Commands

### Check MongoDB Status

#### Start MongoDB (if not running)
```bash
# Windows - Command Prompt
mongod

# Mac - Terminal
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Stop MongoDB
```bash
# Mac
brew services stop mongodb-community

# Linux
sudo systemctl stop mongod
```

#### Connect to MongoDB CLI
```bash
mongosh
```

#### View MongoDB Data (in mongosh)
```javascript
use hyperlocal-workers
db.workers.find()
db.workers.find({"skill": "plumber"})
db.workers.deleteMany({})  // Clear all workers
exit
```

---

## 🔍 Troubleshooting Commands

### Check Port Availability

```bash
# Check if port 5000 is in use (Windows)
netstat -ano | findstr :5000

# Check if port 5173 is in use (Windows)
netstat -ano | findstr :5173

# Mac/Linux
lsof -i :5000
lsof -i :5173
```

### Kill Process on Port
```bash
# Windows - Command Prompt (Admin)
taskkill /PID {PID_NUMBER} /F

# Mac/Linux
kill -9 {PID_NUMBER}
```

### Clear Node Modules & Reinstall
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend (use same pattern)
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Check Node/npm Versions
```bash
node --version
npm --version
```

---

## 🛠️ Build & Deploy Commands

### Build Frontend for Production
```bash
cd frontend
npm run build
```

**Output:** Creates `dist/` folder ready for deployment

### Preview Production Build
```bash
cd frontend
npm run preview
```

### Lint Frontend Code
```bash
cd frontend
npm run lint
```

---

## 📝 File Edit Quick Tips

### Using nano (Mac/Linux)
```bash
nano backend/.env
# Make changes, then:
# Ctrl+O (save), Enter, Ctrl+X (exit)
```

### Using PowerShell (Windows)
```bash
notepad backend\.env
# Or use:
code backend\.env  # Opens in VS Code
```

---

## 🔗 Useful URLs to Remember

```
Frontend: http://localhost:5173
Backend API: http://localhost:5000
Register Workers: http://localhost:5173 → Click "📝 Register"
View Workers: http://localhost:5173 → Click "👥 Find Workers"
API Health: http://localhost:5000/api/health
```

---

## 📊 Project Paths Reference

```
Project Root: /LOCAL_WORKER/

Backend:
  - Server:     /LOCAL_WORKER/backend/server.js
  - Routes:     /LOCAL_WORKER/backend/routes/workerRoutes.js
  - Model:      /LOCAL_WORKER/backend/models/Worker.js
  - Config:     /LOCAL_WORKER/backend/.env

Frontend:
  - Main App:   /LOCAL_WORKER/frontend/src/App.jsx
  - Register:   /LOCAL_WORKER/frontend/src/components/WorkerRegister.jsx
  - List:       /LOCAL_WORKER/frontend/src/components/WorkerList.jsx
  - Card:       /LOCAL_WORKER/frontend/src/components/WorkerCard.jsx
```

---

## 💡 Pro Tips

1. **Keep terminals organized:** Use separate terminals for backend and frontend
2. **Watch logs:** Keep backend terminal visible to catch errors
3. **Browser DevTools:** Use F12 to debug frontend issues
4. **Postman:** Test API before using frontend
5. **MongoDB Compass:** Visualize database data
6. **VS Code Terminal:** Run both servers from within VS Code

---

## 🆘 Command Help

### Get Help on Any Command
```bash
npm help
node --help
curl --help
```

### Clear Terminal Screen
```bash
clear           # Mac/Linux
cls             # Windows
```

---

**Bookmark this page for quick reference! 🔖**

Last Updated: March 14, 2026
