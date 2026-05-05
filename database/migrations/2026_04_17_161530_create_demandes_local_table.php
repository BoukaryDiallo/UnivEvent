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
        Schema::create('demandes_local', function (Blueprint $table) {
            $table->id();
            $table->foreignId('club_id')->constrained()->onDelete('cascade');
            $table->string('salle_souhaitee');
            $table->dateTime('date');
            $table->enum('statut', ['en_attente', 'approuvée', 'rejetée'])->default('en_attente');
            $table->text('commentaire')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandes_local');
    }
};
