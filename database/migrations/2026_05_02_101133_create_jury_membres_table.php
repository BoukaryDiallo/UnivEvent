<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jury_membres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jury_id')->constrained('jurys')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('role', ['president', 'rapporteur', 'membre'])->default('membre');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jury_membres');
    }
};
