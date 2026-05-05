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
        Schema::create('departements', function (Blueprint $table) {
            $table->id('id_departement');

            $table->unsignedBigInteger('id_ufr');
            $table->string('nom');

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('id_ufr')
                ->references('id_ufr')
                ->on('ufrs')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('departements');
    }
};