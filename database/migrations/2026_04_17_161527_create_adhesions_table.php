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
        Schema::create('adhesions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('club_id')->constrained()->onDelete('cascade');
            $table->enum('statut', ['en_attente', 'approuvee', 'rejetee', 'quittee'])->default('en_attente');
            $table->enum('role_dans_club', ['membre', 'vice_president', 'tresorier', 'secretaire'])->default('membre');
            $table->timestamp('date_adhesion')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'club_id']); // contrainte unicité
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adhesions');
    }
};
