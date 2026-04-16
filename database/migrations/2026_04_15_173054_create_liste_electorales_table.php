<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('liste_electorales', function (Blueprint $table) {
        $table->id();

        $table->unsignedBigInteger('id_election');
        $table->unsignedBigInteger('id_etudiant');

        // 📌 snapshot important
        $table->string('statut_snapshot');

        $table->timestamps();

        // 🔒 un étudiant = une seule entrée par élection
        $table->unique(['id_election', 'id_etudiant']);

        // FK
        $table->foreign('id_election')
            ->references('id_election')
            ->on('elections')
            ->onDelete('cascade');

        $table->foreign('id_etudiant')
            ->references('id')
            ->on('etudiants')
            ->onDelete('cascade');
    });
    
    }

    public function down(): void
    {
        Schema::dropIfExists('liste_electorales');
    }
};