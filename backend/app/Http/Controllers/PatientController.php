<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\MedicalRecord;
use App\Http\Requests\PatientRequest;
use App\Http\Resources\PatientResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    use ApiResponse;

    /**
     * Liste paginée des patients avec recherche multicritère (nom, prénom, numéro de sécurité sociale).
     * Accessible aux rôles : admin, medecin, secretaire, infirmier.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Contrôle d'accès RBAC
        if (!Gate::allows('view-any-patients')) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $query = Patient::query()->with(['user', 'medicalRecord']);

        // Recherche multicritère
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('social_security_number', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('first_name', 'like', "%{$search}%")
                         ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        // Pagination dynamique (par défaut 10 éléments)
        $perPage = $request->get('per_page', 10);
        $patients = $query->paginate($perPage);

        return $this->successResponse([
            'patients' => PatientResource::collection($patients),
            'pagination' => [
                'total' => $patients->total(),
                'count' => $patients->count(),
                'per_page' => $patients->perPage(),
                'current_page' => $patients->currentPage(),
                'total_pages' => $patients->lastPage()
            ]
        ], 'Liste des patients récupérée avec succès', 200);
    }

    /**
     * Enregistrement d'un nouveau patient (crée aussi son dossier médical vide).
     * Accessible aux rôles : admin, secretaire.
     *
     * @param PatientRequest $request
     * @return JsonResponse
     */
    public function store(PatientRequest $request): JsonResponse
    {
        if (!Gate::allows('create-patients')) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        // Utilisation d'une transaction de base de données pour assurer l'intégrité
        DB::beginTransaction();
        try {
            // Création du patient
            $patient = Patient::create($request->validated());

            // Initialisation automatique du dossier médical One-to-One
            MedicalRecord::create([
                'patient_id' => $patient->id,
                'allergies' => 'Aucune connue',
                'medical_history' => null,
                'family_history' => null,
                'current_treatments' => null
            ]);

            DB::commit();

            return $this->successResponse(
                new PatientResource($patient->load(['user', 'medicalRecord'])),
                'Patient créé et dossier médical initialisé avec succès',
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Erreur lors de la création du patient', 500, ['exception' => $e->getMessage()]);
        }
    }

    /**
     * Affiche les détails d'un patient.
     * Accessible aux rôles : admin, medecin, secretaire, infirmier, ou au patient lui-même s'il est lié.
     *
     * @param Patient $patient
     * @return JsonResponse
     */
    public function show(Patient $patient): JsonResponse
    {
        if (!Gate::allows('view-patient', $patient)) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $patient->load(['user', 'medicalRecord']);
        return $this->successResponse(new PatientResource($patient), 'Détails du patient récupérés', 200);
    }

    /**
     * Met à jour les informations d'un patient.
     * Accessible aux rôles : admin, secretaire, ou au patient lui-même s'il est lié.
     *
     * @param PatientRequest $request
     * @param Patient $patient
     * @return JsonResponse
     */
    public function update(PatientRequest $request, Patient $patient): JsonResponse
    {
        if (!Gate::allows('update-patient', $patient)) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $patient->update($request->validated());

        return $this->successResponse(
            new PatientResource($patient->load(['user', 'medicalRecord'])),
            'Informations du patient mises à jour avec succès',
            200
        );
    }

    /**
     * Supprime un patient (suppression en cascade vers dossier médical, consultations, etc. via BDD).
     * Accessible aux rôles : admin uniquement.
     *
     * @param Patient $patient
     * @return JsonResponse
     */
    public function destroy(Patient $patient): JsonResponse
    {
        if (!Gate::allows('delete-patients')) {
            return $this->errorResponse('Action non autorisée', 403);
        }

        $patient->delete();

        return $this->successResponse(null, 'Patient supprimé avec succès', 200); // 200 avec message JSON
    }
}
