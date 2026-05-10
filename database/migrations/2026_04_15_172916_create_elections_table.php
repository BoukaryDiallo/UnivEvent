<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('elections', function (Blueprint $table) {

            $table->id('id_election');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->dateTime('date_debut');
            $table->dateTime('date_fin');
            $table->enum('type', ['ufr', 'promotion']);

            $table->foreignId('id_ufr')
                ->nullable()
                ->constrained('ufrs', 'id_ufr')
                ->nullOnDelete();

            $table->foreignId('id_filiere')
                ->nullable()
                ->constrained('filieres', 'id_filiere')
                ->nullOnDelete();

            $table->enum('statut', [
            'brouillon',
            'liste_generee',
            'planifiee',
            'ouverte',
            'cloturee',
            'terminee',
            'second_tour',
            'second_tour_planifie',
        ])->default('brouillon');
            $table->integer('tour')->default(1);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('elections');
    }
};