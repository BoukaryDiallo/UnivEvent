<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seances', function (Blueprint $table) {
            $table->id();
            $table->enum('jour_semaine', ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']);
            $table->enum('type_seance', ['CM', 'TD', 'TP', 'Examen']);
            $table->text('description')->nullable();

            $table->foreignId('emploi_du_temps_id')->constrained()->onDelete('cascade');
            $table->foreignId('creneau_id')->constrained('creneaux')->onDelete('restrict');
            $table->foreignId('salle_id')->constrained()->onDelete('restrict');
            $table->foreignId('matiere_id')->constrained()->onDelete('restrict');
            $table->foreignId('enseignant_id')->constrained('enseignants')->onDelete('restrict');
            $table->foreignId('prise_id')->nullable()->constrained('prises')->onDelete('set null');

            $table->timestamps();

            $table->unique(['emploi_du_temps_id', 'jour_semaine'], 'unique_edt_jour');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seances');
    }
};
