<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AuditLog>
 */
class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tables = ['patients', 'medical_records', 'consultations', 'appointments'];
        $table = $this->faker->randomElement($tables);
        $action = $this->faker->randomElement(['CREATE', 'UPDATE', 'DELETE', 'VIEW']);

        return [
            'user_id' => User::factory(),
            'action' => $action,
            'table_affected' => $table,
            'record_id' => $this->faker->numberBetween(1, 1000),
            'old_values' => $action === 'CREATE' ? null : ['status' => 'old_value', 'updated_at' => '2026-06-01 10:00:00'],
            'new_values' => $action === 'DELETE' ? null : ['status' => 'new_value', 'updated_at' => '2026-06-04 12:00:00'],
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
        ];
    }

    /**
     * Log d'action anonyme ou système.
     */
    public function anonymous(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => null,
        ]);
    }
}
