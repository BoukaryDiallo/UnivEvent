<?php

namespace Database\Factories;

use App\Enums\DiplomaRequestStatus;
use App\Models\DiplomaRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<DiplomaRequest>
 */
class DiplomaRequestFactory extends Factory
{
    protected $model = DiplomaRequest::class;

    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'tracking_code' => strtoupper(Str::random(10)),
            'diploma_type' => fake()->randomElement(['licence', 'master', 'doctorat']),
            'academic_year' => '2024-2025',
            'status' => DiplomaRequestStatus::Draft,
            'submitted_at' => null,
        ];
    }

    public function submitted(): static
    {
        return $this->state(fn () => [
            'status' => DiplomaRequestStatus::Submitted,
            'submitted_at' => now(),
        ]);
    }

    public function readyForPickup(): static
    {
        return $this->state(fn () => [
            'status' => DiplomaRequestStatus::ReadyForPickup,
            'submitted_at' => now()->subDays(5),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => [
            'status' => DiplomaRequestStatus::Rejected,
            'submitted_at' => now()->subDays(2),
            'rejected_reason' => fake()->sentence(),
        ]);
    }
}
