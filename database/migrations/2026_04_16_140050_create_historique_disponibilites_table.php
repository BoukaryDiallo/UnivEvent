<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historique_disponibilites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dispo_id')->constrained('dispos')->cascadeOnDelete();
            $table->foreignId('enseignant_id')->constrained('users')->cascadeOnDelete();
            $table->string('action', 20);
            $table->text('description');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['enseignant_id', 'created_at']);
            $table->index(['dispo_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historique_disponibilites');
    }
};
