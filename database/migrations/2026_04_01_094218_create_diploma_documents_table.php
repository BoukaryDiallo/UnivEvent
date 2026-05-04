<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diploma_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diploma_request_id')->constrained()->cascadeOnDelete();
            $table->string('type', 40);
            $table->string('path');
            $table->string('original_name');
            $table->string('mime', 100);
            $table->unsignedBigInteger('size');
            $table->timestamp('validated_at')->nullable();
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['diploma_request_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diploma_documents');
    }
};
