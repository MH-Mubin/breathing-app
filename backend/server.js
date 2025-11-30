import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import patternRoutes from './routes/pattern.js';
import reminderRoutes from './routes/reminder.js';
import sessionRoutes from './routes/session.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/reminder', reminderRoutes);

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', message: 'Breathing App API is running' });
});

// Error handler
app.use((err, req, res, next) => {
	console.error(err.stack || err);
	res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
});
