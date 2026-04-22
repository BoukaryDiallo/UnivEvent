<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('semestre', 24);
            $table->string('annee_academique', 9);
            $table->unsignedTinyInteger('max_jour')->nullable();
            $table->unsignedSmallInteger('max_semaine')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'annee_academique']);
            $table->unique(['user_id', 'semestre', 'annee_academique']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('charges');
    }
};
