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
        Schema::create('resultats', function (Blueprint $table) {
            $table->id('id_resultat');

            $table->unsignedBigInteger('id_election');
            $table->unsignedBigInteger('id_candidature');

            $table->integer('tour');
            $table->integer('nb_voix');
            $table->decimal('pourcentage', 5, 2);
            $table->integer('rang');

            $table->enum('statut_publication', ['brouillon', 'officiel'])
                ->default('brouillon');

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('id_election')
                ->references('id_election')
                ->on('elections')
                ->onDelete('cascade');

            $table->foreign('id_candidature')
                ->references('id_candidature')
                ->on('candidatures')
                ->onDelete('cascade');

            $table->unique(['id_election', 'id_candidature', 'tour']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resultats');
    }
};
