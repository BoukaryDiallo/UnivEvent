<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jury_panels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evenement_id')->unique()->constrained('evenements')->cascadeOnDelete();
            $table->foreignId('president_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('admission_average', 5, 2)->default(10);
            $table->unsignedInteger('seats_count')->nullable();
            $table->string('ranking_mode')->default('final_note');
            $table->string('tie_break_rule')->default('name');
            $table->boolean('criteria_locked')->default(false);
            $table->timestamp('criteria_locked_at')->nullable();
            $table->timestamp('scoring_opened_at')->nullable();
            $table->timestamp('scoring_closed_at')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('validation_note')->nullable();
            $table->timestamps();
        });

        Schema::create('jury_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jury_panel_id')->constrained('jury_panels')->cascadeOnDelete();
            $table->string('nom');
            $table->text('description')->nullable();
            $table->decimal('bareme', 6, 2)->default(20);
            $table->decimal('coefficient', 6, 2)->default(1);
            $table->unsignedInteger('ordre')->default(1);
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });

        Schema::create('jury_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jury_panel_id')->constrained('jury_panels')->cascadeOnDelete();
            $table->foreignId('jury_criterion_id')->constrained('jury_criteria')->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('jury_user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('score', 6, 2)->nullable();
            $table->text('commentaire')->nullable();
            $table->string('status')->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reopened_at')->nullable();
            $table->timestamps();

            $table->unique(['jury_criterion_id', 'participant_id', 'jury_user_id'], 'jury_scores_unique_rating');
        });

        Schema::create('jury_deliberations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jury_panel_id')->constrained('jury_panels')->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('pending');
            $table->text('reason');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jury_deliberations');
        Schema::dropIfExists('jury_scores');
        Schema::dropIfExists('jury_criteria');
        Schema::dropIfExists('jury_panels');
    }
};
