@echo off
echo ========================================
echo   ViCord - Discord Alternative
echo   Starting development server...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting Vite dev server...
echo.
call npm run dev

pause

