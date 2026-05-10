<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->time('debut');
            $table->time('fin');
            $table->string('source', 100);
            $table->string('ref', 100)->nullable();
            $table->string('motif')->nullable();
            $table->string('niveau', 20);
            $table->timestamp('libere_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'libere_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prises');
    }
};
