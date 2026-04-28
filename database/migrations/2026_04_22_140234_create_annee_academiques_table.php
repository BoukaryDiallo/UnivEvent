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
        Schema::create('annee_academiques', function (Blueprint $table) {
            $table->id();
            $table->string('libelle', 9)->unique();
            $table->string('date_debut', 4);
            $table->string('date_fin', 4);
            $table->boolean('est_courante')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('annee_academiques');
    }
};
