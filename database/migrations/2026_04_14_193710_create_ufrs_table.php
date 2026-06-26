<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ufrs', function (Blueprint $table) {
            $table->id('id_ufr');

            $table->string('nom')->unique();

            $table->timestamps();
            $table->softDeletes(); // 👈 IMPORTANT
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ufrs');
    }
};
