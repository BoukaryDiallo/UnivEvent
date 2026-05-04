<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diploma_request_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diploma_request_id')->constrained()->cascadeOnDelete();
            $table->string('from_status', 32)->nullable();
            $table->string('to_status', 32);
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['diploma_request_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diploma_request_events');
    }
};
