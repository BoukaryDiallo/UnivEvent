<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emploi_du_temps', function (Blueprint $table) {
             $table->id();
            $table->string('titre');
            $table->enum('semestre', ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10']);
            $table->string('groupe')->nullable();
            $table->enum('statut', ['Brouillon','Publié','Archivé'])->default('Brouillon');
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();

            $table->foreignId('annee_academique_id')->constrained()->onDelete('cascade');
            $table->foreignId('filiere_id')->constrained('filieres', 'id_filiere')->onDelete('cascade');
            $table->foreignId('niveau_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('set null');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emploi_du_temps');
    }
};