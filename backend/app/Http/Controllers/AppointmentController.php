<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    use ApiResponse;

    /**
     * Affiche la liste des rendez-vous.
     * Les médecins voient leur planning.
     * Les patients voient leurs rendez-vous à venir.
     * Les secrétaires/admins voient tout.
     * Accessible aux rôles : admin, medecin, secretaire, patient.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('view-any-appointments')) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $user = auth()->user();
        $query = Appointment::query()->with(['patient.user', 'doctor']);

        // Filtrage automatique selon le rôle connecté
        if ($user->role) {
            if ($user->role->slug === 'medecin') {
                $query->where('doctor_id', $user->id);
            } elseif ($user->role->slug === 'patient') {
                $query->whereHas('patient', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            }
        }

        // Filtre additionnel par médecin ou date
        if ($request->has('doctor_id') && $user->role && $user->role->slug !== 'medecin') {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->has('date')) {
            $query->whereDate('date_heure', $request->date);
        }

        $perPage = $request->get('per_page', 15);
        $appointments = $query->orderBy('date_heure', 'asc')->paginate($perPage);

        return $this->successResponse([
            'appointments' => $appointments->items(),
            'pagination' => [
                'total' => $appointments->total(),
                'count' => $appointments->count(),
                'per_page' => $appointments->perPage(),
                'current_page' => $appointments->currentPage(),
                'total_pages' => $appointments->lastPage()
            ]
        ], 'Rendez-vous récupérés avec succès', 200);
    }

    /**
     * Enregistre un nouveau rendez-vous après vérification de la disponibilité du médecin.
     * Accessible aux rôles : admin, secretaire, patient (pour lui-même).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        if (!Gate::allows('create-appointments')) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id', // S'assurer que le doctor_id est bien lié à un médecin
            'date_heure' => 'required|date|after:now',
            'motif' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Erreur de validation', 422, $validator->errors()->toArray());
        }

        $dateHeure = Carbon::parse($request->date_heure);
        $doctorId = $request->doctor_id;

        // Règle métier : Vérification de la disponibilité du médecin sur un créneau de 30 minutes
        $startTime = $dateHeure->copy()->subMinutes(29);
        $endTime = $dateHeure->copy()->addMinutes(29);

        $hasConflict = Appointment::where('doctor_id', $doctorId)
            ->whereBetween('date_heure', [$startTime, $endTime])
            ->where('status', '!=', 'Annulé')
            ->exists();

        if ($hasConflict) {
            return $this->errorResponse(
                'Le médecin n\'est pas disponible à cet horaire (conflit de créneau). Veuillez choisir une autre heure.',
                422,
                ['date_heure' => ['Ce créneau horaire chevauche un autre rendez-vous existant.']]
            );
        }

        $appointment = Appointment::create([
            'patient_id' => $request->patient_id,
            'doctor_id' => $doctorId,
            'date_heure' => $request->date_heure,
            'status' => 'Planifié',
            'motif' => $request->motif,
            'notes' => $request->notes,
        ]);

        return $this->successResponse(
            $appointment->load(['patient.user', 'doctor']),
            'Rendez-vous planifié avec succès',
            201
        );
    }

    /**
     * Affiche les détails d'un rendez-vous spécifique.
     * Accessible au patient concerné, au médecin concerné, à la secrétaire ou à l'admin.
     *
     * @param Appointment $appointment
     * @return JsonResponse
     */
    public function show(Appointment $appointment): JsonResponse
    {
        if (!Gate::allows('view-appointment', $appointment)) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $appointment->load(['patient.user', 'doctor']);
        return $this->successResponse($appointment, 'Détails du rendez-vous récupérés', 200);
    }

    /**
     * Met à jour un rendez-vous (déplacement d'horaire, changement de statut, notes).
     * En cas de déplacement, la disponibilité est à nouveau vérifiée.
     * Accessible aux rôles : admin, secretaire, medecin (pour modifier les notes/statuts), patient (pour annuler).
     *
     * @param Request $request
     * @param Appointment $appointment
     * @return JsonResponse
     */
    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        if (!Gate::allows('update-appointment', $appointment)) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $validator = Validator::make($request->all(), [
            'doctor_id' => 'sometimes|required|exists:users,id',
            'date_heure' => 'sometimes|required|date|after:now',
            'status' => 'sometimes|required|in:Planifié,Confirmé,Annulé,Honoré,Non Honoré',
            'motif' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Erreur de validation', 422, $validator->errors()->toArray());
        }

        $doctorId = $request->get('doctor_id', $appointment->doctor_id);
        $dateHeureRaw = $request->get('date_heure', $appointment->date_heure);

        // Si le médecin ou la date_heure changent, on vérifie la disponibilité
        if ($doctorId != $appointment->doctor_id || $dateHeureRaw != $appointment->date_heure) {
            $dateHeure = Carbon::parse($dateHeureRaw);
            $startTime = $dateHeure->copy()->subMinutes(29);
            $endTime = $dateHeure->copy()->addMinutes(29);

            // Exclure le rendez-vous en cours d'édition de la détection de conflit
            $hasConflict = Appointment::where('doctor_id', $doctorId)
                ->where('id', '!=', $appointment->id)
                ->whereBetween('date_heure', [$startTime, $endTime])
                ->where('status', '!=', 'Annulé')
                ->exists();

            if ($hasConflict) {
                return $this->errorResponse(
                    'Le médecin n\'est pas disponible pour ce nouvel horaire.',
                    422,
                    ['date_heure' => ['Le nouvel horaire choisi est en conflit avec un autre rendez-vous.']]
                );
            }
        }

        $appointment->update($request->all());

        return $this->successResponse(
            $appointment->load(['patient.user', 'doctor']),
            'Rendez-vous mis à jour avec succès',
            200
        );
    }

    /**
     * Supprime un rendez-vous (suppression définitive).
     * Accessible aux rôles : admin uniquement (les patients/secrétaires doivent passer par le statut 'Annulé').
     *
     * @param Appointment $appointment
     * @return JsonResponse
     */
    public function destroy(Appointment $appointment): JsonResponse
    {
        if (!Gate::allows('delete-appointments')) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $appointment->delete();

        return $this->successResponse(null, 'Rendez-vous supprimé définitivement', 200);
    }

    /**
     * Retourne les créneaux disponibles pour un médecin donné et une date.
     * Créneaux de 30 minutes entre 08:00 et 18:00.
     *
     * @param int $doctorId
     * @param string $date (YYYY-MM-DD)
     * @return JsonResponse
     */
    public function slots($doctorId, $date): JsonResponse
    {
        if (!auth()->check()) {
            return $this->errorResponse('Non authentifié', 401);
        }

        try {
            $base = Carbon::parse($date)->setTime(8, 0, 0);
        } catch (\Exception $e) {
            return $this->errorResponse('Date invalide', 422);
        }

        $end = Carbon::parse($date)->setTime(18, 0, 0);
        $slots = [];

        for ($time = $base->copy(); $time->lt($end); $time->addMinutes(30)) {
            $slotStart = $time->copy();
            $slotEnd = $time->copy()->addMinutes(30);

            $conflictStart = $slotStart->copy()->subMinutes(29);
            $conflictEnd = $slotStart->copy()->addMinutes(29);

            $existing = Appointment::where('doctor_id', $doctorId)
                ->whereBetween('date_heure', [$conflictStart, $conflictEnd])
                ->where('status', '!=', 'Annulé')
                ->first();

            $slots[] = [
                'time' => $slotStart->format('H:i'),
                'datetime' => $slotStart->toDateTimeString(),
                'available' => $existing ? false : true,
                'appointment' => $existing ? $existing->load(['patient.user']) : null,
            ];
        }

        return $this->successResponse(['slots' => $slots], 'Créneaux récupérés', 200);
    }

    /**
     * Confirme un rendez-vous.
     */
    public function confirm(Appointment $appointment): JsonResponse
    {
        if (!Gate::allows('update-appointment', $appointment)) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $appointment->update(['status' => 'Confirmé']);
        return $this->successResponse($appointment->load(['patient.user', 'doctor']), 'Rendez-vous confirmé', 200);
    }

    /**
     * Annule un rendez-vous.
     */
    public function cancel(Appointment $appointment): JsonResponse
    {
        if (!Gate::allows('update-appointment', $appointment)) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $appointment->update(['status' => 'Annulé']);
        return $this->successResponse($appointment->load(['patient.user', 'doctor']), 'Rendez-vous annulé', 200);
    }

    /**
     * Marque un rendez-vous comme complété/honoré.
     */
    public function complete(Appointment $appointment): JsonResponse
    {
        if (!Gate::allows('update-appointment', $appointment)) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $appointment->update(['status' => 'Honoré']);
        return $this->successResponse($appointment->load(['patient.user', 'doctor']), 'Rendez-vous marqué comme honoré', 200);
    }

    /**
     * Agenda du jour pour l'utilisateur connecté (ou tout si droits admin/secretaire).
     */
    public function today(Request $request): JsonResponse
    {
        if (!auth()->check()) {
            return $this->errorResponse('Non authentifié', 401);
        }

        $user = auth()->user();
        $query = Appointment::with(['patient.user', 'doctor'])->whereDate('date_heure', Carbon::today());

        if ($user->role) {
            if ($user->role->slug === 'medecin') {
                $query->where('doctor_id', $user->id);
            } elseif ($user->role->slug === 'patient') {
                $query->whereHas('patient', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            }
        }

        $appointments = $query->orderBy('date_heure')->get();
        return $this->successResponse(['appointments' => $appointments], 'Agenda du jour', 200);
    }

    /**
     * Prochains 7 jours.
     */
    public function upcoming(Request $request): JsonResponse
    {
        if (!auth()->check()) {
            return $this->errorResponse('Non authentifié', 401);
        }

        $user = auth()->user();
        $from = Carbon::today();
        $to = Carbon::today()->addDays(7)->endOfDay();

        $query = Appointment::with(['patient.user', 'doctor'])->whereBetween('date_heure', [$from, $to]);

        if ($user->role) {
            if ($user->role->slug === 'medecin') {
                $query->where('doctor_id', $user->id);
            } elseif ($user->role->slug === 'patient') {
                $query->whereHas('patient', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            }
        }

        $appointments = $query->orderBy('date_heure')->get();
        return $this->successResponse(['appointments' => $appointments], 'Prochains rendez-vous', 200);
    }

    /**
     * Liste des rendez-vous nécessitant un rappel (rappel_envoyé = false) dans les prochaines 24h.
     */
    public function pendingReminders(): JsonResponse
    {
        if (!Gate::allows('view-any-appointments')) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $start = Carbon::now()->addDay()->startOfDay();
        $end = Carbon::now()->addDay()->endOfDay();

        $appointments = Appointment::with(['patient.user', 'doctor'])
            ->whereBetween('date_heure', [$start, $end])
            ->where('rappel_envoye', false)
            ->where('status', '!=', 'Annulé')
            ->orderBy('date_heure')
            ->get();

        return $this->successResponse(['appointments' => $appointments], 'Rendez-vous en attente de rappel', 200);
    }
}
