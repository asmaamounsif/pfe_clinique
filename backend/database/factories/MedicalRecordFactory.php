<?php

namespace Database\Factories;

use App\Models\MedicalRecord;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MedicalRecord>
 */
class MedicalRecordFactory extends Factory
{
    protected $model = MedicalRecord::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'allergies' => $this->faker->randomElement([
                'Pénicilline, pollens de graminées',
                'Aucune allergie connue',
                'Fruits à coque, venin de guêpe',
                'Aspirine, acariens',
            ]),
            'medical_history' => $this->faker->paragraph(2), // Antécédents médicaux
            'family_history' => $this->faker->sentence(),    // Antécédents familiaux
            'current_treatments' => $this->faker->randomElement([
                'Paracétamol 1g si douleur',
                'Aucun traitement en cours',
                'Lévothyrox 75µg/jour',
                'Ventoline en cas de crise d\'asthme',
            ]),
        ];
    }
}
