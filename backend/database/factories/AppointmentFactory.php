<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointment>
 */
class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'doctor_id' => User::factory(),
            'date_heure' => $this->faker->dateTimeBetween('now', '+3 months'),
            'status' => $this->faker->randomElement(['Planifié', 'Confirmé', 'Annulé', 'Honoré', 'Non Honoré']),
            'motif' => $this->faker->randomElement([
                'Consultation générale',
                'Visite de contrôle',
                'Lecture de résultats d\'analyses',
                'Première consultation',
                'Suivi post-opératoire',
            ]),
            'notes' => $this->faker->optional(0.7)->sentence(),
        ];
    }
}
