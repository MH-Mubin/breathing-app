# 🔧 Backend Implementation Guide - Breathing App

## 📊 Project Analysis Summary

### Frontend Requirements (Based on Your Structure)
Your frontend expects the following backend functionality:

1. **User Authentication** (JWT-based)
   - Register new users
   - Login existing users
   - Protected route middleware

2. **Session Management**
   - Start breathing sessions
   - Complete sessions with stats
   - Track session history
   - Calculate achievements

3. **User Statistics**
   - Daily streak tracking
   - Total sessions count
   - Total minutes breathed
   - Achievement system

4. **Custom Patterns** (Optional, for future)
   - Save custom breathing patterns
   - Retrieve user patterns

5. **Reminders** (Optional, for future)
   - Set daily reminders
   - Email/push notifications

---

## 📁 Backend Files You Need to Create/Edit

### ✅ **MUST CREATE - Core Files**

#### 1. `backend/.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/breathing-app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Optional for email reminders
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### 2. `backend/server.js`
**Status:** EMPTY - MUST CREATE  
**Purpose:** Main Express server setup

**Required Code:**
```javascript
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import sessionRoutes from './routes/session.js';
import patternRoutes from './routes/pattern.js';
import reminderRoutes from './routes/reminder.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/reminder', reminderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Breathing App API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

#### 3. `backend/config/db.js`
**Status:** EMPTY - MUST CREATE  
**Purpose:** MongoDB connection utility

```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```

#### 4. `backend/models/User.js`
**Status:** EMPTY - MUST CREATE  
**Purpose:** User schema with authentication, stats, achievements

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  description: String,
  unlockedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  stats: {
    streak: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
    lastSessionDate: Date,
    longestStreak: { type: Number, default: 0 }
  },
  achievements: [achievementSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.stats.lastSessionDate) {
    this.stats.streak = 1;
    this.stats.lastSessionDate = today;
  } else {
    const lastSession = new Date(this.stats.lastSessionDate);
    lastSession.setHours(0, 0, 0, 0);
    
    const diffTime = today - lastSession;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return; // Same day
    } else if (diffDays === 1) {
      this.stats.streak += 1;
      this.stats.lastSessionDate = today;
    } else {
      this.stats.streak = 1;
      this.stats.lastSessionDate = today;
    }
    
    if (this.stats.streak > this.stats.longestStreak) {
      this.stats.longestStreak = this.stats.streak;
    }
  }
};

// Method to check and unlock achievements
userSchema.methods.checkAchievements = function() {
  const newAchievements = [];
  
  const achievements = [
    { sessions: 1, name: 'First Breath', icon: '🌱', description: 'Complete your first session' },
    { sessions: 5, name: 'Getting Started', icon: '🌿', description: 'Complete 5 sessions' },
    { sessions: 10, name: 'Dedicated', icon: '🌳', description: 'Complete 10 sessions' },
    { sessions: 25, name: 'Committed', icon: '🏆', description: 'Complete 25 sessions' },
    { sessions: 50, name: 'Breathing Master', icon: '⭐', description: 'Complete 50 sessions' },
    { sessions: 100, name: 'Zen Master', icon: '🧘', description: 'Complete 100 sessions' },
    { streak: 3, name: '3-Day Streak', icon: '🔥', description: 'Maintain a 3-day streak' },
    { streak: 7, name: 'Week Warrior', icon: '💪', description: 'Maintain a 7-day streak' },
    { streak: 14, name: 'Two Week Champion', icon: '🏅', description: 'Maintain a 14-day streak' },
    { streak: 30, name: 'Monthly Meditator', icon: '🌟', description: 'Maintain a 30-day streak' },
    { minutes: 60, name: 'Hour of Peace', icon: '⏰', description: 'Complete 60 minutes total' },
    { minutes: 300, name: 'Time Investment', icon: '⌛', description: 'Complete 5 hours total' },
    { minutes: 1000, name: 'Dedication Master', icon: '💎', description: 'Complete 1000 minutes total' }
  ];
  
  achievements.forEach(achievement => {
    const alreadyUnlocked = this.achievements.some(a => a.name === achievement.name);
    
    if (!alreadyUnlocked) {
      let shouldUnlock = false;
      
      if (achievement.sessions && this.stats.totalSessions >= achievement.sessions) {
        shouldUnlock = true;
      }
      if (achievement.streak && this.stats.streak >= achievement.streak) {
        shouldUnlock = true;
      }
      if (achievement.minutes && this.stats.totalMinutes >= achievement.minutes) {
        shouldUnlock = true;
      }
      
      if (shouldUnlock) {
        this.achievements.push({
          name: achievement.name,
          icon: achievement.icon,
          description: achievement.description
        });
        newAchievements.push({
          name: achievement.name,
          icon: achievement.icon,
          description: achievement.description
        });
      }
    }
  });
  
  return newAchievements;
};

const User = mongoose.model('User', userSchema);

export default User;
```

#### 5. `backend/models/Session.js`
**Status:** EMPTY - MUST CREATE  
**Purpose:** Session tracking schema

```javascript
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: Number,
    required: true // in seconds
  },
  pattern: {
    inhale: { type: Number, required: true },
    hold: { type: Number, required: true },
    exhale: { type: Number, required: true }
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date
}, {
  timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;
```

#### 6. `backend/middleware/auth.js`
**Status:** EMPTY - MUST CREATE  
**Purpose:** JWT authentication middleware

```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};
```

#### 7. `backend/routes/auth.js`
**Status:** EMPTY - MUST CREATE  
**Purpose:** Authentication routes (register, login)

```javascript
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        stats: user.stats,
        achievements: user.achievements,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        stats: user.stats,
        achievements: user.achievements,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
```

#### 8. `backend/routes/session.js`
**Status:** EMPTY - MUST CREATE  
**Purpose:** Session management routes

```javascript
import express from 'express';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/session/start
// @desc    Start a new breathing session
// @access  Private
router.post('/start', protect, async (req, res) => {
  try {
    const { duration, pattern } = req.body;

    const session = await Session.create({
      user: req.user._id,
      duration,
      pattern
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/session/complete
// @desc    Complete a breathing session
// @access  Private
router.post('/complete', protect, async (req, res) => {
  try {
    const { sessionId, duration, pattern } = req.body;

    // Find and update session
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    session.completed = true;
    session.completedAt = new Date();
    await session.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    
    user.stats.totalSessions += 1;
    user.stats.totalMinutes += Math.floor(duration / 60);
    user.updateStreak();
    
    const newAchievements = user.checkAchievements();
    
    await user.save();

    res.json({
      success: true,
      data: {
        session,
        streak: user.stats.streak,
        totalSessions: user.stats.totalSessions,
        totalMinutes: user.stats.totalMinutes,
        newAchievements
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/session/history
// @desc    Get user's session history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ 
      user: req.user._id,
      completed: true 
    })
    .sort({ completedAt: -1 })
    .limit(50);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
```

#### 9. `backend/routes/user.js`
**Status:** EMPTY - MUST CREATE  
**Purpose:** User stats and profile routes

```javascript
import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/user/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        streak: user.stats.streak,
        longestStreak: user.stats.longestStreak,
        totalSessions: user.stats.totalSessions,
        totalMinutes: user.stats.totalMinutes,
        achievements: user.achievements
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
```

---

### ⚠️ **OPTIONAL - Future Enhancement Files**

#### 10. `backend/models/Pattern.js` (Optional)
**Status:** EXISTS but EMPTY  
**Purpose:** Save custom breathing patterns

```javascript
import mongoose from 'mongoose';

const patternSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  inhale: {
    type: Number,
    required: true
  },
  hold: {
    type: Number,
    required: true
  },
  exhale: {
    type: Number,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Pattern = mongoose.model('Pattern', patternSchema);

export default Pattern;
```

#### 11. `backend/routes/pattern.js` (Optional)
**Status:** EXISTS but EMPTY

```javascript
import express from 'express';
import Pattern from '../models/Pattern.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/patterns/create
// @desc    Create custom pattern
// @access  Private
router.post('/create', protect, async (req, res) => {
  try {
    const { name, inhale, hold, exhale } = req.body;

    const pattern = await Pattern.create({
      user: req.user._id,
      name,
      inhale,
      hold,
      exhale
    });

    res.status(201).json({
      success: true,
      data: pattern
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/patterns
// @desc    Get user's custom patterns
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const patterns = await Pattern.find({ user: req.user._id });

    res.json({
      success: true,
      data: patterns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/patterns/:id
// @desc    Delete custom pattern
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const pattern = await Pattern.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: 'Pattern not found'
      });
    }

    res.json({
      success: true,
      message: 'Pattern deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
```

---

## 🗄️ Database Schema Overview

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  stats: {
    streak: Number,
    totalSessions: Number,
    totalMinutes: Number,
    lastSessionDate: Date,
    longestStreak: Number
  },
  achievements: [{
    name: String,
    icon: String,
    description: String,
    unlockedAt: Date
  }],
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
  completed: Boolean,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Setup Instructions

### 1. Install MongoDB
```bash
# Windows (with Chocolatey)
choco install mongodb

# Or download from: https://www.mongodb.com/try/download/community
```

### 2. Start MongoDB
```bash
# Windows
mongod
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Create .env file
Copy the .env template above and update values.

### 5. Run Backend Server
```bash
cd backend
npm run dev
```

### 6. Test API
```bash
# Health check
curl http://localhost:5000/api/health

# Or visit in browser
http://localhost:5000/api/health
```

---

## 📡 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Sessions
- `POST /api/session/start` - Start session (Protected)
- `POST /api/session/complete` - Complete session (Protected)
- `GET /api/session/history` - Get session history (Protected)

### User
- `GET /api/user/stats` - Get user statistics (Protected)
- `GET /api/user/profile` - Get user profile (Protected)

### Patterns (Optional)
- `POST /api/patterns/create` - Create custom pattern (Protected)
- `GET /api/patterns` - Get user patterns (Protected)
- `DELETE /api/patterns/:id` - Delete pattern (Protected)

---

## ✅ Implementation Checklist

- [ ] Create `.env` file with MongoDB URI and JWT secret
- [ ] Create `server.js` with Express setup
- [ ] Create `config/db.js` for MongoDB connection
- [ ] Create `models/User.js` with authentication & stats
- [ ] Create `models/Session.js` for session tracking
- [ ] Create `middleware/auth.js` for JWT protection
- [ ] Create `routes/auth.js` for register/login
- [ ] Create `routes/session.js` for session management
- [ ] Create `routes/user.js` for user stats
- [ ] Install MongoDB and start the server
- [ ] Run `npm install` in backend folder
- [ ] Start backend with `npm run dev`
- [ ] Test API endpoints with Postman/Thunder Client

---

## 🔒 Security Notes

1. **Never commit `.env` file to Git**
2. **Change JWT_SECRET in production**
3. **Use strong passwords (min 6 characters)**
4. **Enable CORS only for your frontend domain in production**
5. **Add rate limiting for API endpoints**
6. **Validate all user inputs**

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MongoDB URI in `.env`
- Try: `mongodb://127.0.0.1:27017/breathing-app`

### JWT Token Issues
- Check JWT_SECRET is set in `.env`
- Ensure token is sent as: `Authorization: Bearer <token>`
- Token expires after 7 days by default

### CORS Errors
- Backend must run on port 5000
- Frontend must have proxy configured in `vite.config.js`

---

**Ready to build your backend! 🚀**
