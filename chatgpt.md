# 🧘‍♂️ Breathing App - Complete Project Overview for AI Context

## 📋 Project Summary

**Project Name**: Breathing App  
**Type**: Full-Stack MERN Application  
**Purpose**: Modern breathing and meditation application with advanced animations, user authentication, progress tracking, and gamification  
**Author**: Mahmud Hasan Mubin  
**License**: ISC  

## 🏗️ Architecture Overview

### **Technology Stack**

**Frontend:**
- React 18.2 - UI framework
- Vite 5.0 - Build tool and dev server
- TailwindCSS 3.3 - Utility-first CSS framework
- Framer Motion 10.16 - Animation library
- Lucide React - Icon library
- Canvas Confetti - Celebration effects
- React Hot Toast - Notification system
- Recharts - Data visualization for charts
- Axios - HTTP client for API calls
- React Router DOM - Client-side routing

**Backend:**
- Node.js - Runtime environment
- Express.js 4.18 - Web framework
- MongoDB 7.6 - NoSQL database
- Mongoose - MongoDB ODM
- JWT (jsonwebtoken) - Authentication tokens
- bcryptjs - Password hashing
- CORS - Cross-origin resource sharing
- dotenv - Environment variable management
- node-cron - Scheduled tasks
- nodemailer - Email functionality

**Development Tools:**
- Nodemon - Backend hot reload
- Vitest - Testing framework
- Docker & Docker Compose - Containerization
- ESM modules (type: "module")

## 📁 Complete Project Structure

```
breathing-app/
├── .env                              # Environment variables (MongoDB, JWT, etc.)
├── .gitignore                        # Git ignore rules
├── docker-compose.yml                # Docker orchestration
├── package.json                      # Root package.json (minimal)
├── package-lock.json                 # Root lockfile
├── start-dev.bat                     # Windows development startup script
├── start-dev.sh                      # Unix development startup script
├── README.md                         # Main project documentation
├── IMPLEMENTATION_GUIDE.md           # Frontend implementation guide
├── BACKEND_IMPLEMENTATION_GUIDE.md   # Backend implementation guide
├── DOCKER_SETUP.md                   # Docker setup instructions
├── PROJECT_STATUS.md                 # Current project status
├── TODOReadme.md                     # TODO items
├── chatgpt.md                        # This file - AI context overview
│
├── .git/                             # Git repository
├── .kiro/                            # Kiro IDE configuration
│
├── backend/                          # Backend Node.js application
│   ├── .dockerignore                 # Docker ignore for backend
│   ├── Dockerfile                    # Backend container configuration
│   ├── package.json                  # Backend dependencies and scripts
│   ├── package-lock.json             # Backend lockfile
│   ├── server.js                     # Main server entry point
│   │
│   ├── config/
│   │   └── db.js                     # MongoDB connection configuration
│   │
│   ├── middleware/
│   │   └── auth.js                   # JWT authentication middleware
│   │
│   ├── models/                       # Mongoose schemas
│   │   ├── User.js                   # User model with stats and achievements
│   │   ├── Session.js                # Breathing session model
│   │   ├── Pattern.js                # Custom breathing pattern model
│   │   └── Reminder.js               # Reminder/notification model
│   │
│   ├── routes/                       # Express route handlers
│   │   ├── auth.js                   # Authentication routes (register, login)
│   │   ├── user.js                   # User profile and stats routes
│   │   ├── session.js                # Session tracking routes
│   │   ├── pattern.js                # Custom pattern CRUD routes
│   │   └── reminder.js               # Reminder management routes
│   │
│   └── utils/
│       └── cronJobs.js               # Scheduled tasks (streak resets, etc.)
│
└── frontend/                         # Frontend React application
    ├── .dockerignore                 # Docker ignore for frontend
    ├── Dockerfile                    # Frontend container configuration
    ├── package.json                  # Frontend dependencies and scripts
    ├── package-lock.json             # Frontend lockfile
    ├── index.html                    # HTML entry point
    ├── vite.config.js                # Vite configuration with proxy
    ├── tailwind.config.js            # TailwindCSS configuration
    ├── postcss.config.js             # PostCSS configuration
    ├── vitest.config.js              # Vitest testing configuration
    │
    ├── public/
    │   └── sounds/                   # Audio files for breathing sounds
    │       └── ambient.mp3           # Background ambient sound
    │
    └── src/                          # React source code
        ├── main.jsx                  # React app entry point
        ├── App.jsx                   # Main App component with routing
        ├── index.css                 # Global CSS styles
        │
        ├── components/               # React components
        │   ├── BreathingVisualizer.jsx    # Main animation component
        │   ├── BreathingSession.jsx       # Session container component
        │   ├── LeftPanel.jsx              # Stats and motivation panel
        │   ├── RightPanel.jsx             # Controls and settings panel
        │   ├── Dashboard.jsx              # User dashboard with charts
        │   ├── LandingPage.jsx            # Home/welcome page
        │   ├── Auth.jsx                   # Login/Register forms
        │   ├── Navbar.jsx                 # Navigation component
        │   └── CustomPattern.jsx          # Custom pattern creator
        │
        ├── context/
        │   └── AuthContext.jsx            # Authentication state management
        │
        └── utils/
            ├── api.js                     # Axios configuration and API calls
            └── sounds.js                  # Sound management utilities
```

## 🔧 Configuration Files

### **Environment Variables (.env)**
```env
# Backend Configuration
MONGODB_URI=mongo_connection_string?retryWrites=true&w=majority
JWT_SECRET=breathing_app_super_secret_jwt_key_2024_secure_32_characters_minimum
PORT=5000
NODE_ENV=development

# Frontend Configuration
VITE_API_URL=http://localhost:5000

# Email Configuration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

### **Docker Configuration**

**docker-compose.yml:**
- Backend service: Node.js 18-alpine, port 5000, volume mounts for hot reload
- Frontend service: Node.js 20-alpine, port 5174, volume mounts for hot reload
- Shared network: breathing-app-network
- Environment file loading: .env
- Restart policy: unless-stopped

**Backend Dockerfile:**
- Base: node:18-alpine
- Installs all dependencies (including dev)
- Runs `npm run dev` with nodemon for hot reload
- Exposes port 5000

**Frontend Dockerfile:**
- Base: node:20-alpine
- Installs all dependencies
- Runs Vite dev server with `--host 0.0.0.0`
- Exposes port 5174
- Uses non-root user for security

### **Vite Configuration (frontend/vite.config.js)**
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
```

## 🗄️ Database Schema

### **User Model (MongoDB)**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (bcrypt hashed),
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

### **Session Model**
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  duration: Number (seconds),
  pattern: {
    inhale: Number (seconds),
    hold: Number (seconds),
    exhale: Number (seconds)
  },
  completed: Boolean (default: false),
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **Pattern Model (Custom Breathing Patterns)**
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  name: String,
  description: String,
  pattern: {
    inhale: Number,
    hold: Number,
    exhale: Number
  },
  isPublic: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### **Reminder Model**
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  time: String (HH:MM format),
  days: [String] (array of weekdays),
  message: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## 🛣️ API Routes

### **Authentication Routes (/api/auth)**
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user (protected)

### **User Routes (/api/user)**
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `GET /stats` - Get user statistics (protected)

### **Session Routes (/api/session)**
- `POST /start` - Start breathing session (protected)
- `POST /complete` - Complete session and update stats (protected)
- `GET /history` - Get session history (protected)
- `GET /stats` - Get session statistics (protected)

### **Pattern Routes (/api/patterns)**
- `GET /` - Get all patterns (public + user's custom)
- `POST /` - Create custom pattern (protected)
- `PUT /:id` - Update custom pattern (protected)
- `DELETE /:id` - Delete custom pattern (protected)

### **Reminder Routes (/api/reminder)**
- `GET /` - Get user reminders (protected)
- `POST /` - Create reminder (protected)
- `PUT /:id` - Update reminder (protected)
- `DELETE /:id` - Delete reminder (protected)

## 🎨 Frontend Components

### **Core Components**

**BreathingVisualizer.jsx:**
- Main animation component with SVG curved path
- Ball movement along Bézier curve
- Framer Motion animations for scaling and movement
- Phase management (inhale/hold/exhale)
- Sound effects using Web Audio API
- Progress tracking with visual indicators
- Control buttons (Start, Pause, Reset)

**BreathingSession.jsx:**
- Container component for the main breathing interface
- Layout management for three-panel design
- Session state management
- Timer functionality
- Pattern switching logic

**LeftPanel.jsx:**
- Daily streak counter with visual indicators
- Motivational quotes rotation
- Quick statistics display
- Benefits information
- Progress indicators

**RightPanel.jsx:**
- Session duration buttons (3, 5, 8, 10 minutes)
- Breathing pattern selector
- Custom pattern creation button
- Breathing tips and instructions
- Settings toggles

**Dashboard.jsx:**
- User statistics overview
- Streak history chart using Recharts
- Achievement badge display
- Session history table
- Progress indicators and goals

**Auth.jsx:**
- Login and registration forms
- Form validation
- JWT token handling
- Error message display
- Responsive design

### **Utility Components**

**Navbar.jsx:**
- Navigation between pages
- User authentication status
- Logout functionality
- Responsive mobile menu

**LandingPage.jsx:**
- Welcome screen for new users
- Feature highlights
- Call-to-action buttons
- Responsive hero section

**CustomPattern.jsx:**
- Custom breathing pattern creator
- Real-time pattern preview
- Form validation
- Pattern saving functionality

## 🎯 Key Features

### **Breathing Animation System**
- **SVG Path Animation**: Ball follows curved Bézier path
- **Phase-based Scaling**: Ball size changes with breathing phases
- **Background Effects**: Blur and color transitions during hold phase
- **Smooth Transitions**: Framer Motion easing functions
- **Responsive Design**: Scales across all device sizes

### **Breathing Patterns**
1. **Default (5-2-7)** - Relaxation breathing
2. **Quick (3-1-5)** - Fast calming
3. **Balanced (4-4-6)** - Equal rhythm
4. **Calm (5-2-5)** - Steady peace
5. **Custom** - User-defined patterns

### **Gamification System**

**Achievement Categories:**
- **Session-Based**: 1, 5, 10, 25, 50, 100 sessions
- **Streak-Based**: 3, 7, 14, 30 day streaks
- **Time-Based**: 60, 300, 1000 total minutes

**Achievement Structure:**
```javascript
{
  name: "Getting Started",
  icon: "🌿",
  description: "Complete 5 sessions",
  requirement: { type: "sessions", count: 5 }
}
```

### **Sound System**
- **Web Audio API**: Oscillator-based tones
- **Phase-specific Frequencies**: Different tones for inhale/hold/exhale
- **Toggle Control**: Sound on/off functionality
- **No External Files**: Generated tones, no audio file dependencies

### **Progress Tracking**
- **Daily Streaks**: Consecutive days of practice
- **Session History**: Complete log of all sessions
- **Statistics**: Total sessions, minutes, longest streak
- **Visual Charts**: Progress visualization with Recharts

## 🔐 Authentication System

### **JWT Implementation**
- **Token Generation**: 7-day expiration
- **Middleware Protection**: Route-level authentication
- **Token Storage**: Client-side storage (localStorage)
- **Automatic Refresh**: Token validation on app load

### **Password Security**
- **bcryptjs Hashing**: Secure password storage
- **Salt Rounds**: 12 rounds for strong hashing
- **No Plain Text**: Passwords never stored in plain text

### **User Registration Flow**
1. Client sends registration data
2. Server validates input
3. Password hashed with bcrypt
4. User created in MongoDB
5. JWT token generated and returned
6. Client stores token and user data

## 🚀 Development Workflow

### **Docker Development (Current Setup)**
```bash
# Start with hot reload
docker-compose up --build

# Access points
Frontend: http://localhost:5174
Backend: http://localhost:5000
```

**Hot Reload Configured:**
- Backend: Nodemon restarts on file changes
- Frontend: Vite hot module replacement
- Volume mounts: Live code synchronization

### **Manual Development Alternative**
```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Frontend (Terminal 2)  
cd frontend && npm run dev
```

### **Available Scripts**

**Backend:**
- `npm start` - Production server
- `npm run dev` - Development with nodemon

**Frontend:**
- `npm run dev` - Vite dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm test` - Run tests with Vitest

## 🧪 Testing Setup

### **Frontend Testing (Vitest)**
- **Framework**: Vitest with jsdom
- **Configuration**: vitest.config.js
- **Test Types**: Unit tests for components
- **Property Testing**: fast-check integration

### **Test Commands**
- `npm test` - Single test run
- `npm run test:watch` - Watch mode

## 📦 Dependencies

### **Backend Dependencies**
```json
{
  "express": "^4.18.2",        // Web framework
  "mongoose": "^7.6.3",        // MongoDB ODM
  "bcryptjs": "^2.4.3",        // Password hashing
  "jsonwebtoken": "^9.0.2",    // JWT tokens
  "dotenv": "^16.3.1",         // Environment variables
  "cors": "^2.8.5",            // CORS middleware
  "node-cron": "^3.0.2",       // Scheduled tasks
  "nodemailer": "^6.9.7"       // Email functionality
}
```

### **Frontend Dependencies**
```json
{
  "react": "^18.2.0",              // UI framework
  "react-dom": "^18.2.0",          // DOM rendering
  "vite": "^7.2.4",                // Build tool
  "framer-motion": "^10.16.16",    // Animations
  "axios": "^1.6.2",               // HTTP client
  "react-router-dom": "^6.20.0",   // Routing
  "tailwindcss": "^3.3.6",         // CSS framework
  "lucide-react": "^0.294.0",      // Icons
  "canvas-confetti": "^1.9.2",     // Celebrations
  "react-hot-toast": "^2.4.1",     // Notifications
  "recharts": "^2.10.3"            // Charts
}
```

## 🌐 Deployment Configuration

### **Environment-Specific Settings**
- **Development**: Hot reload, detailed logging, CORS enabled
- **Production**: Optimized builds, error handling, security headers

### **Docker Production Ready**
- **Multi-stage builds**: Optimized image sizes
- **Security**: Non-root users, minimal attack surface
- **Health checks**: Container health monitoring
- **Restart policies**: Automatic recovery

## 🔍 Current Implementation Status

### **✅ Completed**
- Project structure and configuration
- Docker containerization with hot reload
- Environment variable setup
- MongoDB Atlas connection
- Basic backend server structure
- Frontend build configuration
- Package dependencies installed

### **🚧 In Progress / Needs Implementation**
- Backend route handlers (auth, session, user)
- Frontend React components
- Database models implementation
- Authentication middleware
- API integration
- UI/UX implementation
- Testing suite

### **📋 TODO**
- Complete backend API implementation
- Build React components
- Implement authentication flow
- Create breathing animation
- Add achievement system
- Implement sound system
- Add data visualization
- Write comprehensive tests

## 🎯 Development Priorities

1. **Backend API Implementation** - Complete all route handlers
2. **Database Models** - Implement Mongoose schemas
3. **Authentication System** - JWT middleware and auth flow
4. **Frontend Components** - Build React UI components
5. **Breathing Animation** - SVG path animation with Framer Motion
6. **API Integration** - Connect frontend to backend
7. **Testing** - Unit and integration tests
8. **Polish & Optimization** - Performance and UX improvements

## 🔧 Troubleshooting Guide

### **Common Issues**
1. **MongoDB Connection**: Check connection string and network access
2. **Port Conflicts**: Ensure ports 5000 and 5174 are available
3. **Docker Issues**: Clear containers and rebuild if needed
4. **Environment Variables**: Verify .env file exists and is loaded
5. **Hot Reload**: Check volume mounts in docker-compose.yml

### **Debug Commands**
```bash
# Check container logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart containers
docker-compose down && docker-compose up --build

# Check running processes
docker ps
```

## 📚 Additional Resources

- **Main Documentation**: README.md
- **Frontend Guide**: IMPLEMENTATION_GUIDE.md  
- **Backend Guide**: BACKEND_IMPLEMENTATION_GUIDE.md
- **Docker Setup**: DOCKER_SETUP.md
- **Project Status**: PROJECT_STATUS.md

---

**This document provides complete context for AI assistants to understand the Breathing App project structure, configuration, and current implementation status. All technical details, file structures, and development workflows are documented for comprehensive project understanding.**