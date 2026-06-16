<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Consultation;
use App\Models\Prescription;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     * Defines all authorization Gates for the hospital RBAC system.
     */
    public function boot(): void
    {
        // =========================================================
        // PATIENT GATES
        // =========================================================
        Gate::define('view-any-patients', function ($user) {
            return in_array($user->role?->slug, ['admin', 'medecin', 'secretaire', 'infirmier']);
        });

        Gate::define('view-patient', function ($user, Patient $patient) {
            $role = $user->role?->slug;
            if (in_array($role, ['admin', 'medecin', 'secretaire', 'infirmier'])) return true;
            if ($role === 'patient' && $user->patient?->id === $patient->id) return true;
            return false;
        });

        Gate::define('create-patients', function ($user) {
            return in_array($user->role?->slug, ['admin', 'secretaire']);
        });

        Gate::define('update-patient', function ($user, Patient $patient) {
            $role = $user->role?->slug;
            if (in_array($role, ['admin', 'secretaire'])) return true;
            if ($role === 'patient' && $user->patient?->id === $patient->id) return true;
            return false;
        });

        Gate::define('delete-patients', function ($user) {
            return $user->role?->slug === 'admin';
        });

        // =========================================================
        // APPOINTMENT GATES
        // =========================================================
        Gate::define('view-any-appointments', function ($user) {
            return in_array($user->role?->slug, ['admin', 'medecin', 'secretaire', 'patient', 'infirmier']);
        });

        Gate::define('view-appointment', function ($user, Appointment $appointment) {
            $role = $user->role?->slug;
            if (in_array($role, ['admin', 'secretaire'])) return true;
            if ($role === 'medecin' && $appointment->doctor_id === $user->id) return true;
            if ($role === 'patient' && $appointment->patient?->user_id === $user->id) return true;
            return false;
        });

        Gate::define('create-appointments', function ($user) {
            return in_array($user->role?->slug, ['admin', 'secretaire', 'patient']);
        });

        Gate::define('update-appointment', function ($user, Appointment $appointment) {
            $role = $user->role?->slug;
            if (in_array($role, ['admin', 'secretaire'])) return true;
            if ($role === 'medecin' && $appointment->doctor_id === $user->id) return true;
            if ($role === 'patient' && $appointment->patient?->user_id === $user->id) return true;
            return false;
        });

        Gate::define('delete-appointments', function ($user) {
            return $user->role?->slug === 'admin';
        });

        // =========================================================
        // CONSULTATION GATES
        // =========================================================
        Gate::define('view-any-consultations', function ($user) {
            return in_array($user->role?->slug, ['admin', 'medecin', 'infirmier']);
        });

        Gate::define('view-consultation', function ($user, Consultation $consultation) {
            $role = $user->role?->slug;
            if (in_array($role, ['admin', 'infirmier'])) return true;
            if ($role === 'medecin' && $consultation->doctor_id === $user->id) return true;
            return false;
        });

        Gate::define('create-consultations', function ($user) {
            return in_array($user->role?->slug, ['admin', 'medecin']);
        });

        Gate::define('update-consultation', function ($user, Consultation $consultation) {
            $role = $user->role?->slug;
            if ($role === 'admin') return true;
            if ($role === 'medecin' && $consultation->doctor_id === $user->id) return true;
            return false;
        });

        Gate::define('delete-consultations', function ($user) {
            return $user->role?->slug === 'admin';
        });

        // =========================================================
        // PRESCRIPTION GATES
        // =========================================================
        Gate::define('view-any-prescriptions', function ($user) {
            return in_array($user->role?->slug, ['admin', 'medecin', 'patient', 'infirmier']);
        });

        Gate::define('view-prescription', function ($user, Prescription $prescription) {
            $role = $user->role?->slug;
            if (in_array($role, ['admin', 'infirmier'])) return true;
            if ($role === 'medecin' && $prescription->doctor_id === $user->id) return true;
            if ($role === 'patient' && $prescription->patient?->user_id === $user->id) return true;
            return false;
        });

        Gate::define('create-prescriptions', function ($user) {
            return in_array($user->role?->slug, ['admin', 'medecin']);
        });

        Gate::define('update-prescription', function ($user, Prescription $prescription) {
            $role = $user->role?->slug;
            if ($role === 'admin') return true;
            if ($role === 'medecin' && $prescription->doctor_id === $user->id) return true;
            return false;
        });

        Gate::define('delete-prescriptions', function ($user) {
            return $user->role?->slug === 'admin';
        });
    }
}

