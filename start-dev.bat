@echo off
echo Starting ViCord Development Servers...
echo.

echo [1/2] Starting Backend Server...
start "ViCord Backend" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server...
start "ViCord Frontend" cmd /k "npm run dev"

echo.
echo ================================
echo   ViCord Development Started!
echo ================================
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo ================================
echo.
echo Press any key to exit...
pause > nul

