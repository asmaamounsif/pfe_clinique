<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\Consultation;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class PrescriptionController extends Controller
{
    use ApiResponse;

    /**
     * Affiche la liste des prescriptions.
     * Pour les médecins : liste de leurs ordonnances émises.
     * Pour les patients : liste de leurs ordonnances reçues.
     * Accessible aux rôles : admin, medecin, patient.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('view-any-prescriptions')) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $user = auth()->user();
        $query = Prescription::query()->with(['patient.user', 'doctor', 'consultation']);

        // Filtrage en fonction des rôles
        if ($user->role) {
            if ($user->role->slug === 'medecin') {
                $query->where('doctor_id', $user->id);
            } elseif ($user->role->slug === 'patient') {
                // Un patient connecté ne peut voir que ses propres ordonnances
                $query->whereHas('patient', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            }
        }

        // Filtre additionnel par patient pour les médecins/admins
        if ($request->has('patient_id') && $user->role && $user->role->slug !== 'patient') {
            $query->where('patient_id', $request->patient_id);
        }

        $perPage = $request->get('per_page', 10);
        $prescriptions = $query->latest('date_prescription')->paginate($perPage);

        return $this->successResponse([
            'prescriptions' => $prescriptions->items(),
            'pagination' => [
                'total' => $prescriptions->total(),
                'count' => $prescriptions->count(),
                'per_page' => $prescriptions->perPage(),
                'current_page' => $prescriptions->currentPage(),
                'total_pages' => $prescriptions->lastPage()
            ]
        ], 'Prescriptions récupérées avec succès', 200);
    }

    /**
     * Enregistre une nouvelle prescription (ordonnance).
     * Accessible aux rôles : admin, medecin.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        if (!Gate::allows('create-prescriptions')) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $validator = Validator::make($request->all(), [
            'consultation_id' => 'nullable|exists:consultations,id',
            'patient_id' => 'required|exists:patients,id',
            'date_prescription' => 'required|date',
            'status' => 'required|in:Active,Terminée,Annulée',
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Erreur de validation', 422, $validator->errors()->toArray());
        }

        // Règle métier : validation de la cohérence si consultation_id est fourni
        if ($request->filled('consultation_id')) {
            $consultation = Consultation::find($request->consultation_id);
            if ($consultation && $consultation->patient_id != $request->patient_id) {
                return $this->errorResponse(
                    'Incohérence : le patient sélectionné ne correspond pas au patient lié à la consultation.',
                    422,
                    ['patient_id' => ['Le patient ne correspond pas à celui de la consultation.']]
                );
            }
        }

        $prescription = Prescription::create([
            'consultation_id' => $request->consultation_id,
            'patient_id' => $request->patient_id,
            'doctor_id' => auth()->id(), // Le médecin connecté est l'émetteur
            'date_prescription' => $request->date_prescription,
            'status' => $request->status,
            'content' => $request->content,
        ]);

        return $this->successResponse(
            $prescription->load(['patient.user', 'doctor', 'consultation']),
            'Ordonnance prescrite avec succès',
            201
        );
    }

    /**
     * Affiche les détails d'une prescription spécifique.
     * Accessible au médecin émetteur, à l'admin, ou au patient concerné.
     *
     * @param Prescription $prescription
     * @return JsonResponse
     */
    public function show(Prescription $prescription): JsonResponse
    {
        if (!Gate::allows('view-prescription', $prescription)) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $prescription->load(['patient.user', 'doctor', 'consultation']);
        return $this->successResponse($prescription, 'Détails de la prescription récupérés', 200);
    }

    /**
     * Met à jour les détails d'une prescription.
     * Uniquement modifiable par le médecin qui l'a créée ou un administrateur.
     *
     * @param Request $request
     * @param Prescription $prescription
     * @return JsonResponse
     */
    public function update(Request $request, Prescription $prescription): JsonResponse
    {
        if (!Gate::allows('update-prescription', $prescription)) {
            return $this->errorResponse('Action non autorisée, vous devez être le médecin auteur.', 403);
        }

        $validator = Validator::make($request->all(), [
            'consultation_id' => 'nullable|exists:consultations,id',
            'date_prescription' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:Active,Terminée,Annulée',
            'content' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Erreur de validation', 422, $validator->errors()->toArray());
        }

        // Règle métier : validation de la cohérence si consultation_id est modifié
        if ($request->filled('consultation_id')) {
            $consultation = Consultation::find($request->consultation_id);
            if ($consultation && $consultation->patient_id != $prescription->patient_id) {
                return $this->errorResponse(
                    'Incohérence : le patient de l\'ordonnance ne correspond pas au patient lié à la nouvelle consultation.',
                    422
                );
            }
        }

        $prescription->update($request->all());

        return $this->successResponse(
            $prescription->load(['patient.user', 'doctor', 'consultation']),
            'Ordonnance mise à jour avec succès',
            200
        );
    }

    /**
     * Supprime une prescription.
     * Accessible aux rôles : admin uniquement.
     *
     * @param Prescription $prescription
     * @return JsonResponse
     */
    public function destroy(Prescription $prescription): JsonResponse
    {
        if (!Gate::allows('delete-prescriptions')) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $prescription->delete();

        return $this->successResponse(null, 'Ordonnance supprimée avec succès', 200);
    }
}
