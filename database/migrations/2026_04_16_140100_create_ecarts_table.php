<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ecarts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->date('date_fin')->nullable();
            $table->time('debut');
            $table->time('fin');
            $table->string('niveau', 20);
            $table->string('motif');
            $table->timestamps();

            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'date_fin']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ecarts');
    }
};
