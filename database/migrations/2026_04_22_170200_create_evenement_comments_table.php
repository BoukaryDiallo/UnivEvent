<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evenement_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evenement_id')->constrained('evenements')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('evenement_comments')->cascadeOnDelete();
            $table->text('contenu');
            $table->timestamps();

            $table->index(['evenement_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evenement_comments');
    }
};
