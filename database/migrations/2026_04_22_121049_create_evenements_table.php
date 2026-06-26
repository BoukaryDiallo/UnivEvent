<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evenements', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | INFOS PRINCIPALES
            |--------------------------------------------------------------------------
            */
            $table->string('titre');
            $table->text('description')->nullable();

            $table->enum('type', ['conference', 'concours']);

            $table->dateTime('date_debut');
            $table->dateTime('date_fin')->nullable();

            $table->string('lieu')->nullable();

            /*
            |--------------------------------------------------------------------------
            | VISIBILITÉ & ACCÈS
            |--------------------------------------------------------------------------
            */

            // public = visible par tous
            // prive = seulement rôles autorisés
            // restreint = validation inscription requise
            $table->enum('visibilite', ['public', 'prive', 'restreint'])
                ->default('public');

            // public cible principal (info + filtrage rapide)
            $table->string('public_cible')->default('tous');

            /*
            |--------------------------------------------------------------------------
            | STATUT ÉVÉNEMENT
            |--------------------------------------------------------------------------
            */
            $table->enum('statut', ['brouillon', 'publie', 'cloture'])
                ->default('brouillon');

            /*
            |--------------------------------------------------------------------------
            | RELATION CREATEUR
            |--------------------------------------------------------------------------
            */
            $table->foreignId('cree_par')
                ->constrained('users')
                ->onDelete('cascade');

            /*
            |--------------------------------------------------------------------------
            | OPTIONS AVANCÉES (SCALABLE)
            |--------------------------------------------------------------------------
            */

            // inscription obligatoire ?
            $table->boolean('inscription_requise')->default(true);

            // capacité max participants
            $table->unsignedInteger('capacite_max')->nullable();

            // QR code activation event (futur usage check-in)
            $table->boolean('checkin_active')->default(false);

            /*
            |--------------------------------------------------------------------------
            | TIMESTAMPS
            |--------------------------------------------------------------------------
            */
            $table->timestamps();

            // optimisation requêtes fréquentes
            $table->index(['type', 'statut']);
            $table->index(['visibilite']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evenements');
    }
};
