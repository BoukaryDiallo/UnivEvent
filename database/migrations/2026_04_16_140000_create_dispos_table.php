<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('jour');
            $table->time('debut');
            $table->time('fin');
            $table->string('niveau', 20);
            $table->string('motif')->nullable();
            $table->json('avant')->nullable();
            $table->timestamp('maj_le')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'jour']);
            $table->index(['user_id', 'deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispos');
    }
};
