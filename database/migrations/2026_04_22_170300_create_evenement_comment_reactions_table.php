<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evenement_comment_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comment_id')->constrained('evenement_comments')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type')->default('like');
            $table->timestamps();

            $table->unique(['comment_id', 'user_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evenement_comment_reactions');
    }
};
