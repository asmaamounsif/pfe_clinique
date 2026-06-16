<?php

namespace Database\Factories;

use App\Models\Consultation;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Consultation>
 */
class ConsultationFactory extends Factory
{
    protected $model = Consultation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'doctor_id' => User::factory(), // Idéalement, un utilisateur avec le rôle médecin
            'date_consultation' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'motif' => $this->faker->randomElement([
                'Consultation de suivi annuel',
                'Fièvre et toux persistante depuis 3 jours',
                'Douleur lombaire aiguë',
                'Renouvellement ordonnance hypertension',
                'Maux de tête réguliers',
            ]),
            'symptoms' => $this->faker->paragraph(1),
            'diagnostic' => $this->faker->sentence(),
            'observations' => $this->faker->paragraph(2),
            'tarif' => $this->faker->randomElement([25.00, 50.00, 75.00, 100.00]),
        ];
    }
}
