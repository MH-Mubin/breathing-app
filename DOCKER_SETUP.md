# 🐳 Docker Setup Guide

This guide will help you run the Breathing App using Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git (to clone the repository)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/MH-Mubin/breathing-app.git
cd breathing-app
```

### 2. Create Environment File
Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/breathing-app
JWT_SECRET=your_super_secret_jwt_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
PORT=5000
```

**Important Notes:**
- Replace `MONGODB_URI` with your MongoDB connection string (get it from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Replace `JWT_SECRET` with a random secure string (at least 32 characters)
- Replace `EMAIL_USER` and `EMAIL_PASS` with your email credentials (use [Gmail App Password](https://support.google.com/accounts/answer/185833) for Gmail)

### 3. Build and Run
```bash
docker-compose up --build
```

### 4. Access the Application
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5000

## Development Mode

The containers are configured for development with hot reload:
- Changes to frontend code will automatically refresh the browser
- Changes to backend code will automatically restart the server

## Common Commands

### Stop the containers
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild containers
```bash
docker-compose up --build
```

### Run in background (detached mode)
```bash
docker-compose up -d
```

### Stop and remove containers, networks, and volumes
```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
If you get a port conflict error:
- Make sure ports 5000 and 5174 are not being used by other applications
- Or modify the ports in `docker-compose.yml`

### MongoDB Connection Error
- Check your `MONGODB_URI` is correct
- Ensure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0) or add your IP

### Container Won't Start
- Check logs: `docker-compose logs backend` or `docker-compose logs frontend`
- Ensure `.env` file exists with all required variables
- Try removing old containers: `docker-compose down -v` then rebuild

## Project Structure

```
breathing-app/
├── backend/              # Node.js + Express API
│   ├── Dockerfile
│   └── ...
├── frontend/             # React + Vite
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml    # Docker orchestration
└── .env                  # Environment variables (create this)
```

## Production Deployment

For production deployment, you may want to:
1. Use environment-specific docker-compose files
2. Enable SSL/TLS
3. Use production-grade MongoDB
4. Configure proper security settings
5. Use a reverse proxy (nginx)

---

**Need help?** Open an issue on GitHub!
