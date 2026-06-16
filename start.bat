@ECHO OFF
SETLOCAL

SET PHP=D:\xampp\php\php.exe
SET BASE=C:\Users\HP\.gemini\antigravity\scratch\hospital_mcd_laravel
SET BACKEND=%BASE%\backend
SET GATEWAY=%BASE%\gateway
SET FRONTEND=%BASE%\frontend

ECHO ============================================
ECHO  Hospital MCD - Starting All Services
ECHO ============================================

ECHO.
ECHO [1/3] Starting Laravel backend (port 8000)...
START "Laravel Backend" cmd /k "cd /d "%BACKEND%" && "%PHP%" artisan serve --host=127.0.0.1 --port=8000"

TIMEOUT /T 2 /NOBREAK >NUL

ECHO [2/3] Starting API Gateway (port 3000)...
START "API Gateway" cmd /k "cd /d "%GATEWAY%" && node src\index.js"

TIMEOUT /T 2 /NOBREAK >NUL

ECHO [3/3] Starting React frontend (port 5173)...
START "React Frontend" cmd /k "cd /d "%FRONTEND%" && npm run dev"

TIMEOUT /T 3 /NOBREAK >NUL

ECHO.
ECHO ============================================
ECHO  All services started!
ECHO  - Laravel API : http://127.0.0.1:8000
ECHO  - API Gateway : http://localhost:3050
ECHO  - Frontend    : http://localhost:5173
ECHO ============================================

ECHO.
ECHO Opening browser...
START "" "http://localhost:5173"

PAUSE
