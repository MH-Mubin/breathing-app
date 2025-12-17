@echo off
echo Starting Breathing App Development Environment...
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Development Server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5174
echo.
echo Press any key to exit...
pause > nul