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

            // Dossier
            $table->text('programme')->nullable();
            $table->string('photo')->nullable();

            // Pièces justificatives (PDF)
            $table->string('cnib_pdf');
            $table->string('casier_judiciaire_pdf');
            $table->string('attestation_inscription_pdf');

            $table->enum('statut', ['en_attente', 'validee', 'rejetee'])
                  ->default('en_attente');

            // Relations
            $table->foreignId('id_user')
                ->constrained('users', 'id')
                ->onDelete('cascade');

            $table->foreignId('id_election')
                ->constrained('elections', 'id_election')
                ->onDelete('cascade');

            // un seul dossier par élection
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