<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pickup_appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diploma_request_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('pickup_slot_id')->constrained()->cascadeOnDelete();
            $table->timestamp('confirmed_at');
            $table->timestamp('delivered_at')->nullable();
            $table->foreignId('delivered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('receipt_path')->nullable();
            $table->timestamps();

            $table->index('pickup_slot_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pickup_appointments');
    }
};
