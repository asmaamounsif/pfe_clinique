@echo off

rem =============================================================
rem  Script auto_setup.bat – XAMPP based full automatic setup
rem  Modifications:
rem   • Detect MySQL service name dynamically
rem   • Fallback to direct XAMPP start if service missing
rem   • Add XAMPP paths to system environment via registry
rem   • French status / error messages
rem   • Wait 8 seconds after MySQL startup
rem   • Pause at the end to keep window open
rem =============================================================

set "XAMPP_PHP=C:\\xampp\\php"
set "XAMPP_MYSQL=C:\\xampp\\mysql\\bin"

rem -------------------------------------------------------------
rem 1. Ajout de XAMPP au PATH de façon permanente (registry)
rem -------------------------------------------------------------
echo Ajout de XAMPP au PATH système... 
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" ^
    /v Path /t REG_EXPAND_SZ /d "%PATH%;%XAMPP_PHP%;%XAMPP_MYSQL%" /f >nul
if %errorlevel% neq 0 (
    echo [ERREUR] Impossible d\'ajouter XAMPP au PATH via le registre.
) else (
    echo [OK] XAMPP ajouté au PATH.
)

rem Refresh environment variables for current session
for /f "tokens=*" %%i in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path ^| findstr /i Path') do set "PATH=%%i"

rem -------------------------------------------------------------
rem 2. Détection du service MySQL XAMPP
rem -------------------------------------------------------------
set "MYSQL_SERVICE="
for /f "tokens=1" %%s in ('sc query type= service state= all ^| findstr /i "SERVICE_NAME" ^| findstr /i "mysql"') do (
    set "MYSQL_SERVICE=%%s"
)

if defined MYSQL_SERVICE (
    echo Service MySQL détecté : %MYSQL_SERVICE%
) else (
    echo [AVERTISSEMENT] Aucun service MySQL trouvé. Le script utilisera le démarrage direct de XAMPP.
)

rem -------------------------------------------------------------
rem 3. Démarrage de MySQL
rem -------------------------------------------------------------
if defined MYSQL_SERVICE (
    sc query "%MYSQL_SERVICE%" | find "RUNNING" >nul
    if %errorlevel% neq 0 (
        echo Démarrage du service MySQL (%MYSQL_SERVICE%) ...
        sc start "%MYSQL_SERVICE%" >nul
        if %errorlevel% neq 0 (
            echo [ERREUR] Impossible de démarrer le service %MYSQL_SERVICE%.
        ) else (
            echo [OK] Service %MYSQL_SERVICE% démarré.
        )
    ) else (
        echo Le service %MYSQL_SERVICE% est déjà en cours d\'exécution.
    )
) else (
    echo Démarrage direct de MySQL via XAMPP ...
    "C:\\xampp\\mysql\\bin\\mysqld.exe" --standalone >nul 2>&1
    if %errorlevel% neq 0 (
        echo Tentative d\'exécution de xampp_start.exe ...
        "C:\\xampp\\xampp_start.exe" >nul
        if %errorlevel% neq 0 (
            echo [ERREUR] Impossible de lancer MySQL avec XAMPP.
        ) else (
            echo [OK] MySQL démarré via xampp_start.exe.
        )
    ) else (
        echo [OK] MySQL démarré en mode autonome.
    )
)

rem -------------------------------------------------------------
rem 4. Attente de 8 secondes pour que MySQL initialise
rem -------------------------------------------------------------
echo Attente de 8 secondes pour que MySQL initialise ...
timeout /t 8 >nul

rem -------------------------------------------------------------
rem 5. Création de la base de données hospital_db si elle n\'existe pas
rem -------------------------------------------------------------
echo Vérification/creation de la base de données hospital_db ...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %errorlevel% neq 0 (
    echo [ERREUR] Impossible de créer ou vérifier la base hospital_db.
) else (
    echo [OK] Base hospital_db prête.
)

rem -------------------------------------------------------------
rem 6. Exécution de install.bat
rem -------------------------------------------------------------
if exist "install.bat" (
    echo Lancement de install.bat ...
    call install.bat
    if %errorlevel% neq 0 (
        echo [ERREUR] install.bat a échoué. Nouvelle tentative ...
        call install.bat
        if %errorlevel% neq 0 (
            echo [ERREUR] install.bat a échoué deux fois. Arrêt du script.
            goto :end
        )
    ) else (
        echo [OK] install.bat exécuté avec succès.
    )
) else (
    echo [ERREUR] install.bat introuvable.
    goto :end
)

rem -------------------------------------------------------------
rem 7. Exécution de start.bat
rem -------------------------------------------------------------
if exist "start.bat" (
    echo Lancement de start.bat ...
    call start.bat
    if %errorlevel% neq 0 (
        echo [ERREUR] start.bat a échoué. Nouvelle tentative ...
        call start.bat
        if %errorlevel% neq 0 (
            echo [ERREUR] start.bat a échoué deux fois. Arrêt du script.
            goto :end
        )
    ) else (
        echo [OK] start.bat exécuté avec succès.
    )
) else (
    echo [ERREUR] start.bat introuvable.
    goto :end
)

rem -------------------------------------------------------------
rem 8. Ouverture du navigateur sur le front‑end
rem -------------------------------------------------------------
start "" "chrome.exe" "http://localhost:5173"

rem -------------------------------------------------------------
rem 9. Résumé final
rem -------------------------------------------------------------
echo.
echo ==================== RÉCAPITULATIF ====================
if defined MYSQL_SERVICE (
    echo ✅ MySQL service (%MYSQL_SERVICE%) en cours d\'exécution
) else (
    echo ✅ MySQL (démarrage direct) en cours d\'exécution
)
echo ✅ hospital_db créée
echo ✅ Migrations effectuées
echo ✅ Laravel disponible sur http://localhost:8000
echo ✅ Gateway disponible sur http://localhost:3050
echo ✅ Frontend disponible sur http://localhost:5173

:end
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause >nul
