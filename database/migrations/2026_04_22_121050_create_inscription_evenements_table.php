<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inscription_evenements', function (Blueprint $table) {
            $table->id();

            $table->foreignId('evenement_id')
                ->constrained('evenements')
                ->onDelete('cascade');

            $table->foreignId('utilisateur_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->json('donnees_formulaire')->nullable();

            $table->enum('statut', ['en_attente', 'accepte', 'refuse'])
                ->default('en_attente');

            $table->timestamps();

            $table->unique(['evenement_id', 'utilisateur_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscription_evenements');
    }
};
