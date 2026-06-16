<?php

namespace Database\Factories;

use App\Models\ExamResult;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExamResult>
 */
class ExamResultFactory extends Factory
{
    protected $model = ExamResult::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'consultation_id' => Consultation::factory(),
            'doctor_id' => User::factory(),
            'type_examen' => $this->faker->randomElement(['Bilan Sanguin', 'Radiographie Thoracique', 'Échographie Abdominale', 'IRM Cérébrale']),
            'date_examen' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'results' => $this->faker->paragraph(3),
            'file_path' => 'exams/' . $this->faker->uuid() . '.pdf',
            'status' => $this->faker->randomElement(['En attente', 'Disponible', 'Validé']),
        ];
    }

    /**
     * Examen prescrit hors consultation ou en attente de rattachement.
     */
    public function withoutConsultation(): static
    {
        return $this->state(fn (array $attributes) => [
            'consultation_id' => null,
        ]);
    }
}
