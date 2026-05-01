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
        Schema::create('clubs', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->enum('type', ['sportif','culturel','scientifique','humanitaire','autre']);
            $table->text('description')->nullable();
            $table->enum('statut', ['en_attente','actif','suspendu','dissous'])->default('en_attente');
            $table->foreignId('responsable_id')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clubs');
    }
};
