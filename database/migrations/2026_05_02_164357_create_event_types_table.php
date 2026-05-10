<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('event_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->json('features')->nullable(); // Stores { has_jury: bool, has_speaker: bool, ... }
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed default types
        DB::table('event_types')->insert([
            [
                'name' => 'Conférence',
                'slug' => 'conference',
                'description' => 'Événement de type conférence, séminaire ou atelier.',
                'features' => json_encode([
                    'has_organizer' => true,
                    'has_speaker' => true,
                    'has_participants' => true,
                    'has_jury' => false,
                    'has_certification' => true,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Concours',
                'slug' => 'concours',
                'description' => 'Événement de type compétition avec jury et délibération.',
                'features' => json_encode([
                    'has_organizer' => true,
                    'has_speaker' => false,
                    'has_participants' => true,
                    'has_jury' => true,
                    'has_certification' => true,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_types');
    }
};
