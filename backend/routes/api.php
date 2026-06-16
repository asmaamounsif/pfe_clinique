<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\AppointmentController;

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
        Route::apiResource('patients', PatientController::class);
        Route::apiResource('consultations', ConsultationController::class);
        Route::apiResource('prescriptions', PrescriptionController::class);
        Route::apiResource('appointments', AppointmentController::class);
        
        // Statistiques administratives et cliniques globales
        Route::get('/stats', function () {
            return response()->json([
                'success' => true,
                'data' => [
                    'total_patients' => \App\Models\Patient::count(),
                    'total_consultations' => \App\Models\Consultation::count(),
                    'average_wait_time' => 23,
                    'active_doctors' => \App\Models\User::whereHas('role', function ($q) { $q->where('slug', 'medecin'); })->where('is_active', true)->count(),
                    'total_prescriptions' => \App\Models\Prescription::count(),
                    'emergency_cases' => 2
                ]
            ]);
        });

        // Liste globale des utilisateurs / personnel clinique
        Route::get('/users', function () {
            return response()->json([
                'success' => true,
                'data' => \App\Models\User::with('role')->get()
            ]);
        });

        // Consultation spécifique des logs d'audit (réservé aux admins)
        Route::get('/audit-logs', function () {
            return response()->json([
                'success' => true,
                'data' => \App\Models\AuditLog::with('user')->latest()->paginate(20)
            ]);
        });
    });

    // =========================================================================
    // B. GROUPE MÉDECIN : Prise en charge clinique et dossiers
    // =========================================================================
    Route::middleware('role:medecin')->prefix('medecin')->group(function () {
        // Patients : Lecture seule et recherche
        Route::get('/patients', [PatientController::class, 'index']);
        Route::get('/patients/{patient}', [PatientController::class, 'show']);

        // Consultations : CRUD complet (limité à son nom dans le contrôleur)
        Route::apiResource('consultations', ConsultationController::class)->except(['destroy']);

        // Prescriptions : CRUD complet (associées aux consultations/patients)
        Route::apiResource('prescriptions', PrescriptionController::class)->except(['destroy']);

        // Rendez-vous : Consulter son planning et mettre à jour le statut/notes
        Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::get('/appointments/{appointment}', [AppointmentController::class, 'show']);
        Route::put('/appointments/{appointment}', [AppointmentController::class, 'update']); // ex: Honoré, Non Honoré
    });

    // =========================================================================
    // C. GROUPE SECRÉTAIRE : Accueil, enregistrement et planification
    // =========================================================================
    Route::middleware('role:secretaire')->prefix('secretaire')->group(function () {
        // Patients : Création et modification, lecture paginée
        Route::get('/patients', [PatientController::class, 'index']);
        Route::get('/patients/{patient}', [PatientController::class, 'show']);
        Route::post('/patients', [PatientController::class, 'store']);
        Route::put('/patients/{patient}', [PatientController::class, 'update']);

        // Rendez-vous : Planification (création) et suivi
        Route::apiResource('appointments', AppointmentController::class)->except(['destroy']);

        // Médecins : Liste pour la planification
        Route::get('/doctors', function () {
            $doctors = \App\Models\User::whereHas('role', function ($q) {
                $q->where('slug', 'medecin');
            })->where('is_active', true)->get();
            return response()->json([
                'success' => true,
                'data' => $doctors
            ]);
        });
    });

    // =========================================================================
    // D. GROUPE PATIENT : Consultation personnelle de son espace en ligne
    // =========================================================================
    Route::middleware('role:patient')->prefix('patient')->group(function () {
        // Voir sa propre fiche patient (les politiques interdisent de voir autrui)
        Route::get('/profile/{patient}', [PatientController::class, 'show']);
        Route::put('/profile/{patient}', [PatientController::class, 'update']); // Mettre à jour son adresse/téléphone

        // Ordonnances : Consulter ses ordonnances reçues
        Route::get('/prescriptions', [PrescriptionController::class, 'index']);
        Route::get('/prescriptions/{prescription}', [PrescriptionController::class, 'show']);

        // Rendez-vous : Consulter ses rendez-vous et possibilité d'annuler
        Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::get('/appointments/{appointment}', [AppointmentController::class, 'show']);
        Route::put('/appointments/{appointment}/cancel', function (\App\Models\Appointment $appointment) {
            // Seul le patient concerné peut annuler son RDV
            if (auth()->user()->patient && auth()->user()->patient->id === $appointment->patient_id) {
                $appointment->update(['status' => 'Annulé']);
                return response()->json(['success' => true, 'message' => 'Rendez-vous annulé.']);
            }
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        });
    });

    // =========================================================================
    // E. GROUPE INFIRMIER : Lecture des dossiers & rendez-vous pour les soins
    // =========================================================================
    Route::middleware('role:infirmier')->prefix('infirmier')->group(function () {
        Route::get('/patients', [PatientController::class, 'index']);
        Route::get('/appointments', [AppointmentController::class, 'index']);
    });

    // Routes partagées pour la gestion des rendez-vous (disponibilités, statut, rappels)
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/slots/{doctor}/{date}', [AppointmentController::class, 'slots']);
    Route::get('/appointments/today', [AppointmentController::class, 'today']);
    Route::get('/appointments/upcoming', [AppointmentController::class, 'upcoming']);
    Route::put('/appointments/{appointment}/confirm', [AppointmentController::class, 'confirm']);
    Route::put('/appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);
    Route::put('/appointments/{appointment}/complete', [AppointmentController::class, 'complete']);
    Route::get('/appointments/pending-reminders', [AppointmentController::class, 'pendingReminders']);

});
