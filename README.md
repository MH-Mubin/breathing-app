# 🧘‍♂️ Breathing App - Full-Stack MERN Application

A modern breathing and meditation application with advanced animations, user authentication, progress tracking, and gamification.

---

## ✨ Features

### Frontend Features
- **Advanced Curved-Path Animation** - Ball moves smoothly along SVG path
- **Dynamic Background Effects** - Parallax motion synchronized with breathing
- **Multiple Breathing Patterns** - 5 presets + custom patterns
- **Session Management** - 3, 5, 8, or 10-minute sessions
- **Sound Effects** - Phase transition tones with toggle
- **Progress Tracking** - Visual progress bar with countdown
- **Confetti Celebration** - Colorful animation on completion
- **User Dashboard** - Statistics, charts, and achievements
- **Responsive Design** - Works on all devices

### Backend Features
- **JWT Authentication** - Secure user registration and login
- **Session Tracking** - Complete session history
- **Streak System** - Daily streak counter with longest streak
- **Achievement System** - 13 unlockable achievements
- **Statistics API** - Total sessions, minutes, and streaks
- **RESTful API** - Clean, documented endpoints

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI framework
- **Vite 5.0** - Build tool
- **TailwindCSS 3.3** - Styling
- **Framer Motion 10.16** - Animations
- **Lucide React** - Icons
- **Canvas Confetti** - Celebration effects
- **React Hot Toast** - Notifications
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js 4.18** - Web framework
- **MongoDB 7.6** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin support

---

## 📁 Project Structure

```
breathing-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   └── auth.js               # JWT middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Session.js            # Session schema
│   │   ├── Pattern.js            # Custom pattern schema
│   │   └── Reminder.js           # Reminder schema
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── session.js            # Session routes
│   │   ├── user.js               # User routes
│   │   ├── pattern.js            # Pattern routes
│   │   └── reminder.js           # Reminder routes
│   ├── utils/
│   │   └── cronJobs.js           # Scheduled tasks
│   ├── .env                      # Environment variables
│   ├── server.js                 # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BreathingVisualizer.jsx   # Main animation
│   │   │   ├── BreathingSession.jsx      # Session container
│   │   │   ├── LeftPanel.jsx             # Stats panel
│   │   │   ├── RightPanel.jsx            # Controls panel
│   │   │   ├── Dashboard.jsx             # User dashboard
│   │   │   ├── LandingPage.jsx           # Home page
│   │   │   ├── Auth.jsx                  # Login/Register
│   │   │   ├── Navbar.jsx                # Navigation
│   │   │   └── CustomPattern.jsx         # Pattern creator
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Auth state
│   │   ├── utils/
│   │   │   ├── api.js                    # Axios instance
│   │   │   └── sounds.js                 # Sound utilities
│   │   ├── App.jsx                       # App component
│   │   ├── main.jsx                      # Entry point
│   │   └── index.css                     # Global styles
│   ├── public/
│   │   ├── index.html
│   │   └── sounds/
│   │       └── ambient.mp3
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── IMPLEMENTATION_GUIDE.md       # Frontend guide
├── BACKEND_IMPLEMENTATION_GUIDE.md  # Backend guide
└── README.md                     # This file
```

---

## 📋 Prerequisites

- **Node.js** 16+ installed
- **MongoDB** installed and running
- **npm** or **yarn** package manager
- **Git** (optional)

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd breathing-app
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

Create `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/breathing-app
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Optional: Email configuration for reminders
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend Configuration

The frontend is already configured with proxy in `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
```

---

## 🏃 Running the Application

### Start MongoDB
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

### Start Backend Server
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

### Access the Application
Open browser: `http://localhost:5173`

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here",
    "stats": { ... },
    "achievements": []
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Session Endpoints

#### Start Session
```http
POST /session/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "duration": 300,
  "pattern": {
    "inhale": 5,
    "hold": 2,
    "exhale": 7
  }
}
```

#### Complete Session
```http
POST /session/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session_id_here",
  "duration": 300,
  "pattern": {
    "inhale": 5,
    "hold": 2,
    "exhale": 7
  }
}

Response:
{
  "success": true,
  "data": {
    "session": { ... },
    "streak": 5,
    "totalSessions": 10,
    "totalMinutes": 50,
    "newAchievements": [
      {
        "name": "Getting Started",
        "icon": "🌿",
        "description": "Complete 5 sessions"
      }
    ]
  }
}
```

#### Get Session History
```http
GET /session/history
Authorization: Bearer <token>
```

### User Endpoints

#### Get User Statistics
```http
GET /user/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "streak": 7,
    "longestStreak": 14,
    "totalSessions": 25,
    "totalMinutes": 125,
    "achievements": [ ... ]
  }
}
```

#### Get User Profile
```http
GET /user/profile
Authorization: Bearer <token>
```

---

## 🎨 Frontend Components

### BreathingVisualizer
Main animation component with:
- SVG curved path for ball movement
- Framer Motion animations
- Phase management (inhale/hold/exhale)
- Sound effects
- Progress tracking
- Control buttons (Start, Pause, Reset)

### BreathingSession
Container component that layouts:
- LeftPanel (Stats)
- BreathingVisualizer (Center)
- RightPanel (Controls)

### Dashboard
User statistics dashboard with:
- Streak history chart (Recharts)
- Session statistics
- Achievement badges
- Progress indicators

### LeftPanel
Displays:
- Daily streak counter
- Motivational quotes
- Quick stats
- Benefits information

### RightPanel
Contains:
- Session duration buttons (3, 5, 8, 10 min)
- Pattern selector
- Custom pattern button
- Breathing tips

---

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (hashed),
  stats: {
    streak: Number (default: 0),
    totalSessions: Number (default: 0),
    totalMinutes: Number (default: 0),
    lastSessionDate: Date,
    longestStreak: Number (default: 0)
  },
  achievements: [
    {
      name: String,
      icon: String,
      description: String,
      unlockedAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Session Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  duration: Number (seconds),
  pattern: {
    inhale: Number,
    hold: Number,
    exhale: Number
  },
  completed: Boolean (default: false),
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🌬️ Breathing Patterns

### Preset Patterns
1. **Default (5-2-7)** - Relaxation breathing
2. **Quick (3-1-5)** - Fast calming
3. **Balanced (4-4-6)** - Equal rhythm
4. **Calm (5-2-5)** - Steady peace
5. **Custom** - User-defined timing

### Pattern Format
```javascript
{
  inhale: Number,   // seconds to breathe in
  hold: Number,     // seconds to hold breath
  exhale: Number    // seconds to breathe out
}
```

---

## 🏆 Achievement System

### Available Achievements (13 Total)

**Session-Based:**
- 🌱 First Breath (1 session)
- 🌿 Getting Started (5 sessions)
- 🌳 Dedicated (10 sessions)
- 🏆 Committed (25 sessions)
- ⭐ Breathing Master (50 sessions)
- 🧘 Zen Master (100 sessions)

**Streak-Based:**
- 🔥 3-Day Streak
- 💪 Week Warrior (7 days)
- 🏅 Two Week Champion (14 days)
- 🌟 Monthly Meditator (30 days)

**Time-Based:**
- ⏰ Hour of Peace (60 minutes)
- ⌛ Time Investment (300 minutes)
- 💎 Dedication Master (1000 minutes)

---

## 🎯 Key Features Explained

### Streak System
- Tracks consecutive days of practice
- Resets if you miss a day
- Updates on session completion
- Shows longest streak achieved

### Animation System
- Ball follows SVG Bézier curve
- Scales based on breathing phase
- Background blurs during hold
- Smooth easing transitions

### Sound System
- Web Audio API oscillator tones
- Different frequencies per phase
- Toggle on/off functionality
- No external audio files needed

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod

# Or use service
sudo systemctl start mongod
```

### CORS Errors
- Ensure backend runs on port 5000
- Frontend proxy should target `http://localhost:5000`
- Check CORS is enabled in `server.js`

### JWT Token Issues
- Token format: `Authorization: Bearer <token>`
- Token expires after 7 days
- Re-login if expired

### Frontend Not Loading
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Development Notes

### Current Implementation Status
✅ Frontend advanced animation complete
✅ Backend structure defined
⚠️ Backend files need to be created/populated
⚠️ Frontend core components need code
⚠️ Database connection needs setup

### Next Steps
1. Create all backend files (see `BACKEND_IMPLEMENTATION_GUIDE.md`)
2. Populate frontend components with code
3. Set up MongoDB database
4. Test API endpoints
5. Connect frontend to backend
6. Test authentication flow
7. Test session tracking
8. Verify achievement system

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

ISC License - See LICENSE file for details

---

## 👨‍💻 Author

**Mahmud Hasan Mubin**

---

## 📚 Additional Resources

- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Frontend setup guide
- [BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md) - Complete backend implementation
- [React Documentation](https://react.dev)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com)

---

**Built with ❤️ for mindful breathing and meditation**
