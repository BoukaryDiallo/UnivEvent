<?php

namespace Database\Factories;

use App\Enums\DocumentType;
use App\Models\DiplomaDocument;
use App\Models\DiplomaRequest;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<DiplomaDocument>
 */
class DiplomaDocumentFactory extends Factory
{
    protected $model = DiplomaDocument::class;

    public function definition(): array
    {
        return [
            'diploma_request_id' => DiplomaRequest::factory(),
            'type' => fake()->randomElement(DocumentType::cases()),
            'path' => 'diplomas/documents/'.Str::uuid().'.pdf',
            'original_name' => fake()->word().'.pdf',
            'mime' => 'application/pdf',
            'size' => fake()->numberBetween(50_000, 2_000_000),
        ];
    }

    public function validated(): static
    {
        return $this->state(fn () => [
            'validated_at' => now(),
        ]);
    }
}
