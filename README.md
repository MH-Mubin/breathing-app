# Respira - Advanced Breathing & Wellness Platform 🌿

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **Live Demo:** [https://endearing-purpose-production.up.railway.app](https://endearing-purpose-production.up.railway.app)

Respira is a high-performance web application designed to help users master their breath through guided exercises. Built with scalability and user experience in mind, it provides a seamless, interactive platform for stress relief, improved focus, and better sleep.

---

## 📖 About

Respira is more than just a breathing app—it's your personal wellness companion. In today's fast-paced world, stress and anxiety have become constant companions. Respira offers a science-backed solution through the power of controlled breathing.

### Why Breathing Matters

Breathing is the only autonomic function we can consciously control. By mastering your breath, you can:
- **Reduce stress and anxiety** by activating the parasympathetic nervous system
- **Improve focus and concentration** through increased oxygen flow to the brain
- **Enhance sleep quality** by calming the mind and body
- **Boost energy levels** with energizing breathing patterns
- **Support physical health** by improving heart rate variability (HRV)

### Our Mission

To make evidence-based breathing techniques accessible to everyone, anywhere, anytime. Whether you're a beginner or an experienced practitioner, Respira provides the tools and guidance you need to harness the power of your breath.

### What Makes Respira Different

- **Science-Backed Patterns**: All breathing patterns are based on research from leading experts in breathwork, including Dr. Andrew Weil, Dr. Herbert Benson, and James Nestor
- **Adaptive Visualization**: Our unique path-based visualizer adapts to any breathing pattern, making it easy to follow along
- **Progress Tracking**: Stay motivated with streak tracking, session history, and achievement badges
- **Expert Insights**: Learn from quotes and recommendations from breathing experts
- **Community Feedback**: Share your experience and read testimonials from other users

---

## 📸 Screenshots


### Landing Page
![Landing Page](./screenshots/landing-page.png)
*Beautiful, modern landing page with animated breathing visualization*

### Practice Session
![Practice Session](./screenshots/practice-session.png)
*Interactive breathing visualizer with real-time guidance*

### Dashboard
![Dashboard](./screenshots/dashboard_1.png)
*Comprehensive dashboard with stats, activity heatmap, and insights*

![Dashboard](./screenshots/dashboard_2.png)
*Comprehensive dashboard with stats, activity heatmap, and insights*

### Profile Page
![Profile Page](./screenshots/profile-page.png)
*Manage your account, preferences, and security settings*

### Pattern Selection
![Pattern Selection](./screenshots/pattern-selection.png)
*Choose from 24+ scientifically-designed breathing patterns*



---

## 🚀 Key Features

*   **Diverse Breathing Patterns**:  Includes curated patterns for Focus, Stress Relief, Energy, and Sleep.
*   **Real-time Visual Guide**: Smooth, animation-driven breathing visualizer to help users maintain perfect rhythm.
*   **Progress Tracking**: Tracks daily streaks, total sessions, and minutes breathed to keep users motivated.
*   **SEO Optimized**: Built with semantic HTML and optimized metadata to ensure high visibility on search engines.
*   **High Performance**: Optimized for scalability, capable of handling high concurrent user loads with minimal latency.
*   **Responsive Design**: Fully responsive interface that works beautifully on desktop, tablet, and mobile devices.
*   **Secure Authentication**: Robust user authentication system using JWT (JSON Web Tokens).

## 🛠️ Tech Stack

**Frontend:**
*   React 18 (Vite)
*   Tailwind CSS (Styling)
*   Framer Motion (Animations)
*   Axios (API Integration)

**Backend:**
*   Node.js & Express.js
*   MongoDB (Database)
*   Mongoose (ODM)
*   JWT (Authentication)

## 🏁 Getting Started

Follow these instructions to get a copy of the project and run it on your local machine.

### Prerequisites

*   Node.js (v16+)
*   MongoDB (Local or Atlas)
*   Git

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/MH-Mubin/breathing-app.git
    cd breathing-app
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Create .env file (see Environment Variables below)
    npm start
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    # Create .env file (see Environment Variables below)
    npm run dev
    ```

## 🔐 Environment Variables

### Backend Environment Variables

Create `backend/.env.local` for local development:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/breathing-app?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=30d

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Respira Support

# Frontend URL
FRONTEND_URL=http://localhost:5175
```

**Important:** 
- Never commit `.env.local` to git
- Use `.env.example` as a template

### Frontend Environment Variables

Create `frontend/.env.local` for local development:

```env
VITE_API_URL=http://localhost:5001
```

For production (Railway):
```env
VITE_API_URL=https://your-backend-url.up.railway.app
```

**Note:** Do not include `/api` at the end - the code adds it automatically.

## 📄 License

This project is licensed under the ISC License.
