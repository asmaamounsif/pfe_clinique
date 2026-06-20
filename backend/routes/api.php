<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Ici se trouvent les routes de l'API de notre système d'information.
| Elles sont toutes préfixées automatiquement par "/api".
|
*/

// =========================================================================
// 1. ROUTES PUBLIQUES (AUTHENTIFICATION)
// =========================================================================
Route::get('/health', function () {
    return response()->json(['status' => 'OK']);
});
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// =========================================================================
// 2. ROUTES SÉCURISÉES (AUTHENTIFIÉES VIA SANCTUM)
// =========================================================================
Route::middleware('auth:sanctum')->group(function () {

    // Profil personnel & déconnexion
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // =========================================================================
    // A. GROUPE ADMIN : Contrôle total sur l'ensemble de la plateforme
    // =========================================================================
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Empty role group
    });

    // =========================================================================
    // B. GROUPE MÉDECIN : Prise en charge clinique et dossiers
    // =========================================================================
    Route::middleware('role:medecin')->prefix('medecin')->group(function () {
        // Empty role group
    });

    // =========================================================================
    // C. GROUPE SECRÉTAIRE : Accueil, enregistrement et planification
    // =========================================================================
    Route::middleware('role:secretaire')->prefix('secretaire')->group(function () {
        // Empty role group
    });

    // =========================================================================
    // D. GROUPE PATIENT : Consultation personnelle de son espace en ligne
    // =========================================================================
    Route::middleware('role:patient')->prefix('patient')->group(function () {
        // Empty role group
    });

    // =========================================================================
    // E. GROUPE INFIRMIER : Lecture des dossiers & rendez-vous pour les soins
    // =========================================================================
    Route::middleware('role:infirmier')->prefix('infirmier')->group(function () {
        // Empty role group
    });

});
