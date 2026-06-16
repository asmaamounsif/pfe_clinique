<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Patient>
 */
class PatientFactory extends Factory
{
    protected $model = Patient::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(), // Par défaut, associe un compte utilisateur
            'social_security_number' => $this->faker->unique()->numerify('1###########'), // Format français simplifié
            'date_of_birth' => $this->faker->date('Y-m-d', '-18 years'), // Majeur par défaut
            'gender' => $this->faker->randomElement(['M', 'F', 'Autre']),
            'address' => $this->faker->address(),
            'phone' => $this->faker->phoneNumber(),
            'blood_type' => $this->faker->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            'emergency_contact_name' => $this->faker->name(),
            'emergency_contact_phone' => $this->faker->phoneNumber(),
        ];
    }

    /**
     * Patient sans compte utilisateur (sans accès en ligne).
     */
    public function withoutUser(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => null,
        ]);
    }
}
