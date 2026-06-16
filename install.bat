@ECHO OFF
SETLOCAL

SET PHP=D:\xampp\php\php.exe
SET BASE=C:\Users\HP\.gemini\antigravity\scratch\hospital_mcd_laravel
SET BACKEND=%BASE%\backend
SET GATEWAY=%BASE%\gateway
SET FRONTEND=%BASE%\frontend

ECHO ============================================
ECHO  Hospital MCD - Install Script
ECHO ============================================

ECHO.
ECHO [1/4] Installing PHP dependencies (backend)...
cd /d "%BACKEND%"
"%PHP%" "%BASE%\composer.phar" install --no-interaction --no-security-blocking
IF ERRORLEVEL 1 (ECHO [ERROR] composer install failed & PAUSE & EXIT /B 1)

ECHO.
ECHO [2/4] Generating Laravel app key...
"%PHP%" artisan key:generate --force
IF ERRORLEVEL 1 (ECHO [ERROR] key:generate failed & PAUSE & EXIT /B 1)

ECHO.
ECHO [3/4] Running migrations and seeders...
"%PHP%" artisan migrate:fresh --force
"%PHP%" artisan db:seed --force
IF ERRORLEVEL 1 (ECHO [ERROR] migrate/seed failed & PAUSE & EXIT /B 1)

ECHO.
ECHO [4/4] Installing Node dependencies...
cd /d "%GATEWAY%"
npm install --silent
cd /d "%FRONTEND%"
npm install --silent

ECHO.
ECHO ============================================
ECHO  Installation complete!
ECHO  Run start.bat to launch all services.
ECHO ============================================
PAUSE
