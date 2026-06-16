<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class ConsultationController extends Controller
{
    use ApiResponse;

    /**
     * Affiche la liste des consultations.
     * Pour les médecins : liste de leurs consultations.
     * Pour les administrateurs : liste globale.
     * Accessible aux rôles : admin, medecin.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('view-any-consultations')) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $user = auth()->user();
        $query = Consultation::query()->with(['patient.user', 'doctor']);

        // Filtrage : les médecins ne voient que leurs propres consultations par défaut
        if ($user->role && $user->role->slug === 'medecin') {
            $query->where('doctor_id', $user->id);
        }

        // Filtre additionnel par patient
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        $perPage = $request->get('per_page', 10);
        $consultations = $query->latest('date_consultation')->paginate($perPage);

        return $this->successResponse([
            'consultations' => $consultations->items(),
            'pagination' => [
                'total' => $consultations->total(),
                'count' => $consultations->count(),
                'per_page' => $consultations->perPage(),
                'current_page' => $consultations->currentPage(),
                'total_pages' => $consultations->lastPage()
            ]
        ], 'Consultations récupérées avec succès', 200);
    }

    /**
     * Enregistre une nouvelle consultation (créée par le médecin connecté).
     * Accessible aux rôles : admin, medecin.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        if (!Gate::allows('create-consultations')) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'date_consultation' => 'required|date',
            'motif' => 'required|string|max:255',
            'symptoms' => 'nullable|string',
            'diagnostic' => 'nullable|string',
            'observations' => 'nullable|string',
            'tarif' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Erreur de validation', 422, $validator->errors()->toArray());
        }

        $consultation = Consultation::create([
            'patient_id' => $request->patient_id,
            'doctor_id' => auth()->id(), // Le médecin connecté est l'auteur
            'date_consultation' => $request->date_consultation,
            'motif' => $request->motif,
            'symptoms' => $request->symptoms,
            'diagnostic' => $request->diagnostic,
            'observations' => $request->observations,
            'tarif' => $request->tarif,
        ]);

        return $this->successResponse(
            $consultation->load(['patient.user', 'doctor']),
            'Consultation enregistrée avec succès',
            201
        );
    }

    /**
     * Affiche les détails d'une consultation spécifique.
     * Accessible au médecin traitant, à l'admin, ou au patient concerné.
     *
     * @param Consultation $consultation
     * @return JsonResponse
     */
    public function show(Consultation $consultation): JsonResponse
    {
        if (!Gate::allows('view-consultation', $consultation)) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $consultation->load(['patient.user', 'doctor', 'prescriptions', 'examResults']);
        return $this->successResponse($consultation, 'Détails de la consultation récupérés', 200);
    }

    /**
     * Met à jour une consultation existante.
     * Uniquement modifiable par le médecin qui l'a créée ou un administrateur.
     *
     * @param Request $request
     * @param Consultation $consultation
     * @return JsonResponse
     */
    public function update(Request $request, Consultation $consultation): JsonResponse
    {
        if (!Gate::allows('update-consultation', $consultation)) {
            return $this->errorResponse('Action non autorisée, vous devez être le médecin auteur.', 403);
        }

        $validator = Validator::make($request->all(), [
            'date_consultation' => 'sometimes|required|date',
            'motif' => 'sometimes|required|string|max:255',
            'symptoms' => 'nullable|string',
            'diagnostic' => 'nullable|string',
            'observations' => 'nullable|string',
            'tarif' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Erreur de validation', 422, $validator->errors()->toArray());
        }

        $consultation->update($request->all());

        return $this->successResponse(
            $consultation->load(['patient.user', 'doctor']),
            'Consultation mise à jour avec succès',
            200
        );
    }

    /**
     * Supprime une consultation.
     * Accessible aux rôles : admin uniquement.
     *
     * @param Consultation $consultation
     * @return JsonResponse
     */
    public function destroy(Consultation $consultation): JsonResponse
    {
        if (!Gate::allows('delete-consultations')) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $consultation->delete();

        return $this->successResponse(null, 'Consultation supprimée avec succès', 200);
    }
}
