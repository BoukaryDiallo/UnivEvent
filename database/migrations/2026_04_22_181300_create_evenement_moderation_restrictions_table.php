<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evenement_moderation_restrictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evenement_id')->constrained('evenements')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->boolean('comments_blocked')->default(false);
            $table->boolean('replies_blocked')->default(false);
            $table->boolean('messages_blocked')->default(false);
            $table->boolean('muted')->default(false);
            $table->string('status')->default('active');
            $table->text('reason')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('lifted_at')->nullable();
            $table->foreignId('lifted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['evenement_id', 'user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evenement_moderation_restrictions');
    }
};
