<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('candidatures', function (Blueprint $table) {
            $table->id('id_candidature');

            $table->text('programme')->nullable();
            $table->string('photo')->nullable();

            $table->string('cnib_pdf');
            $table->string('casier_judiciaire_pdf');
            $table->string('attestation_inscription_pdf');

            // dossier administratif
            $table->enum('statut', [
                'en_attente',
                'validee',
                'rejetee'
            ])->default('en_attente');

            // résultat électoral
            $table->enum('resultat', [
                'en_attente',
                'elu',
                'eliminee',
                'second_tour'
            ])->default('en_attente');

            $table->foreignId('id_user')
                ->constrained('users', 'id')
                ->onDelete('cascade');

            $table->foreignId('id_election')
                ->constrained('elections', 'id_election')
                ->onDelete('cascade');

            $table->unique(['id_user', 'id_election']);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidatures');
    }
};