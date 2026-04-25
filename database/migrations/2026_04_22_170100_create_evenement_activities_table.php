<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evenement_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evenement_id')->constrained('evenements')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type');
            $table->string('label');
            $table->text('description')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['evenement_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evenement_activities');
    }
};
