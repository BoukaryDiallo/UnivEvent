<?php

use App\Enums\DiplomaRequestStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diploma_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('tracking_code', 20)->unique();
            $table->string('diploma_type', 50);
            $table->string('academic_year', 9);
            $table->string('status', 32)->default(DiplomaRequestStatus::Draft->value);
            $table->timestamp('submitted_at')->nullable();
            $table->text('rejected_reason')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'submitted_at']);
            $table->index('owner_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diploma_requests');
    }
};
