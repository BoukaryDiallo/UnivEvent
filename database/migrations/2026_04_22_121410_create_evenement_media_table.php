<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evenement_medias', function (Blueprint $table) {
            $table->id();

            $table->foreignId('evenement_id')
                ->constrained('evenements')
                ->onDelete('cascade');

            $table->enum('type', ['image', 'pdf', 'autre']);

            $table->string('chemin_fichier');

            $table->string('nom_original')->nullable();

            $table->integer('taille')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evenement_medias');
    }
};
