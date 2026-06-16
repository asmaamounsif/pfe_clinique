<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
{
    /**
     * Transforme la ressource en tableau.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'social_security_number' => $this->social_security_number,
            'date_of_birth' => $this->date_of_birth ? $this->date_of_birth->format('Y-m-d') : null,
            'gender' => $this->gender,
            'address' => $this->address,
            'phone' => $this->phone,
            'blood_type' => $this->blood_type,
            'emergency_contact' => [
                'name' => $this->emergency_contact_name,
                'phone' => $this->emergency_contact_phone,
            ],
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'first_name' => $this->user->first_name,
                    'last_name' => $this->user->last_name,
                    'email' => $this->user->email,
                    'phone' => $this->user->phone,
                ];
            }),
            'medical_record' => $this->whenLoaded('medicalRecord', function () {
                return [
                    'id' => $this->medicalRecord->id,
                    'allergies' => $this->medicalRecord->allergies,
                    'medical_history' => $this->medicalRecord->medical_history,
                    'family_history' => $this->medicalRecord->family_history,
                    'current_treatments' => $this->medicalRecord->current_treatments,
                ];
            }),
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toIso8601String() : null,
        ];
    }
}
