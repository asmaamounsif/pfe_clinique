<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PatientRequest extends FormRequest
{
    /**
     * Détermine si l'utilisateur est autorisé à faire cette requête.
     */
    public function authorize(): bool
    {
        // Autorisé par défaut, les contrôles d'autorisation d'accès fins (RBAC) se font au niveau du contrôleur
        return true;
    }

    /**
     * Règles de validation appliquées à la requête.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Récupère l'ID du patient de la route s'il est présent (mise à jour)
        $patient = $this->route('patient');
        $patientId = $patient ? (is_object($patient) ? $patient->id : $patient) : null;

        return [
            'user_id' => 'nullable|integer|unique:patients,user_id,' . $patientId . '|exists:users,id',
            'social_security_number' => 'required|string|max:30|unique:patients,social_security_number,' . $patientId,
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:M,F,Autre',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:30',
            'blood_type' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:30',
        ];
    }

    /**
     * Messages de validation personnalisés en français.
     */
    public function messages(): array
    {
        return [
            'social_security_number.required' => 'Le numéro de sécurité sociale est obligatoire.',
            'social_security_number.unique' => 'Ce numéro de sécurité sociale est déjà enregistré.',
            'date_of_birth.required' => 'La date de naissance est obligatoire.',
            'date_of_birth.before' => 'La date de naissance doit être dans le passé.',
            'gender.required' => 'Le genre est obligatoire.',
            'gender.in' => 'Le genre doit être M, F, ou Autre.',
            'blood_type.in' => 'Le groupe sanguin est invalide.',
            'user_id.unique' => 'Cet utilisateur est déjà associé à un autre profil patient.',
            'user_id.exists' => 'L\'utilisateur spécifié n\'existe pas.',
        ];
    }
}
