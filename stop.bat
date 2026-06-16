@ECHO OFF
ECHO ============================================
ECHO  Hospital MCD - Stopping All Services
ECHO ============================================

ECHO Killing Laravel (php artisan serve)...
taskkill /F /FI "WINDOWTITLE eq Laravel Backend*" >NUL 2>&1
taskkill /F /IM php.exe >NUL 2>&1

ECHO Killing API Gateway (node)...
taskkill /F /FI "WINDOWTITLE eq API Gateway*" >NUL 2>&1
taskkill /F /IM node.exe >NUL 2>&1

ECHO Killing React frontend (npm/vite)...
taskkill /F /FI "WINDOWTITLE eq React Frontend*" >NUL 2>&1

ECHO.
ECHO All services stopped.
PAUSE
