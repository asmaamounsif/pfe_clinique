<?php

namespace Database\Factories;

use App\Models\Prescription;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Prescription>
 */
class PrescriptionFactory extends Factory
{
    protected $model = Prescription::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'consultation_id' => Consultation::factory(),
            'patient_id' => Patient::factory(),
            'doctor_id' => User::factory(),
            'date_prescription' => $this->faker->date('Y-m-d', 'now'),
            'status' => $this->faker->randomElement(['Active', 'Terminée', 'Annulée']),
            'content' => $this->faker->randomElement([
                "Doliprane 1g: 1 comprimé toutes les 6 heures en cas de douleur (max 4/jour) pendant 5 jours.\nAmoxicilline 1g: 1 comprimé matin et soir pendant 6 jours.",
                "Kardegic 75mg: 1 sachet par jour au milieu du déjeuner (à vie).\nCoversyl 5mg: 1 comprimé le matin.",
                "Ventoline 100µg: 1 à 2 inhalations en cas de crise de dyspnée ou sifflement, à renouveler si besoin.",
                "Inexium 40mg: 1 comprimé le soir avant le repas pendant 4 semaines.",
            ]),
        ];
    }

    /**
     * Ordonnance rédigée hors consultation.
     */
    public function withoutConsultation(): static
    {
        return $this->state(fn (array $attributes) => [
            'consultation_id' => null,
        ]);
    }
}
